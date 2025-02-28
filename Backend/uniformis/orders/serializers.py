from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem,Wishlist,WishlistItem,Wallet,WalletTransaction,OrderAddress
from products.serializers import ProductSizeColorSerializer
from user_app.models import Address
from user_app.serializers import UserSerializer 
from django.utils import timezone
from django.db.models import Sum,Count


class CartItemSerializer(serializers.ModelSerializer):
    variant = ProductSizeColorSerializer()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()  # Keep your existing discount calculation
    final_price = serializers.SerializerMethodField()  # Add this new field

    class Meta:
        model = CartItem
        fields = [
            'id', 'variant', 'quantity', 'total_price', 'product_name', 
            'product_image', 'product_id', 'discount_percentage', 'final_price'
        ]

    def get_discount_percentage(self, obj):
        now = timezone.now()
        product = obj.variant.product
        
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

        # Return highest discount
        if product_offer and category_offer:
            return max(product_offer.discount_percentage, category_offer.discount_percentage)
        elif product_offer:
            return product_offer.discount_percentage
        elif category_offer:
            return category_offer.discount_percentage
        return 0

    def get_total_price(self, obj):
         return obj.variant.price * obj.quantity

    # def get_discounted_price(self, obj):
    #     original_price = self.get_total_price(obj)
    #     discount_percentage = self.get_discount_percentage(obj)
    #     if discount_percentage:
    #         discount_amount = (discount_percentage / 100) * original_price
    #         return original_price - discount_amount
    #     return original_price
    
    def get_final_price(self, obj):
        original_price = obj.variant.price * obj.quantity
        discount_percentage = self.get_discount_percentage(obj)
        discount_amount = (original_price * discount_percentage) / 100
        return original_price - discount_amount

    def get_product_name(self, obj):
        return obj.variant.product.name  # Fetch product name from the Product model

    def get_product_image(self, obj):
        first_image = obj.variant.product.images.first()
        return first_image.image.url if first_image else None
    
    def get_product_id(self,obj):
        return obj.variant.product.id
    

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    total_discount = serializers.SerializerMethodField()
    final_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items','total_discount', 'final_total']
    
    def get_total_price(self, obj):
        return sum(item.variant.price * item.quantity for item in obj.items.all())

    def get_total_items(self, obj):
        return obj.items.count()

    def get_total_discount(self, obj):
        total_discount = 0
        for item in obj.items.all():
            original_price = item.variant.price * item.quantity
            discount_percentage = CartItemSerializer().get_discount_percentage(item)
            discount_amount = (original_price * discount_percentage) / 100
            total_discount += discount_amount
        return total_discount

    def get_final_total(self, obj):
        return self.get_total_price(obj) - self.get_total_discount(obj)

#latest


class OrderAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderAddress
        fields = [
            'id', 'name', 'house_no', 'city', 'state', 'pin_code',
            'address_type', 'landmark', 'mobile_number', 'alternate_number'
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()
    category=serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'size', 'color', 'quantity', 'original_price', 'discount_amount', 'final_price', 'image','discount_percentage','status', 'can_cancel', 'cancel_reason',
            'return_reason','discount_amount','category','refund_amount','returned_at','is_reviewed']
    
    def get_image(self, obj):
        if obj.variant and obj.variant.product.images.exists():
            request = self.context.get('request')
            image_url = obj.variant.product.images.first().image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return None
    
    def get_discount_percentage(self, obj):
        if obj.original_price > 0:
            return round((obj.discount_amount / obj.original_price) * 100, 2)
        return 0
    
    def get_can_cancel(self, obj):
        return obj.can_cancel()
    
    def get_category(self,obj):
        if obj.variant and obj.variant.product.category:
            return{
                'id':obj.variant.product.category.id,
                'name':obj.variant.product.category.name
            }
        return None
    
    

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    total_savings = serializers.SerializerMethodField()
    delivery_address = OrderAddressSerializer(read_only=True)
    

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status', 
            'payment_method', 'subtotal', 'discount_amount',
            'coupon_discount', 'delivery_charges', 'final_total','wallet_amount_used',
            'total_savings','created_at', 'items', 'user','is_returned', 'return_reason','delivery_address',
        ]
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email,
            'phone_number': obj.user.phone_number
        }
    
    def get_total_savings(self, obj):
        return obj.discount_amount + obj.coupon_discount
    
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'name', 'house_no', 'city', 'state', 'pin_code',
            'address_type', 'landmark', 'mobile_number', 'alternate_number'
        ]


class SalesReport:
    @staticmethod
    def generate_report(start_date, end_date):
        orders = Order.objects.filter(
            created_at__range=(start_date, end_date)
        ).aggregate(
            total_orders=Count('id'),
            total_sales=Sum('subtotal'),
            total_discount=Sum('discount_amount'),
            net_sales=Sum('final_total')
        )
        
        # Get product-wise sales
        product_sales = OrderItem.objects.filter(
            order__created_at__range=(start_date, end_date)
        ).values(
            'product__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_sales=Sum('price'),
            total_discount=Sum('discount_amount')
        )
        
        return {
            'summary': orders,
            'product_sales': product_sales
        }
    



class WishlistItemSerializer(serializers.ModelSerializer):
    variant = ProductSizeColorSerializer()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()  # Keep your existing discount calculation
    final_price = serializers.SerializerMethodField()  # Add this new field

    class Meta:
        model = WishlistItem
        fields = [
            'id', 'variant', 'quantity', 'total_price', 'product_name', 
            'product_image', 'product_id', 'discount_percentage', 'final_price'
        ]

    def get_discount_percentage(self, obj):
        now = timezone.now()
        product = obj.variant.product
        
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

        # Return highest discount
        if product_offer and category_offer:
            return max(product_offer.discount_percentage, category_offer.discount_percentage)
        elif product_offer:
            return product_offer.discount_percentage
        elif category_offer:
            return category_offer.discount_percentage
        return 0

    def get_total_price(self, obj):
         return obj.variant.price * obj.quantity
    
    def get_final_price(self, obj):
        original_price = obj.variant.price * obj.quantity
        discount_percentage = self.get_discount_percentage(obj)
        discount_amount = (original_price * discount_percentage) / 100
        return original_price - discount_amount

    def get_product_name(self, obj):
        return obj.variant.product.name  # Fetch product name from the Product model

    def get_product_image(self, obj):
        first_image = obj.variant.product.images.first()
        return first_image.image.url if first_image else None
    
    def get_product_id(self,obj):
        return obj.variant.product.id
    

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(source='wishitems', many=True, read_only=True) 
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    total_discount = serializers.SerializerMethodField()
    final_total = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'items', 'total_price', 'total_items','total_discount', 'final_total']
    
    def get_total_price(self, obj):
        try:
            return obj.get_total_price()
        except AttributeError:
            return 0

    def get_total_items(self, obj):
        try:
            return obj.get_total_items() 
        except AttributeError:
            return 0

    def get_total_discount(self, obj):
        try:
            total_discount = 0
            for item in obj.wishitems.all():  # Changed to wishitems
                original_price = item.get_total_price()
                discount_percentage = WishlistItemSerializer().get_discount_percentage(item)
                discount_amount = (original_price * discount_percentage) / 100
                total_discount += discount_amount
            return total_discount
        except AttributeError:
            return 0

    def get_final_total(self, obj):
        return self.get_total_price(obj) - self.get_total_discount(obj)

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'balance']

class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id', 'amount', 'transaction_type', 'description', 'timestamp']

# class OrderItemSerializer(serializers.ModelSerializer):
#     image = serializers.SerializerMethodField()

#     class Meta:
#         model = OrderItem
#         fields = ['id', 'product_name', 'size', 'color', 'quantity', 'price', 'total_price','image']

#     def get_image(self,obj):
#         if obj.variant and obj.variant.product.images.exists():
#             request=self.context.get('request')
#             image_url=obj.variant.product.images.first().image.url
#             return request.build_absolute_uri(image_url) if request else image_url
#         return None

# class OrderSerializer(serializers.ModelSerializer):
#     items = OrderItemSerializer(many=True, read_only=True)

#     class Meta:
#         model = Order
#         fields = [
#             'id', 'order_number', 'status', 'payment_status', 
#             'payment_method', 'total_amount', 'delivery_charges',
#             'created_at', 'items'
#         ]
#

#new one not working
# class OrderSerializer(serializers.ModelSerializer):
#     items = serializers.SerializerMethodField()

#     class Meta:
#         model = Order
#         fields = [
#             'id', 'order_number', 'status', 'payment_status', 
#             'payment_method', 'total_amount', 'delivery_charges',
#             'created_at', 'items'
#         ]

#     def get_items(self, obj):
#         items = obj.items.all()
#         return OrderItemSerializer(
#             items, 
#             many=True, 
#             context={'request': self.context.get('request')}
#         ).data


# #new test
# class OrderItemSerializer(serializers.ModelSerializer):
#     image = serializers.SerializerMethodField()

#     class Meta:
#         model = OrderItem
#         fields = ['id', 'product_name', 'size', 'color', 'quantity', 'price', 'total_price', 'image']

#     def get_image(self, obj):
#         if obj.variant and obj.variant.product.images.exists():
#             request = self.context.get('request')
#             image_url = obj.variant.product.images.first().image.url
#             return request.build_absolute_uri(image_url) if request else image_url
#         return None

# class OrderSerializer(serializers.ModelSerializer):
#     items = OrderItemSerializer(many=True, read_only=True, source='orderitem_set')

#     class Meta:
#         model = Order
#         fields = [
#             'id', 'order_number', 'status', 'payment_status', 
#             'payment_method', 'total_amount', 'delivery_charges',
#             'created_at', 'items'
#         ]

