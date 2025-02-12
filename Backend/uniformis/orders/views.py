from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderItem
from offers.models import Coupon,CouponUsage
from user_app.models import Address
from .serializers import CartSerializer, OrderSerializer,AddressSerializer,OrderItemSerializer
from products.models import ProductSizeColor
from rest_framework.permissions import IsAdminUser
from .payment_gateways import client, create_razorpay_order
import razorpay
from django.conf import settings
import logging
from rest_framework.exceptions import ValidationError
from django.db import transaction

logger = logging.getLogger(__name__)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_or_create_cart(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_or_create_cart()
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        variant = get_object_or_404(ProductSizeColor, id=variant_id)
        
        if variant.stock_quantity < quantity:
            return Response(
                {'error': 'Not enough stock available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity = min(cart_item.quantity + quantity, variant.stock_quantity)
            cart_item.save()

        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = self.get_or_create_cart()
        item_id = request.data.get('item_id')
        
        try:
            cart_item = CartItem.objects.get(cart=cart, id=item_id)
            cart_item.delete()
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in cart'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        cart = self.get_or_create_cart()
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            cart_item = CartItem.objects.get(cart=cart, id=item_id)
            if quantity <= 0:
                cart_item.delete()
            else:
                if quantity > cart_item.variant.stock_quantity:
                    return Response(
                        {'error': 'Not enough stock available'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = quantity
                cart_item.save()

            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in cart'},
                status=status.HTTP_404_NOT_FOUND
            )

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='create_razorpay_order')
    def create_razorpay_order(self, request):
        try:
            logger.info("Creating Razorpay order for user: %s", request.user)
            cart = get_object_or_404(Cart, user=request.user)
            
            if not cart.items.exists():
                return Response(
                    {'error': 'Cart is empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            total_amount = cart.get_total_price()
            razorpay_order = create_razorpay_order(total_amount)
            return Response(razorpay_order)
        except Exception as e:
            logger.error("Error creating Razorpay order: %s", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        try:
            cart = get_object_or_404(Cart, user=self.request.user)
            
            if not cart.items.exists():
                return Response(
                    {'error': 'Cart is empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            address_id = request.data.get('address_id')
            payment_method = request.data.get('payment_method')
            coupon_code = request.data.get('coupon_code')

            # Calculate totals
            subtotal = sum(item.get_total_price() for item in cart.items.all())
            total_discount = 0
            coupon_discount = 0
            # Apply coupon if provided
            coupon = None
            if coupon_code:
                try:
                    coupon = Coupon.objects.get(
                        code=coupon_code,
                        is_active=True,
                        valid_from__lte=timezone.now(),
                        valid_until__gte=timezone.now()
                    )
                    if subtotal >= coupon.minimum_purchase:
                        coupon_discount = (subtotal * coupon.discount_percentage) / 100
                except Coupon.DoesNotExist:
                    return Response(
                        {'error': 'Invalid coupon code'},
                        status=status.HTTP_400_BAD_REQUEST
                    )  
                
            # Verify Razorpay payment if card payment
            if payment_method == 'card':
                payment_data = {
                    'razorpay_payment_id': request.data.get('payment_id'),
                    'razorpay_order_id': request.data.get('razorpay_order_id'),
                    'razorpay_signature': request.data.get('signature')
                }
                
                try:
                    client.utility.verify_payment_signature(payment_data)
                except razorpay.errors.SignatureVerificationError as e:
                    return Response(
                        {'error': 'Invalid payment signature'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Create order
            with transaction.atomic():
                order = Order.objects.create(
                    user=self.request.user,
                    address_id=address_id,
                    payment_method=payment_method,
                    subtotal=subtotal,
                    discount_amount=total_discount,
                    coupon_discount=coupon_discount,
                    coupon=coupon,
                    delivery_charges=0,
                    payment_status='completed' if payment_method == 'card' else 'pending'
                )

            # Create order items and update stock
            for cart_item in cart.items.all():
                # Calculate item discount
                original_price = cart_item.variant.price * cart_item.quantity
                discount_amount = self.calculate_item_discount(cart_item)

                OrderItem.objects.create(
                    order=order,
                    variant=cart_item.variant,
                    product_name=cart_item.variant.product.name,
                    size=cart_item.variant.size.name,
                    color=cart_item.variant.color.name,
                    quantity=cart_item.quantity,
                    original_price=original_price,
                    discount_amount=discount_amount,
                    final_price=original_price - discount_amount
                )
                total_discount += discount_amount
                # Update order with final discount amount
                order.discount_amount = total_discount
                order.save()

                # Create coupon usage record if applicable
                if coupon:
                    CouponUsage.objects.create(coupon=coupon, user=self.request.user)                
                # Update stock in a transaction
                with transaction.atomic():
                    variant = cart_item.variant
                    if variant.stock_quantity < cart_item.quantity:
                        raise ValidationError(f"Not enough stock for {variant.product.name}")
                    variant.stock_quantity -= cart_item.quantity
                    variant.save()

            # Clear cart
            cart.items.all().delete()

            serializer = self.get_serializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error("Error creating order: %s", str(e))
            return Response(
                {'error': "Failed to create order"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

    def calculate_item_discount(self, cart_item):
        now = timezone.now()
        product = cart_item.variant.product
        
        # Get product offer
        product_offer = product.offers.filter(
            offer_type='PRODUCT',
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).order_by('-discount_percentage').first()

        # Get category offer
        category_offer = product.category.offers.filter(
            offer_type='CATEGORY',
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).order_by('-discount_percentage').first()

        # Get highest discount percentage
        discount_percentage = 0
        if product_offer and category_offer:
            discount_percentage = max(
                product_offer.discount_percentage,
                category_offer.discount_percentage
            )
        elif product_offer:
            discount_percentage = product_offer.discount_percentage
        elif category_offer:
            discount_percentage = category_offer.discount_percentage

        # Calculate discount amount
        original_price = cart_item.variant.price * cart_item.quantity
        return (original_price * discount_percentage) / 100


    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        if not order.can_cancel():
            return Response(
                {'error': 'Order cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        
        return Response({'status': 'Order cancelled'})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.update_status()  
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Update status for all orders
        for order in queryset:
            order.update_status('processing') 
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AdminOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Order.objects.select_related('user').prefetch_related('items').all().order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        
        try:
            order = self.get_object()
            new_status = request.data.get('status')
            print("the request in the update status",new_status)
            if new_status not in dict(Order.STATUS_CHOICES):
                return Response(
                    {'error': 'Invalid status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            order.status = new_status
            order.save()
            return Response(self.get_serializer(order).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        order = self.get_object()
        if order.payment_method == 'cod':
            return Response(
                {'error': 'Cannot refund COD orders'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if order.payment_status == 'refunded':
            return Response(
                {'error': 'Order is already refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        order.payment_status = 'refunded'
        order.save()
        return Response({'status': 'Refund processed'})
    
@action(detail=False, methods=['post'])
def razorpay_webhook(self, request):
    try:
        payload = request.body.decode('utf-8')
        signature = request.headers.get('X-Razorpay-Signature')

        client.utility.verify_webhook_signature(payload, signature, settings.RAZORPAY_WEBHOOK_SECRET)
        
        event = json.loads(payload)
        if event['event'] == 'payment.captured':
            payment_id = event['payload']['payment']['entity']['id']
            order = Order.objects.get(razorpay_payment_id=payment_id)
            order.payment_status = 'completed'
            order.save()
            
        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    


#SalesReport
# Add this to your views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import Order, OrderItem

class SalesReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def generate(self, request):
        report_type = request.query_params.get('type', 'daily')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Set date range based on report type
        if report_type == 'daily':
            start_date = timezone.now().date()
            end_date = start_date + timedelta(days=1)
        elif report_type == 'weekly':
            start_date = timezone.now().date() - timedelta(days=7)
            end_date = timezone.now().date() + timedelta(days=1)
        elif report_type == 'monthly':
            start_date = timezone.now().date().replace(day=1)
            end_date = (start_date + timedelta(days=32)).replace(day=1)
        elif report_type == 'yearly':
            start_date = timezone.now().date().replace(month=1, day=1)
            end_date = start_date.replace(year=start_date.year + 1)
        elif report_type == 'custom':
            if not start_date or not end_date:
                return Response(
                    {"error": "Start date and end date are required for custom reports"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            start_date = timezone.datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = timezone.datetime.strptime(end_date, "%Y-%m-%d").date() + timedelta(days=1)

        # Query orders within date range
        orders = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lt=end_date
        )
        
        # Calculate totals
        total_sales = orders.aggregate(total=Sum('final_total'))['total'] or 0
        total_orders = orders.count()
        total_discount = orders.aggregate(
            total=Sum('discount_amount') + Sum('coupon_discount')
        )['total'] or 0

        # Get product-wise sales data
        product_sales = OrderItem.objects.filter(
            order__in=orders
        ).values(
            'product_name',
            'variant__product__category__name'
        ).annotate(
            total_sales=Sum('final_price'),
            total_orders=Count('id')
        ).order_by('-total_sales')

        return Response({
            "total_sales": total_sales,
            "total_orders": total_orders,
            "total_discount": total_discount,
            "products": product_sales
        })