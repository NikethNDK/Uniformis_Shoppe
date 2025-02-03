from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .models import UserProfile
from django.contrib.auth import login
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .serializers import UserProfileSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.middleware.csrf import get_token
from django.http import JsonResponse
from .utils import generate_otp, send_otp_email
from .models import OTP
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework.exceptions import AuthenticationFailed
from google.auth.transport import requests
from django.views.decorators.csrf import csrf_exempt
import string
from django.db import transaction
import random
from django.core.cache import cache
import logging

# Configure logging
logger = logging.getLogger(__name__)

User = get_user_model()

class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)

        try:
            if serializer.is_valid():
                user = serializer.save()
                user.is_active = False
                user.save()
                
                # Create user profile
                UserProfile.objects.create(user=user)
                
                return Response({
                    'user_id': user.id,
                    'message': 'Please verify your email with the OTP sent.'
                }, status=status.HTTP_201_CREATED)
            
            # Log validation errors
            logger.warning(f"Signup validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            # Log unexpected errors
            logger.error(f"Signup error: {str(e)}")
            return Response({
                'error': 'An unexpected error occurred during signup',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        print(email, password)
        if not email or not password:
            return Response({
                'type': 'VALIDATION_ERROR',
                'message': 'Email and password are required.',
                'details': {'field': 'email/password'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
       

        try:
            user = User.objects.get(email=email)

            if not user.check_password(password):
                return Response({
                    'type': 'AUTH_ERROR',
                    'message': 'Invalid credentials.',
                    'details': {'error': 'Incorrect password'}
                }, status=status.HTTP_400_BAD_REQUEST)

            if not user.is_active and user.is_email_verified==True:
                return Response({
                    'type': 'FORBIDDEN',
                    'message': 'Access denied',
                    'details': {'error': 'Your account has been blocked. Please contact support'}
                }, status=status.HTTP_403_FORBIDDEN)

            if not user.is_active and not user.is_email_verified and not user.is_superadmin:
                otp_code = generate_otp()
                cache_key = f'otp_{user.id}'
                cache_data = {
                    'otp_code': otp_code,
                    'created_at': timezone.now().isoformat(),
                    'expires_at': (timezone.now() + timedelta(minutes=1)).isoformat(),
                    'is_verified': False
                }
                cache.set(cache_key, cache_data, timeout=120)
                
                try:
                    send_otp_email(user, otp_code)
                except Exception as e:
                    logger.error(f"Failed to send OTP email: {str(e)}")
                
                
                return Response({
                    'type': 'VERIFICATION_REQUIRED',
                    'message': 'Email verification required',
                    'details': {
                        'user_id': user.id,
                        'verification_type': 'email'
                    }
                }, status=status.HTTP_200_OK)

            refresh = RefreshToken.for_user(user)
            return Response({
                'type': 'SUCCESS',
                'message': 'Login successful',
                'data': {
                    'user': UserSerializer(user).data,
                    'token': str(refresh.access_token),
                    'refresh_token': str(refresh)
                }
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({
                'type': 'AUTH_ERROR',
                'message': 'Invalid credentials.',
                'details': {'error': 'User not found'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
class VerifyOTPView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        otp_code = request.data.get('otp_code')
        print(otp_code)
        print(user_id)
        try:
            user = User.objects.get(id=user_id)
            cache_key = f'otp_{user_id}'
            otp_data = cache.get(cache_key)
            print(cache_key)

            if not otp_data:
                return Response({
                    'type': 'VALIDATION_ERROR',
                    'message': 'OTP has expired or not found',
                    'details': {'field': 'otp'}
                }, status=status.HTTP_400_BAD_REQUEST)

            if otp_data['otp_code'] != otp_code:
                return Response({
                    'type': 'VALIDATION_ERROR',
                    'message': 'Invalid OTP',
                    'details': {'field': 'otp'}
                }, status=status.HTTP_400_BAD_REQUEST)

            expires_at = timezone.datetime.fromisoformat(otp_data['expires_at'])
            if timezone.now() > expires_at:
                return Response({
                    'type': 'VALIDATION_ERROR',
                    'message': 'OTP has expired',
                    'details': {'field': 'otp'}
                }, status=status.HTTP_400_BAD_REQUEST)

            user.is_active = True
            user.is_email_verified = True
            user.save()

            cache.delete(cache_key)

            refresh = RefreshToken.for_user(user)
            
            return Response({
                'type': 'SUCCESS',
                'message': 'Email verified successfully',
                'data': {
                    'user': UserSerializer(user).data,
                    'token': str(refresh.access_token),
                    'refresh_token': str(refresh)
                }
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({
                'type': 'NOT_FOUND',
                'message': 'User not found',
                'details': {'error': 'Invalid user ID'}
            }, status=status.HTTP_404_NOT_FOUND)

class ResendOTPView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
            
            otp_code = generate_otp()
            print(otp_code)
            cache_key = f'otp_{user_id}'
            cache_data = {
                'otp_code': otp_code,
                'created_at': timezone.now().isoformat(),
                'expires_at': (timezone.now() + timedelta(minutes=2)).isoformat(),
                'is_verified': False
            }
            cache.set(cache_key, cache_data, timeout=120)
            
            try:
                send_otp_email(user, otp_code)
            except Exception as e:
                logger.error(f"Failed to send OTP email: {str(e)}")
                return Response({
                    'type': 'SERVER_ERROR',
                    'message': 'Failed to send OTP email',
                    'details': {'error': str(e)}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'type': 'SUCCESS',
                'message': 'New OTP sent successfully',
                'details': {'user_id': user.id}
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'type': 'NOT_FOUND',
                'message': 'User not found',
                'details': {'error': 'Invalid user ID'}
            }, status=status.HTTP_404_NOT_FOUND)


#admin
class AdminTokenObtainView(TokenObtainPairView):
    def post(self, request):
        user = authenticate(email=request.data.get('email'), password=request.data.get('password'))
        if user and user.is_superadmin:
            response =  super().post(request)
            response.data['user'] = {
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
            response.data['admin_token'] = response.data['access']
            return response
        return Response({"detail": "Only superusers are allowed."}, status=status.HTTP_403_FORBIDDEN)

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        active_users = User.objects.filter(is_superadmin=False)
        
        active_serializer = UserSerializer(active_users, many=True)
        
        return Response({
            "message": "Welcome to the admin dashboard",
            "active_users": active_serializer.data,
        })
    
    def post(self, request):
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            user.is_active = not user.is_active
            user.save()
            return Response({
                'status': 'success', 
                'user_id': user.id, 
                'is_active': user.is_active
            })
        except User.DoesNotExist:
            return Response({
                'status': 'error', 
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        return Response({
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
        })
    
    def put(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
        return Response({
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
            'message': 'Profile updated successfully'
        })
    
# class UserProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self,request):
#         profile = UserProfile.objects.get(user=request.user)
#         return Response({
#             'username': request.user.username,
#             'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
#         })
    
#     def put(self, request):
#         profile = UserProfile.objects.get(user=request.user)
#         if 'username' in request.data:
#             request.user.username = request.data['username']
#             request.user.save()
#         if 'profile_picture' in request.FILES:
#             profile.profile_picture = request.FILES['profile_picture']
#             profile.save()
#         return Response({'message': 'profile updated successfully'})
    
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'status': 'success'})
    except User.DoesNotExist:
        return Response({'status': 'error', 'message': 'User not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserProfile.objects.create(user=user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def admin_update_user(request, user_id):  
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            print("Request data:", request.data)
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK) 
        
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})



def generate_random_password(length=12):
    """Generate a secure random password for Google-authenticated users"""
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for _ in range(length))

@csrf_exempt
@api_view(['POST'])
def google_login( request):
    try:
        # Get the credential token from the request
        credential = request.data.get('credential')
        
        if not credential:
            return Response(
                {'error': {'commonError': 'No credential provided'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify the Google token
        id_info = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID  # Add this to your Django settings
        )

        # Extract user information from the verified token
        email = id_info.get('email')
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')

        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create new user if doesn't exist
            with transaction.atomic():
                user = User.objects.create(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True
                )
                # Set a random password for the user
                random_password = generate_random_password()
                user.set_password(random_password)
                user.save()

        # Check if user is active
        if not user.is_active:
            return Response(
                {'error': {'commonError': 'Your account has been blocked.'}},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        
        # Create response with user data
        
        return Response({
        'user': {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'email': user.email,
        },
        'token': str(refresh.access_token),
        'refresh_token': str(refresh)
    }, status=status.HTTP_200_OK)

    except ValueError as e:
        # Token validation failed
        return Response(
            {'error': {'commonError': 'Invalid Google token'}},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        # Handle other exceptions
        return Response(
            {'error': {'commonError': str(e)}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    try:
        user = request.user
        if request.method == 'GET':
            serializer = UserSerializer(user)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_picture_view(request):
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
            
        elif request.method == 'PUT':
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)