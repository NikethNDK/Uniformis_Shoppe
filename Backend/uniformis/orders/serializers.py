from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from products.serializers import ProductSizeColorSerializer
from user_app.models import Address
from user_app.serializers import UserSerializer 


class CartItemSerializer(serializers.ModelSerializer):
    variant = ProductSizeColorSerializer()
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    product_id=serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'variant', 'quantity', 'total_price','product_name', 'product_image','product_id']

    def get_total_price(self, obj):
        return obj.get_total_price()
    
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

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items']

    def get_total_price(self, obj):
        return float(obj.get_total_price())

    def get_total_items(self, obj):
        return obj.get_total_items()

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


#latest

class OrderItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'size', 'color', 'quantity', 'price', 'total_price', 'image']
    
    def get_image(self, obj):
        if obj.variant and obj.variant.product.images.exists():
            request = self.context.get('request')
            image_url = obj.variant.product.images.first().image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status', 
            'payment_method', 'total_amount', 'delivery_charges',
            'created_at', 'items', 'user'
        ]
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email,
            'phone_number': obj.user.phone_number
        }

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'name', 'house_no', 'city', 'state', 'pin_code',
            'address_type', 'landmark', 'mobile_number', 'alternate_number'
        ]