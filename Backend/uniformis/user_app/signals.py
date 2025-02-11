from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from .models import User
from .utils import generate_otp, send_otp_email



from django.dispatch import receiver
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail, EmailMessage



from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail
from django.conf import settings

@receiver(post_save, sender=User)
def create_user_otp(sender, instance, created, **kwargs):
    # Only create OTP for non-superadmin users during initial creation
    if created and not instance.is_superadmin:
        try:
            otp_code = generate_otp()
            print('OTP is' ,otp_code)
            cache_key = f'otp_{instance.id}'
            
            # Store OTP in cache with 2 minutes expiry
            cache_data = {
                'otp_code': otp_code,
                'created_at': timezone.now().isoformat(),
                'expires_at': (timezone.now() + timedelta(minutes=2)).isoformat(),
                'is_verified': False
            }
            
            # Use default cache which is now local memory
            cache.set(cache_key, cache_data, timeout=120)  # 120 seconds = 2 minutes
            
            # Send OTP email (make sure this function is imported correctly)
            send_otp_email(instance, otp_code)
        except Exception as e:
            # Log the error or handle it appropriately
            print(f"Error creating OTP: {e}")



# @receiver(reset_password_token_created)
# def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
#     # Generate password reset link
#     reset_url = f"http://localhost:5174/reset-password/"

#     # Email message
#     email_plaintext_message =f"Use the following token to reset your password:\n\n{reset_password_token.key}\n\nGo to {reset_url} and enter your email with this token."

#     # Send email
#     send_mail(
#         "Password Reset Request",
#         email_plaintext_message,
#         "info@uniformis.com",
#         [reset_password_token.user.email],
#         fail_silently=False,
#     )


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    # Generate password reset link with token
    reset_url = f"http://localhost:5173/reset-password?token={reset_password_token.key}"

    # Email message
    email_plaintext_message = f"""
    Hello,

    You have requested to reset your password. Please click the link below to reset your password:

    {reset_url}

    If you didn't request this password reset, please ignore this email.

    Best regards,
    Uniformis Team
    """

    # Send email
    send_mail(
        subject="Password Reset for Uniformis Account",
        message=email_plaintext_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[reset_password_token.user.email],
        fail_silently=False,
    )