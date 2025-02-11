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
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Offer.objects.all()
        category_id = self.request.query_params.get('category', None)
        offer_type = self.request.query_params.get('type', None)

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if offer_type:
            queryset = queryset.filter(offer_type=offer_type)

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        offer = self.get_object()
        offer.is_active = not offer.is_active
        offer.save()
        serializer = self.get_serializer(offer)
        return Response(serializer.data)

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]

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
                    'error': f'Minimum purchase amount of ${coupon.minimum_purchase} required'
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
        discount_amount = (total_amount * coupon.discount_percentage) / 100

        return Response({
            'discount_amount': discount_amount,
            'final_amount': total_amount - discount_amount
        })

class ReferralOfferViewSet(viewsets.ModelViewSet):
    queryset = ReferralOffer.objects.all()
    serializer_class = ReferralOfferSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def apply_referral(self, request):
        referral_code = request.data.get('referral_code')
        user = request.user

        try:
            referral_offer = ReferralOffer.objects.get(is_active=True)
            # Apply referral logic here
            return Response({
                'referrer_discount': referral_offer.referrer_discount,
                'referee_discount': referral_offer.referee_discount
            })
        except ReferralOffer.DoesNotExist:
            return Response(
                {'error': 'No active referral offer found'},
                status=status.HTTP_404_NOT_FOUND
            )

