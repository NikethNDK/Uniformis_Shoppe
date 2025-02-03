from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from .models import User
from .utils import generate_otp, send_otp_email

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