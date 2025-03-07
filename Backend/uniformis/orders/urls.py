from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet,AddressViewSet,AdminOrderViewSet,SalesReportViewSet,WishlistViewSet,WalletViewSet,OrderItemReturnView

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'sales-report', SalesReportViewSet, basename='sales-report')
router.register(r'wallet',WalletViewSet,basename='wallet')

urlpatterns = [
    path('', include(router.urls)),
    path('create_razorpay_order/', 
         OrderViewSet.as_view({'post': 'create_razorpay_order'}), 
         name='create-razorpay-order'),
    path('razorpay/webhook/', OrderViewSet.as_view({'post': 'razorpay_webhook'}), name='razorpay-webhook'),
     path(
        'orders/<int:order_id>/return-item/<int:item_id>/', OrderItemReturnView.as_view(), name='order-item-return'),
]