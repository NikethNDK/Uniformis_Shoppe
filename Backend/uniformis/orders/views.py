from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderItem
from user_app.models import Address
from .serializers import CartSerializer, OrderSerializer,AddressSerializer
from products.models import ProductSizeColor
from rest_framework.permissions import IsAdminUser

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
        print(self.request.user)
        return Order.objects.filter(user=self.request.user)


    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        cart = get_object_or_404(Cart, user=self.request.user)
        address_id = request.data.get('address_id')
        payment_method = request.data.get('payment_method')

        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create order
        order = Order.objects.create(
            user=self.request.user,
            address_id=address_id,
            payment_method=payment_method,
            total_amount=cart.get_total_price(),
            delivery_charges=0  
        )

        # Create order items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                variant=cart_item.variant,
                product_name=cart_item.variant.product.name,
                size=cart_item.variant.size.name,
                color=cart_item.variant.color.name,
                quantity=cart_item.quantity,
                price=cart_item.variant.price,
            )
            # Update stock
            variant = cart_item.variant
            variant.stock_quantity -= cart_item.quantity
            variant.save()

        # Clear cart
        cart.items.all().delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
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
            order.update_status()
        
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