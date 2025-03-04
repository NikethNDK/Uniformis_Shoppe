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
            '/api/token/refresh',
            '/api/login',
            '/api/signup/',
            '/api/check-user-auth-status',
            '/api/check-admin-auth-status',
            '/api/check-auth-status'
            '/api/password_reset',
            '/api/google_login/',
        ]
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

# class AccessTokenMiddleware(MiddlewareMixin):
#     def process_request(self, request):
#         access_token = request.COOKIES.get('access_token')
#         refresh_token = request.COOKIES.get('refresh_token')
        
#         if not access_token:
#             request.user = None
#             return
        
#         try:
#             # Validate the access token
#             decoded_token = AccessToken(access_token)
#             user_id = decoded_token['user_id']
#             user = User.objects.get(id=user_id)
            
#             # Check if the token is about to expire (e.g., within 2 minutes)
#             exp_timestamp = decoded_token['exp']
#             exp_time = datetime.fromtimestamp(exp_timestamp)
#             remaining_time = exp_time - datetime.utcnow()

#             if remaining_time < timedelta(minutes=2) and refresh_token:
#                 # Refresh the access token using the refresh token
#                 new_access_token = self.refresh_access_token(refresh_token)
#                 if new_access_token:
#                     request.new_access_token = new_access_token

#             request.user = user  # Attach the authenticated user to request.user

#         except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist, jwt.InvalidTokenError):
#             request.user = None


#     def process_response(self, request, response):
#         # Check if a new access token was generated
#         new_access_token = getattr(request, 'new_access_token', None)
#         if new_access_token:
#             response.set_cookie('access_token', new_access_token, httponly=True, secure=True)

#         return response

#     def refresh_access_token(self, refresh_token):
#         try:
#             # Decode the refresh token to generate a new access token
#             decoded_refresh_token = RefreshToken(refresh_token)
#             new_access_token = decoded_refresh_token.access_token
#             return str(new_access_token)
#         except jwt.ExpiredSignatureError:
#             return None
