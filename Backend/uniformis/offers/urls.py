from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'offers', OfferViewSet, basename='offer')
router.register(r'coupons', CouponViewSet, basename='coupon')
router.register(r'referral-offers', ReferralOfferViewSet, basename='referral-offer')


urlpatterns = [
    path('', include(router.urls)),
]