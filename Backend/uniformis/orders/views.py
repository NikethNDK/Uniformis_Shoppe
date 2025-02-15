from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.db.models import Sum, Count,F
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderItem,Wishlist,WishlistItem,Wallet,WalletTransaction
from offers.models import Coupon,CouponUsage
from user_app.models import Address
from .serializers import CartSerializer, OrderSerializer,AddressSerializer,OrderItemSerializer,WishlistSerializer,WalletTransactionSerializer,WalletSerializer
from products.models import ProductSizeColor
from rest_framework.permissions import IsAdminUser
from .payment_gateways import client, create_razorpay_order
import razorpay
from django.conf import settings
import logging
from rest_framework.exceptions import ValidationError
from django.db import transaction
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from django.http import HttpResponse
import csv
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.http import FileResponse
import json
from django.db import IntegrityError


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


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def get_or_create_wishlist(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        wishlist = self.get_or_create_wishlist()
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            variant = get_object_or_404(ProductSizeColor, id=variant_id)
            
            if variant.stock_quantity < quantity:
                return Response(
                    {'error': 'Not enough stock available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            wishlist_item, created = WishlistItem.objects.get_or_create(
                wishlist=wishlist,
                variant=variant,
                defaults={'quantity': quantity}
            )

            if not created:
                wishlist_item.quantity = min(wishlist_item.quantity + quantity, variant.stock_quantity)
                wishlist_item.save()

            serializer = self.get_serializer(wishlist)
            return Response(serializer.data)
            
        except IntegrityError:
            return Response(
                {'error': 'Item already exists in wishlist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        wishlist = self.get_or_create_wishlist()
        item_id = request.data.get('item_id')
        
        try:
            wishlist_item = wishlist.wishitems.get(id=item_id)  # Changed to wishitems
            wishlist_item.delete()
            serializer = self.get_serializer(wishlist)
            return Response(serializer.data)
        except WishlistItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in wishlist'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        wishlist = self.get_or_create_wishlist()
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            wishlist_item = wishlist.wishitems.get(id=item_id)  # Changed to wishitems
            
            if quantity <= 0:
                wishlist_item.delete()
            else:
                if quantity > wishlist_item.variant.stock_quantity:
                    return Response(
                        {'error': 'Not enough stock available'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                wishlist_item.quantity = quantity
                wishlist_item.save()

            serializer = self.get_serializer(wishlist)
            return Response(serializer.data)
        except WishlistItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in wishlist'},
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
            user = self.request.user
            cart = get_object_or_404(Cart, user=user)
            
            if not cart.items.exists():
                return Response(
                    {'error': 'Cart is empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
            address_id = request.data.get('address_id')
            payment_method = request.data.get('payment_method')
            coupon_code = request.data.get('coupon_code')
    
            # Validate address
            try:
                address = Address.objects.get(id=address_id, user=user)
            except Address.DoesNotExist:
                return Response(
                    {'error': 'Invalid address'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
            # Calculate totals
            subtotal = cart.get_total_price()
            final_total = subtotal
            total_discount = 0
            coupon_discount = 0
            coupon = None
    
            # Apply coupon if provided
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
                        final_total -= coupon_discount
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
                except razorpay.errors.SignatureVerificationError:
                    return Response(
                        {'error': 'Invalid payment signature'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
    
            # Create order and items in a transaction
            with transaction.atomic():
                # Create order
                order = Order.objects.create(
                    user=user,
                    address=address,
                    payment_method=payment_method,
                    subtotal=subtotal,
                    discount_amount=total_discount,
                    coupon_discount=coupon_discount,
                    coupon=coupon,
                    final_total=final_total,
                    delivery_charges=0,
                    payment_status='completed' if payment_method == 'card' else 'pending'
                )
    
                # Create order items and update stock
                for cart_item in cart.items.all():
                    # Calculate item discount
                    original_price = cart_item.variant.price * cart_item.quantity
                    item_discount = self.calculate_item_discount(cart_item)
                    final_price = original_price - item_discount
                    total_discount += item_discount
    
                    OrderItem.objects.create(
                        order=order,
                        variant=cart_item.variant,
                        product_name=cart_item.variant.product.name,
                        size=cart_item.variant.size.name,
                        color=cart_item.variant.color.name,
                        quantity=cart_item.quantity,
                        original_price=original_price,
                        discount_amount=item_discount,
                        final_price=final_price
                    )
    
                    # Update stock
                    variant = cart_item.variant
                    if variant.stock_quantity < cart_item.quantity:
                        raise ValidationError(f"Not enough stock for {variant.product.name}")
                    variant.stock_quantity -= cart_item.quantity
                    variant.save()
    
                # Update order with final amounts
                order.discount_amount = total_discount
                order.final_total = subtotal - total_discount - coupon_discount
                order.save()
    
                # Create coupon usage record if applicable
                if coupon:
                    CouponUsage.objects.create(coupon=coupon, user=user)
    
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
    def return_order(self, request, pk=None):
        order = self.get_object()
        return_reason = request.data.get('return_reason')

        if not return_reason:
            return Response({'error': 'Return reason is required'}, status=status.HTTP_400_BAD_REQUEST)

        if order.status != 'delivered':
            return Response({'error': 'Only delivered orders can be returned'}, status=status.HTTP_400_BAD_REQUEST)

        if order.is_returned:
            return Response({'error': 'This order has already been returned'}, status=status.HTTP_400_BAD_REQUEST)

        # Process the return
        order.is_returned = True
        order.return_reason = return_reason
        order.status = 'returned'
        order.save()

        # Increase stock
        for item in order.items.all():
            item.variant.stock_quantity += item.quantity
            item.variant.save()

        return Response({'message': 'Return request submitted successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()

        if order.status == 'delivered':
            return Response({'error': 'Cannot cancel a delivered order'}, status=status.HTTP_400_BAD_REQUEST)

        if order.status == 'cancelled':
            return Response({'error': 'Order is already cancelled'}, status=status.HTTP_400_BAD_REQUEST)

        if not order.can_cancel():
            return Response({'error': 'Order cannot be cancelled. Cancellation is only allowed within 48 hours of placing the order'}, status=status.HTTP_400_BAD_REQUEST)

        # Update order status
        order.status = 'cancelled'
        order.save()

        # Increase stock
        for item in order.items.all():
            item.variant.stock_quantity += item.quantity
            item.variant.save()

        return Response({'message': 'Order cancelled successfully'}, status=status.HTTP_200_OK)

    # @action(detail=True, methods=['post'])
    # def cancel(self, request, pk=None):
    #     try:
    #         order = self.get_object()

    #         # Add more detailed validation
    #         if order.status == 'delivered':
    #             return Response(
    #                 {'error': 'Cannot cancel a delivered order'},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )

    #         if order.status == 'cancelled':
    #             return Response(
    #                 {'error': 'Order is already cancelled'},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )

    #         # Check if order is within cancellation window (2 days)
    #         if not order.can_cancel():
    #             return Response(
    #                 {'error': 'Order cannot be cancelled. Cancellation is only allowed within 48 hours of placing the order'},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )

    #         # Update order status
    #         order.status = 'cancelled'

    #         # If payment was already made, mark for refund
    #         if order.payment_status == 'completed':
    #             order.payment_status = 'refunded'

    #         order.save()

    #         # Return the updated order data
    #         serializer = self.get_serializer(order)
    #         return Response(serializer.data, status=status.HTTP_200_OK)

    #     except Exception as e:
    #         logger.error(f"Error cancelling order {pk}: {str(e)}")
    #         return Response(
    #             {'error': 'Failed to cancel order'},
    #             status=status.HTTP_500_INTERNAL_SERVER_ERROR
    #         )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
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
        # if order.payment_method == 'cod':
        #     return Response(
        #         {'error': 'Cannot refund COD orders'},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        
        if order.payment_status == 'refunded':
            return Response(
                {'error': 'Order is already refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process the refund
        wallet, created = Wallet.objects.get_or_create(user=order.user)
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=order.final_total,
            transaction_type='CREDIT',
            description=f'Refund for order #{order.order_number}'
        )
        wallet.balance += order.final_total
        wallet.save()
            
        order.payment_status = 'refunded'
        order.save()
        return Response({'status': 'Refund processed and credited to the wallet'})
    
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
    




# 

class SalesReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    
    def get_report_data(self, start_date, end_date):
        orders = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lt=end_date
        )
        
        total_sales = orders.aggregate(total=Sum('final_total'))['total'] or 0
        total_orders = orders.count()
        total_discount = orders.aggregate(
            total=Sum(F('discount_amount') + F('coupon_discount'))
            )['total'] or 0

        product_sales = OrderItem.objects.filter(
            order__in=orders
        ).values(
            'product_name',
            'variant__product__category__name'
        ).annotate(
            total_sales=Sum('final_price'),
            total_orders=Count('id')
        ).order_by('-total_sales')

        return {
            "total_sales": total_sales,
            "total_orders": total_orders,
            "total_discount": total_discount,
            "products": product_sales
        }

    def get_date_range(self, report_type, start_date=None, end_date=None):
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
                raise ValueError("Start date and end date are required for custom reports")
            start_date = timezone.datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = timezone.datetime.strptime(end_date, "%Y-%m-%d").date() + timedelta(days=1)
        
        return start_date, end_date

    @action(detail=False, methods=['get'])
    def generate(self, request):
        try:
            report_type = request.query_params.get('type', 'daily')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            start_date, end_date = self.get_date_range(report_type, start_date, end_date)
            report_data = self.get_report_data(start_date, end_date)
            
            return Response(report_data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Failed to generate report"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wallet.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def transactions(self, request):
        try:
            # create if it doesn't exist
            wallet, created = Wallet.objects.get_or_create(
                user=request.user,
                defaults={
                    'balance': 0  # default balance
                }
            )
            
            # Get transactions for the wallet
            transactions = wallet.transactions.all() 
            
            # Serialize the transactions
            serializer = WalletTransactionSerializer(transactions, many=True)
            
            return Response({
                'wallet_balance': wallet.balance,
                'transactions': serializer.data
            })
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch wallet transactions',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)































    # @action(detail=False, methods=['post'])
    # def create_from_cart(self, request):
    #     try:
    #         cart = get_object_or_404(Cart, user=self.request.user)
            
    #         if not cart.items.exists():
    #             return Response(
    #                 {'error': 'Cart is empty'},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )

    #         address_id = request.data.get('address_id')
    #         payment_method = request.data.get('payment_method')
    #         coupon_code = request.data.get('coupon_code')

    #         # Calculate totals
    #         subtotal = sum(item.get_total_price() for item in cart.items.all())
    #         total_discount = 0
    #         coupon_discount = 0
    #         # Apply coupon if provided
    #         coupon = None
    #         if coupon_code:
    #             try:
    #                 coupon = Coupon.objects.get(
    #                     code=coupon_code,
    #                     is_active=True,
    #                     valid_from__lte=timezone.now(),
    #                     valid_until__gte=timezone.now()
    #                 )
    #                 if subtotal >= coupon.minimum_purchase:
    #                     coupon_discount = (subtotal * coupon.discount_percentage) / 100
    #             except Coupon.DoesNotExist:
    #                 return Response(
    #                     {'error': 'Invalid coupon code'},
    #                     status=status.HTTP_400_BAD_REQUEST
    #                 )  
                
    #         # Verify Razorpay payment if card payment
    #         if payment_method == 'card':
    #             payment_data = {
    #                 'razorpay_payment_id': request.data.get('payment_id'),
    #                 'razorpay_order_id': request.data.get('razorpay_order_id'),
    #                 'razorpay_signature': request.data.get('signature')
    #             }
                
    #             try:
    #                 client.utility.verify_payment_signature(payment_data)
    #             except razorpay.errors.SignatureVerificationError as e:
    #                 return Response(
    #                     {'error': 'Invalid payment signature'}, 
    #                     status=status.HTTP_400_BAD_REQUEST
    #                 )

    #         # Create order
    #         with transaction.atomic():
    #             order = Order.objects.create(
    #                 user=self.request.user,
    #                 address_id=address_id,
    #                 payment_method=payment_method,
    #                 subtotal=subtotal,
    #                 discount_amount=total_discount,
    #                 coupon_discount=coupon_discount,
    #                 coupon=coupon,
    #                 delivery_charges=0,
    #                 payment_status='completed' if payment_method == 'card' else 'pending'
    #             )

    #         # Create order items and update stock
    #         for cart_item in cart.items.all():
    #             # Calculate item discount
    #             original_price = cart_item.variant.price * cart_item.quantity
    #             discount_amount = self.calculate_item_discount(cart_item)

    #             OrderItem.objects.create(
    #                 order=order,
    #                 variant=cart_item.variant,
    #                 product_name=cart_item.variant.product.name,
    #                 size=cart_item.variant.size.name,
    #                 color=cart_item.variant.color.name,
    #                 quantity=cart_item.quantity,
    #                 original_price=original_price,
    #                 discount_amount=discount_amount,
    #                 final_price=original_price - discount_amount
    #             )
    #             total_discount += discount_amount
    #             # Update order with final discount amount
    #             order.discount_amount = total_discount
    #             order.save()

    #             # Create coupon usage record if applicable
    #             if coupon:
    #                 CouponUsage.objects.create(coupon=coupon, user=self.request.user)                
    #             # Update stock in a transaction
    #             with transaction.atomic():
    #                 variant = cart_item.variant
    #                 if variant.stock_quantity < cart_item.quantity:
    #                     raise ValidationError(f"Not enough stock for {variant.product.name}")
    #                 variant.stock_quantity -= cart_item.quantity
    #                 variant.save()

    #         # Clear cart
    #         cart.items.all().delete()

    #         serializer = self.get_serializer(order)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
            
    #     except ValidationError as e:
    #         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    #     except Exception as e:
    #         logger.error("Error creating order: %s", str(e))
    #         return Response(
    #             {'error': "Failed to create order"}, 
    #             status=status.HTTP_500_INTERNAL_SERVER_ERROR
    #         )

















    # @action(detail=False, methods=['get'], url_path="download_report")
    # def download_report(self, request):
    #     try:
    #         report_type = request.query_params.get('type', 'daily')
    #         format = request.query_params.get('format', 'pdf')
    #         start_date = request.query_params.get('start_date')
    #         end_date = request.query_params.get('end_date')

    #         start_date, end_date = self.get_date_range(report_type, start_date, end_date)
    #         report_data = self.get_report_data(start_date, end_date)

    #         if end_date <= start_date:
    #             return Response(
    #                 {"error": "End date must be after start date"},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )

    #         # Add max range check
    #         max_days = 365
    #         if (end_date - start_date).days > max_days:
    #             return Response(
    #                 {"error": f"Date range cannot exceed {max_days} days"},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )
            
    #         if format.lower() == 'pdf':
    #             # Create the PDF in memory
    #             buffer = io.BytesIO()
    #             p = canvas.Canvas(buffer, pagesize=letter)
                
    #             # Add content to PDF
    #             y = 750  # Starting y position
    #             p.drawString(100, y, f"Sales Report ({start_date} to {end_date})")
    #             y -= 30
                
    #             p.drawString(100, y, f"Total Sales: ${report_data['total_sales']:.2f}")
    #             y -= 20
    #             p.drawString(100, y, f"Total Orders: {report_data['total_orders']}")
    #             y -= 20
    #             p.drawString(100, y, f"Total Discount: ${report_data['total_discount']:.2f}")
    #             y -= 40
                
    #             # Product sales table
    #             p.drawString(100, y, "Product Sales")
    #             y -= 20
    #             for product in report_data['products']:
    #                 p.drawString(100, y, f"{product['product_name']} - ${product['total_sales']:.2f}")
    #                 y -= 15
                
    #             p.showPage()
    #             p.save()
                
    #             # FileResponse sets the Content-Disposition header
    #             buffer.seek(0)
    #             return FileResponse(
    #                 buffer,
    #                 as_attachment=True,
    #                 filename=f'sales_report_{start_date}_to_{end_date}.pdf',
    #                 content_type='application/pdf'
    #             )

    #         elif format.lower() == 'excel':
    #             # Create CSV in memory
    #             buffer = io.StringIO()
    #             writer = csv.writer(buffer)
                
    #             writer.writerow(['Sales Report', f'{start_date} to {end_date}'])
    #             writer.writerow([])
    #             writer.writerow(['Total Sales', f"${report_data['total_sales']:.2f}"])
    #             writer.writerow(['Total Orders', report_data['total_orders']])
    #             writer.writerow(['Total Discount', f"${report_data['total_discount']:.2f}"])
    #             writer.writerow([])
    #             writer.writerow(['Product', 'Category', 'Total Sales', 'Orders'])
                
    #             for product in report_data['products']:
    #                 writer.writerow([
    #                     product['product_name'],
    #                     product['variant__product__category__name'],
    #                     f"${product['total_sales']:.2f}",
    #                     product['total_orders']
    #                 ])
                
    #             # Create the HttpResponse with CSV content
    #             response = HttpResponse(
    #                 buffer.getvalue(),
    #                 content_type='application/vnd.ms-excel',
    #             )
    #             response['Content-Disposition'] = f'attachment; filename=sales_report_{start_date}_to_{end_date}.csv'
    #             return response

    #         else:
    #             return Response(
    #                 {"error": "Invalid format specified"},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )

    #     except Exception as e:
    #         logger.error(f"Error generating report: {str(e)}")
    #         return Response(
    #             {"error": f"Failed to generate report: {str(e)}"},
    #             status=status.HTTP_500_INTERNAL_SERVER_ERROR
    #         )

    # def generate_pdf(self, report_data, start_date, end_date):
    #     buffer = BytesIO()
    #     doc = SimpleDocTemplate(buffer, pagesize=letter)
    #     elements = []
    #     styles = getSampleStyleSheet()

    #     # Add title
    #     title = Paragraph(f"Sales Report ({start_date} to {end_date})", styles['Heading1'])
    #     elements.append(title)

    #     # Add summary data
    #     summary_data = [
    #         ['Total Sales', f"${report_data['total_sales']:.2f}"],
    #         ['Total Orders', str(report_data['total_orders'])],
    #         ['Total Discount', f"${report_data['total_discount']:.2f}"]
    #     ]
    #     summary_table = Table(summary_data)
    #     summary_table.setStyle(TableStyle([
    #         ('BACKGROUND', (0, 0), (-1, -1), colors.grey),
    #         ('TEXTCOLOR', (0, 0), (-1, -1), colors.whitesmoke),
    #         ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    #         ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
    #         ('FONTSIZE', (0, 0), (-1, -1), 14),
    #         ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    #         ('TOPPADDING', (0, 0), (-1, -1), 12),
    #         ('GRID', (0, 0), (-1, -1), 1, colors.black)
    #     ]))
    #     elements.append(summary_table)

    #     # Add product sales data
    #     if report_data['products']:
    #         elements.append(Paragraph("Product Sales", styles['Heading2']))
    #         product_data = [['Product', 'Category', 'Total Sales', 'Orders']]
    #         for product in report_data['products']:
    #             product_data.append([
    #                 product['product_name'],
    #                 product['variant__product__category__name'],
    #                 f"${product['total_sales']:.2f}",
    #                 str(product['total_orders'])
    #             ])
            
    #         product_table = Table(product_data)
    #         product_table.setStyle(TableStyle([
    #             ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    #             ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    #             ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    #             ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    #             ('FONTSIZE', (0, 0), (-1, 0), 12),
    #             ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    #             ('TOPPADDING', (0, 0), (-1, -1), 12),
    #             ('GRID', (0, 0), (-1, -1), 1, colors.black)
    #         ]))
    #         elements.append(product_table)

    #     doc.build(elements)
    #     pdf = buffer.getvalue()
    #     buffer.close()

    #     response = HttpResponse(content_type='application/pdf')
    #     response['Content-Disposition'] = f'attachment; filename="sales_report_{start_date}_to_{end_date}.pdf"'
    #     response.write(pdf)
    #     return response

    # def generate_excel(self, report_data, start_date, end_date):
    #     response = HttpResponse(content_type='application/vnd.ms-excel')
    #     response['Content-Disposition'] = f'attachment; filename="sales_report_{start_date}_to_{end_date}.csv"'

    #     writer = csv.writer(response)
    #     writer.writerow(['Sales Report', f'From {start_date} to {end_date}'])
    #     writer.writerow([])
        
    #     # Summary
    #     writer.writerow(['Summary'])
    #     writer.writerow(['Total Sales', f"${report_data['total_sales']:.2f}"])
    #     writer.writerow(['Total Orders', report_data['total_orders']])
    #     writer.writerow(['Total Discount', f"${report_data['total_discount']:.2f}"])
    #     writer.writerow([])
        
    #     # Product Sales
    #     writer.writerow(['Product Sales'])
    #     writer.writerow(['Product', 'Category', 'Total Sales', 'Orders'])
    #     for product in report_data['products']:
    #         writer.writerow([
    #             product['product_name'],
    #             product['variant__product__category__name'],
    #             f"${product['total_sales']:.2f}",
    #             product['total_orders']
    #         ])

    #     return response
