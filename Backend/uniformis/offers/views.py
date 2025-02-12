from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from .models import Offer, Coupon, CouponUsage, ReferralOffer
from .serializers import (
    OfferSerializer, CouponSerializer,
    CouponUsageSerializer, ReferralOfferSerializer
)

class OfferViewSet(viewsets.ModelViewSet):
    serializer_class = OfferSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Offer.objects.all()
        category_id = self.request.query_params.get('category', None)
        offer_type = self.request.query_params.get('type', None)
        is_active = self.request.query_params.get('is_active', None)
        is_expired = self.request.query_params.get('is_expired', None)

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if offer_type:
            queryset = queryset.filter(offer_type=offer_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if is_expired is not None:
            if is_expired.lower() == 'true':
                queryset = queryset.filter(valid_until__lt=timezone.now())
            else:
                queryset = queryset.filter(valid_until__gte=timezone.now())

        return queryset.order_by('-created_at')
    
    # def create(self, request, *args, **kwargs):
    #     # Print incoming POST data
    #     print("Incoming POST data:", request.data)

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        offer = self.get_object()
        offer.is_active = not offer.is_active
        offer.save()
        serializer = self.get_serializer(offer)
        return Response(serializer.data)

class CouponViewSet(viewsets.ModelViewSet):
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Coupon.objects.all()
        is_active = self.request.query_params.get('is_active', None)
        is_expired = self.request.query_params.get('is_expired', None)

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if is_expired is not None:
            if is_expired.lower() == 'true':
                queryset = queryset.filter(valid_until__lt=timezone.now())
            else:
                queryset = queryset.filter(valid_until__gte=timezone.now())

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        coupon = self.get_object()
        coupon.is_active = not coupon.is_active
        coupon.save()
        serializer = self.get_serializer(coupon)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        coupon = self.get_object()
        user = request.user
        total_amount = request.data.get('total_amount', 0)

        # Validate coupon
        if not coupon.is_active:
            return Response(
                {'error': 'This coupon is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if coupon.valid_until < timezone.now():
            return Response(
                {'error': 'This coupon has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if total_amount < coupon.minimum_purchase:
            return Response(
                {
                    'error': f'Minimum purchase amount of ₹{coupon.minimum_purchase} required'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check usage limit
        usage_count = CouponUsage.objects.filter(coupon=coupon, user=user).count()
        if usage_count >= coupon.usage_limit:
            return Response(
                {'error': 'You have already used this coupon'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate discount
        discount_amount = (float(total_amount) * coupon.discount_percentage) / 100

        return Response({
            'discount_amount': discount_amount,
            'final_amount': float(total_amount) - discount_amount
        })
    
class ReferralOfferViewSet(viewsets.ModelViewSet):
    queryset = ReferralOffer.objects.all()
    serializer_class = ReferralOfferSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def apply_referral(self, request):
        try:
            referral_offer = ReferralOffer.objects.get(
                is_active=True,
                valid_until__gt=timezone.now()
            )
            return Response({
                'referrer_discount': referral_offer.referrer_discount,
                'referee_discount': referral_offer.referee_discount
            })
        except ReferralOffer.DoesNotExist:
            return Response(
                {'error': 'No active referral offer found'},
                status=status.HTTP_404_NOT_FOUND
            )