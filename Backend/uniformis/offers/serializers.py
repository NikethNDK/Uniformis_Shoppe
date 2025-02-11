from rest_framework import serializers
from .models import Offer, Coupon, CouponUsage, ReferralOffer
from products.serializers import ProductSerializer, CategorySerializer

class OfferSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    product_ids = serializers.ListField(write_only=True, required=False)
    category_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'offer_type', 'discount_percentage',
            'products', 'category', 'is_active', 'valid_from',
            'valid_until', 'product_ids', 'category_id'
        ]

    def create(self, validated_data):
        product_ids = validated_data.pop('product_ids', [])
        category_id = validated_data.pop('category_id', None)
        
        offer = Offer.objects.create(**validated_data)
        
        if product_ids:
            offer.products.set(product_ids)
        if category_id:
            offer.category_id = category_id
            offer.save()
            
        return offer

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

class CouponUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouponUsage
        fields = '__all__'

class ReferralOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralOffer
        fields = '__all__'

