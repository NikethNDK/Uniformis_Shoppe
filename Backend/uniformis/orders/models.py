from django.db import models
from django.utils import timezone
from user_app.models import User,Address
from products.models import Product,ProductSizeColor
from datetime import timedelta
from offers.models import Coupon


class Cart (models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def get_total_price(self):
        return sum(item.get_total_price() for item in self.items.all())

    def get_total_items(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductSizeColor, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_total_price(self):
        return self.variant.price * self.quantity

    class Meta:
        unique_together = ('cart', 'variant')

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI'),
        ('cod', 'Cash on Delivery'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)
    order_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    
    # Price fields
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)  # Original price before discounts
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Total discount applied
    coupon_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Coupon discount if any
    delivery_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_total = models.DecimalField(max_digits=10, decimal_places=2)  # Final price after all discounts
    
    # Tracking fields
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_status(self, new_status):
        """
        Updates the order status.
        """
        if new_status in dict(self.STATUS_CHOICES):
            self.status = new_status
            self.save()
            return True
        return False

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD{timezone.now().strftime('%Y%m%d%H%M%S')}"
        
        if not self.status:  # Set status to "processing" when first created
            self.status = 'processing'
        # Calculate final total
        self.final_total = self.subtotal - self.discount_amount - self.coupon_discount + self.delivery_charges
        
        super().save(*args, **kwargs)

    def can_cancel(self):
        return (
            self.status not in ['delivered', 'cancelled'] and
            timezone.now() - self.created_at <= timedelta(days=2)
        )

    def get_estimated_delivery(self):
        return self.created_at + timedelta(days=3)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductSizeColor, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)
    size = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField()
    original_price = models.DecimalField(max_digits=10, decimal_places=2)  # Original price before discount
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Discount applied
    final_price = models.DecimalField(max_digits=10, decimal_places=2)  # Final price after discount

    def save(self, *args, **kwargs):
        if not self.final_price:
            self.final_price = self.original_price - self.discount_amount
        super().save(*args, **kwargs)

    

class Wishlist (models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def get_total_price(self):
        return sum(item.get_total_price() for item in self.items.all())

    def get_total_items(self):
        return sum(item.quantity for item in self.items.all())


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, related_name='wishitems', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductSizeColor, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_total_price(self):
        return self.variant.price * self.quantity

    class Meta:
        unique_together = ('wishlist', 'variant')

