from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product, Category
from user_app.models import User
from django.utils import timezone

class Offer(models.Model):
    OFFER_TYPES = (
        ('PRODUCT', 'Product Offer'),
        ('CATEGORY', 'Category Offer'),
        ('REFERRAL', 'Referral Offer'),
    )

    name = models.CharField(max_length=100)
    offer_type = models.CharField(max_length=20, choices=OFFER_TYPES)
    discount_percentage = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    products = models.ManyToManyField(Product, blank=True,related_name='offers')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name='offers')
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.get_offer_type_display()}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.valid_from and self.valid_until and self.valid_from >= self.valid_until:
            raise ValidationError('Valid from date must be before valid until date')
        if self.valid_until and self.valid_until < timezone.now():
            raise ValidationError('Valid until date cannot be in the past')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'offer'

class Coupon(models.Model):
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    discount_percentage = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    minimum_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    usage_limit = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    allow_multiple_use = models.BooleanField(default=False, help_text="Allow users to use this coupon multiple times")

    def __str__(self):
        return self.code

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.valid_from and self.valid_until and self.valid_from >= self.valid_until:
            raise ValidationError('Valid from date must be before valid until date')
        if self.valid_until and self.valid_until < timezone.now():
            raise ValidationError('Valid until date cannot be in the past')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def is_valid_for_user(self, user):
        """
        Check if the coupon is valid for the given user
        """
        if not self.is_active:
            return False, "Coupon is not active"
            
        now = timezone.now()
        if now < self.valid_from:
            return False, "Coupon is not yet valid"
        if now > self.valid_until:
            return False, "Coupon has expired"

        # Check usage limit
        user_usage = CouponUsage.objects.filter(coupon=self, user=user).count()
        if not self.allow_multiple_use and user_usage > 0:
            return False, "Coupon already used"
        if user_usage >= self.usage_limit:
            return False, "Usage limit exceeded"

        return True, "Coupon is valid"

    class Meta:
        db_table = 'coupon'

class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'coupon_usage'
        unique_together = ('coupon', 'user')

class ReferralOffer(models.Model):
    referrer_discount = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    referee_discount = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    is_active = models.BooleanField(default=True)
    valid_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'referral_offer'

