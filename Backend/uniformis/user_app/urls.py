from django.urls import path,include
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('admin/csrf/', get_csrf_token),
    path('admin/token/', AdminTokenObtainView.as_view(), name='admin_token'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    
    path('google_login/', google_login, name='google-login'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
   
    

    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    
    path('user_profile_details/', profile_view, name='profile'),
    path('user-profile/', UserProfileView.as_view(), name='user_profile'),
    
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/',LogoutView.as_view(),name='logout'),
    path('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    
]