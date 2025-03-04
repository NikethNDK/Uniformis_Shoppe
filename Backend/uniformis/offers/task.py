from django.utils import timezone
from datetime import timedelta
from .models import CouponUsage

def cleanup_pending_coupon_usages():
    one_hour_ago = timezone.now() - timedelta(hours=1)
    CouponUsage.objects.filter(
        is_used=False,  # Only delete unused entries
        created_at__lt=one_hour_ago
    ).delete()