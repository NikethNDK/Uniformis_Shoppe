from rest_framework import status,viewsets
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer,AddressSerializer
from .models import UserProfile,Address
from django.contrib.auth import login
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from .serializers import UserProfileSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser,IsAuthenticated,AllowAny,BasePermission
from django.middleware.csrf import get_token
from django.http import JsonResponse
from .utils import generate_otp, send_otp_email
from .models import OTP
from django.utils import timezone
from datetime import timedelta,datetime
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
from rest_framework_simplejwt.views import TokenRefreshView as SimpleJWTTokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
import traceback,uuid

logger = logging.getLogger(__name__)

User = get_user_model()

class SignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        print("Request: ",request.data)
        serializer = UserSerializer(data=request.data)
        print("Signup serializer: ",serializer)
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
    permission_classes=[]
    authentication_classes=[]

    def post(self,request):
        email=request.data.get('email')
        password=request.data.get('password')

        if not email or not password:
            return Response({
                'type':'VALIDATION_ERROR',
                'message':'Email and password are required',
                'details':{'field':'email/password'}
            },status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user=User.objects.get(email=email)

            if not user.check_password(password):
                return Response({
                    'type':'AUTH_ERROR',
                    'message':'Invalid Credentials',
                    'details':{'error':'Incorrect password'}
                },status=status.HTTP_400_BAD_REQUEST)
            
            if not user.is_active and user.is_email_verified:
                return Response({
                    'type':'FORBIDDEN',
                    'message':'Access Denied',
                    'details':{'error': 'Your account has been blocked by the admin. Please contact the administrator'}
                },status=status.HTTP_403_FORBIDDEN)
            if not user.is_active and not user.is_email_verified and not user.is_superadmin:
                otp_code=generate_otp()
                cache_key=f'otp_{user.id}'
                cache_data={
                    'otp_code':otp_code,
                    'created_at':timezone.now().isoformat(),
                    'expires_at':(timezone.now()+timedelta(minutes=1)).isoformat,
                    'is_verified':False
                }
                cache.set(cache_key,cache_data,timeout=120)


                try:
                    send_otp_email(user,otp_code)
                except Exception as e:
                    logger.error(f"Failed to send OTP email : {str(e)}")

                return Response({
                    'type' : "VERIFICATION_REQUIRED",
                    'message':'Email verification required',
                    'details':{
                        'user_id':user.id,
                        'verification_type':'email'
                    }
                },status=status.HTTP_200_OK)
            
            #Generate access and refresh token
            refresh=RefreshToken.for_user(user)

            #Creating response with user data
            response=Response({
                'type':'SUCCESS',
                'message':'Login Successful',
                'data':{
                    'user':UserSerializer(user).data
                }
            },status=status.HTTP_200_OK)

            response.set_cookie(
                'access_token',
                str(refresh.access_token),
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/'
            )
            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/'
            )

            return response
        except User.DoesNotExist:
            return Response({
                'type':'AUTH_ERROR',
                'message':'Invalid Credentials',
                'details':{'error':'User not found'}
            },status=status.HTTP_400_BAD_REQUEST)
        

class TokenRefreshView(SimpleJWTTokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({
                'message': 'Refresh token not found'
            }, status=status.HTTP_400_BAD_REQUEST)

        
        data = {'refresh': refresh_token}

        try:
            response = super().post(request, data=data, *args, **kwargs)
            
            # Set the new access token in cookies
            response.set_cookie(
                'access_token',
                response.data['access'],
                httponly=True,
                secure=False,  
                samesite='Lax'
            )
            
            return response
        except TokenError as e:
            return Response({
                'type': 'TOKEN_ERROR',
                'message': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    def post(self, request):
        response = Response({
            'type': 'SUCCESS',
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
        
        # Clear the access and refresh tokens
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        
        return response

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        user_id = request.data.get('user_id')
        otp_code = request.data.get('otp_code')

        if not user_id or not otp_code:
            return Response({
                'type': 'VALIDATION_ERROR',
                'message': 'User ID and OTP code are required',
                'details': {'field': 'otp'}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            cache_key = f'otp_{user_id}'
            otp_data = cache.get(cache_key)

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

            created_at = timezone.datetime.fromisoformat(otp_data['created_at'])
            if timezone.now() > created_at + timedelta(minutes=2):
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
            response= Response({
                'type': 'SUCCESS',
                'message': 'Email verified successfully',
                'data': {
                    'user': UserSerializer(user).data,
                    'token': str(refresh.access_token),
                    'refresh_token': str(refresh)
                }
            }, status=status.HTTP_200_OK)

            response.set_cookie(
            key='access_token',
            value=str(refresh.access_token),
            httponly=True,
            secure=True,  # Set this to True in production (HTTPS)
            samesite='Lax'
            )
            response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax'
            )

            return response

        except User.DoesNotExist:
            return Response({
                'type': 'NOT_FOUND',
                'message': 'User not found',
                'details': {'error': 'Invalid user ID'}
            }, status=status.HTTP_404_NOT_FOUND)

class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({
                'type': 'VALIDATION_ERROR',
                'message': 'User ID is required',
                'details': {'field': 'user_id'}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)

            # Generate a new OTP
            otp_code = generate_otp()
            print(f"Generated OTP: {otp_code}")

            # Store OTP and its metadata in cache
            cache_key = f'otp_{user_id}'
            cache_data = {
                'otp_code': otp_code,
                'created_at': timezone.now().isoformat(),
                'expires_at': (timezone.now() + timedelta(minutes=2)).isoformat(),
                'is_verified': False
            }
            cache.set(cache_key, cache_data, timeout=120)  # Timeout in 120 seconds (2 minutes)

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


class AdminTokenObtainView(TokenObtainPairView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(email=email, password=password)
        
        if user and user.is_superadmin:
            try:
                # Get token response from parent class
                token_response = super().post(request)
                access_token = token_response.data['access']
                refresh_token = token_response.data['refresh']
                
                # Create response
                response = Response({
                    'status': 'success',
                    'user': {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_superadmin': user.is_superadmin,
                    }
                })
                
                # Set cookies with proper configuration
                max_age = 3600 * 24  # 24 hours
                response.set_cookie(
                    'access_token',  # Changed from admin_access_token for consistency
                    access_token,
                    max_age=max_age,
                    httponly=True,
                    samesite='Lax',
                    secure=settings.DEBUG is False,
                    path='/'
                )
                
                response.set_cookie(
                    'refresh_token',  # Changed from admin_refresh_token for consistency
                    refresh_token,
                    max_age=max_age * 7,  # 7 days
                    httponly=True,
                    samesite='Lax',
                    secure=settings.DEBUG is False,
                    path='/'
                )
                
                return response
                
            except Exception as e:
                print(f"Error during token generation: {str(e)}")
                return Response({
                    "detail": "Authentication failed."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "detail": "Invalid credentials or insufficient permissions."
        }, status=status.HTTP_401_UNAUTHORIZED)
        
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
        try:
            profile_picture_url = request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None
        except ValueError:  # Handles case where profile_picture is set but file is missing
            profile_picture_url = None
            
        return Response({
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'profile_picture': profile_picture_url,
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
  
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})



def generate_random_password(length=12):
    """Generate a secure random password for Google-authenticated users"""
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for _ in range(length))


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    try:
        # Get the credential token from the request
        credential = request.data.get('credential')
        
        if not credential:
            return Response({
                'type': 'VALIDATION_ERROR',
                'message': 'No credential provided',
                'details': {'field': 'credential'}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Add detailed logging
        print(f"Attempting to verify Google token of length: {len(credential)}")
        
        try:
            # Verify the Google token
            id_info = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID 
            )
            print(f"Token verified successfully. Email: {id_info.get('email')}")
            
        except Exception as token_error:
            print(f"Token verification error: {str(token_error)}")
            # Check if GOOGLE_CLIENT_ID is correctly set
            print(f"Using Google Client ID: {settings.GOOGLE_CLIENT_ID[:10]}...")
            return Response({
                'type': 'AUTH_ERROR',
                'message': f'Google token verification failed: {str(token_error)}',
                'details': {'error': str(token_error)}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Extract user information from the verified token
        email = id_info.get('email')
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')

        print(f"Extracted user info - Email: {email}, Name: {first_name} {last_name}")

        # Check if user exists
        try:
            user = User.objects.get(email=email)
            print(f"Existing user found with ID: {user.id}")
        except User.DoesNotExist:
            # Create new user if doesn't exist
            print("User does not exist. Creating new user.")
            base_username = f"{first_name.lower()}{last_name.lower()}"
            username = f"{base_username}_{uuid.uuid4().hex[:8]}"
            try:
                with transaction.atomic():
                    user = User.objects.create(
                        email=email,
                        username=username,
                        first_name=first_name,
                        last_name=last_name,
                        is_active=True,
                        is_email_verified=True
                    )
                    # Set a random password for the user
                    random_password = generate_random_password()
                    user.set_password(random_password)
                    user.save()
                    print(f"New user created with ID: {user.id}")
            except Exception as create_error:
                print(f"Error creating user: {str(create_error)}")
                return Response({
                    'type': 'SERVER_ERROR',
                    'message': f'Error creating user: {str(create_error)}',
                    'details': {'error': str(create_error)}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Check if user is active
        if not user.is_active:
            print(f"User {user.id} is not active")
            return Response({
                'type': 'FORBIDDEN',
                'message': 'Your account has been blocked by the admin',
                'details': {'error': 'Account blocked'}
            }, status=status.HTTP_403_FORBIDDEN)

        # Generate JWT token
        print("Generating JWT token")
        try:
            refresh = RefreshToken.for_user(user)
        except Exception as token_gen_error:
            print(f"Error generating token: {str(token_gen_error)}")
            return Response({
                'type': 'SERVER_ERROR',
                'message': f'Error generating authentication token: {str(token_gen_error)}',
                'details': {'error': str(token_gen_error)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
        try:
            user_data = {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
              
            }
            
            response = Response({
                'type': 'SUCCESS',
                'message': 'Login Successful',
                'data': {
                    'user': user_data
                }
            }, status=status.HTTP_200_OK)
            
            response.set_cookie(
                'access_token',
                str(refresh.access_token),
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/'
            )
            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/'
            )
            
            print("Response prepared successfully. User logged in.")
            return response
            
        except Exception as response_error:
            print(f"Error preparing response: {str(response_error)}")
            return Response({
                'type': 'SERVER_ERROR',
                'message': f'Error preparing response: {str(response_error)}',
                'details': {'error': str(response_error)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        return Response({
            'type': 'AUTH_ERROR',
            'message': f'Invalid Google token: {str(e)}',
            'details': {'error': str(e)}
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
    
        error_traceback = traceback.format_exc()
        print(f"Unexpected error: {str(e)}")
        print(f"Traceback: {error_traceback}")
        return Response({
            'type': 'SERVER_ERROR',
            'message': f'Server error: {str(e)}',
            'details': {'error': error_traceback}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    try:
        user = request.user
        if request.method == 'GET':
            serializer = UserSerializer(user)
            logger.debug(serializer)
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
    

    # Address part

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Address deleted successfully"},
            status=status.HTTP_200_OK
        )
    


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_auth_status(request):
    """
    Check if the user is authenticated based on the access token.
    """
    user = request.user  # DRF automatically sets user if token is valid
    return Response({"isAuthenticated": True, "user": {"id": user.id, "username": user.username}})

class OptionalAuthentication(BasePermission):
    """
    Custom permission to allow both authenticated and unauthenticated access
    but provide different responses.
    """
    def has_permission(self, request, view):
        # Always return True to let the view handle authentication logic
        return True

# for users
class CheckUserAuthStatusView(APIView):
    permission_classes = [OptionalAuthentication]

    def get(self, request):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Return a 200 response for unauthenticated users
            return Response({
                "authenticated": False,
                "message": "User not authenticated"
            }, status=status.HTTP_200_OK)

        user = request.user
        
        # Now we know user is authenticated, so it's safe to check is_superadmin
        if user.is_superadmin:
            return Response(
                {"message": "Invalid user type"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({
            "user": UserSerializer(user).data,
            "authenticated": True 
        })
# for admins
class CheckAdminAuthStatusView(APIView):
    permission_classes = [OptionalAuthentication]

    def get(self, request):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Return a 200 response for unauthenticated users
            return Response({
                "authenticated": False,
                "message": "Admin not authenticated"
            }, status=status.HTTP_200_OK)

        user = request.user
        
        # Now we know user is authenticated, so it's safe to check is_superadmin
        if not user.is_superadmin:
            return Response({
                "message": "Insufficient Permission"
            }, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            "user": {
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_superadmin': user.is_superadmin,
            },
            "authenticated": True
        })