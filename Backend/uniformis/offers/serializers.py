from rest_framework import serializers
from .models import Offer, Coupon, CouponUsage, ReferralOffer
from products.serializers import ProductSerializer, CategorySerializer
from django.utils import timezone

class OfferSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    product_ids = serializers.ListField(write_only=True, required=False)
    category_id = serializers.IntegerField(write_only=True, required=False)
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'offer_type', 'discount_percentage',
            'products', 'category', 'is_active', 'valid_from',
            'valid_until', 'product_ids', 'category_id','is_expired'
        ]

    def get_is_expired(self, obj):
        return obj.valid_until < timezone.now()

    def validate(self, data):
        if data.get('valid_from') and data.get('valid_until'):
            if data['valid_from'] >= data['valid_until']:
                raise serializers.ValidationError({
                    'valid_until': 'End date must be after start date'
                })
            if data['valid_until'] < timezone.now():
                raise serializers.ValidationError({
                    'valid_until': 'End date cannot be in the past'
                })

        if data.get('offer_type') == 'CATEGORY' and not data.get('category_id'):
            raise serializers.ValidationError({
                'category_id': 'Category ID is required for category offers'
            })
        
        if data.get('offer_type') == 'PRODUCT' and not data.get('product_ids'):
            raise serializers.ValidationError({
                'product_ids': 'Product IDs are required for product offers'
            })

        return data

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
    is_expired = serializers.SerializerMethodField()
    usage_count = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = '__all__'

    def get_is_expired(self, obj):
        return obj.valid_until < timezone.now()

    def get_usage_count(self, obj):
        return CouponUsage.objects.filter(coupon=obj).count()

    def validate(self, data):
        if data.get('valid_from') and data.get('valid_until'):
            if data['valid_from'] >= data['valid_until']:
                raise serializers.ValidationError({
                    'valid_until': 'End date must be after start date'
                })
            if data['valid_until'] < timezone.now():
                raise serializers.ValidationError({
                    'valid_until': 'End date cannot be in the past'
                })

        if data.get('usage_limit') and data.get('usage_limit') < 1:
            raise serializers.ValidationError({
                'usage_limit': 'Usage limit must be at least 1'
            })

        return data

class CouponUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouponUsage
        fields = '__all__'

class ReferralOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralOffer
        fields = '__all__'

