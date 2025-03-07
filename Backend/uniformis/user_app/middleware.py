import jwt
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken,RefreshToken
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from datetime import datetime,timedelta

User = get_user_model()
 
class AccessTokenMiddleware(MiddlewareMixin):
    def process_request(self, request):
        print(f"Processing request for path: {request.path}")
        public_paths = [
            '/api/token/refresh/',
            '/api/login/',
            '/api/signup/',
            '/api/check-user-auth-status/',
            '/api/check-admin-auth-status/',
            '/api/check-auth-status/',
            '/api/password_reset/',
            '/api/google_login/',
        ]

        path = request.path

        if request.path in public_paths:
            print(f"Path {request.path} is in public_paths. Skipping middleware.")
            return None
        else:
            print(f"Path {request.path} is NOT in public_paths. Continuing middleware.")
        # Skip middleware for public endpoints (more flexible check)
        if any(request.path.startswith(path) for path in public_paths):
            return None
            
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            request.user = None
            return None
        
        try:
            decoded_token = AccessToken(access_token)
            user_id = decoded_token['user_id']
            request.user = User.objects.get(id=user_id)
        except (InvalidToken, TokenError, User.DoesNotExist):
            request.user = None

class AccessTokenMiddleware(MiddlewareMixin):
    def process_request(self, request):
        public_paths = [
            '/api/token/refresh/',
            '/api/login/',
            '/api/signup/',
            '/api/check-user-auth-status/',
            '/api/check-admin-auth-status/',
            '/api/check-auth-status/',
            '/api/password_reset/',
            '/api/google_login/',
        ]
        
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not access_token:
            request.user = None
            return None
        
        try:
            # Validate the access token
            decoded_token = AccessToken(access_token)
            user_id = decoded_token['user_id']
            user = User.objects.get(id=user_id)
            
            # Check if token is about to expire (within 5 minutes)
            exp_timestamp = decoded_token['exp']
            exp_time = datetime.fromtimestamp(exp_timestamp)
            remaining_time = exp_time - datetime.utcnow()

            if remaining_time < timedelta(minutes=5) and refresh_token:
                # Set a flag to refresh in the response
                request.needs_token_refresh = True
                request.refresh_token = refresh_token
            
            request.user = user
            
        except (InvalidToken, TokenError, User.DoesNotExist):
            request.user = None
            
    def process_response(self, request, response):
        if getattr(request, 'needs_token_refresh', False):
            try:
                # Create a new token pair
                refresh = RefreshToken(request.refresh_token)
                new_access_token = str(refresh.access_token)
                
                # Set the new access token in the cookie
                response.set_cookie(
                    'access_token',
                    new_access_token,
                    httponly=True,
                    secure=False,  # Set to True in production
                    samesite='Lax',
                    max_age=60*60  # Set an explicit lifetime (e.g., 1 hour)
                )
            except Exception as e:
                print(f"Error refreshing token: {str(e)}")
                
        return response