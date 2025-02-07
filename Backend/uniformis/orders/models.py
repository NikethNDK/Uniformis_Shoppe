from django.db import models
from django.utils import timezone
from user_app.models import User,Address
from products.models import Product,ProductSizeColor
from datetime import timedelta


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
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD{timezone.now().strftime('%Y%m%d%H%M%S')}"
        super().save(*args, **kwargs)

    def can_cancel(self):
        """Check if the order can be cancelled (within 2 days of creation)"""
        return (
            self.status not in ['delivered', 'cancelled'] and
            timezone.now() - self.created_at <= timedelta(days=2)
        )

    def get_estimated_delivery(self):
        """Get estimated delivery date (3 days from order creation)"""
        return self.created_at + timedelta(days=3)

    def update_status(self):
        """Auto-update order status based on time"""
        if self.status == 'cancelled':
            return

        estimated_delivery = self.get_estimated_delivery()
        current_time = timezone.now()
        
        if current_time.date() == estimated_delivery.date():
            if current_time.hour < 20:  # Before 8 PM on delivery day
                self.status = 'shipped'
            else:
                self.status = 'delivered'
        elif current_time > estimated_delivery:
            self.status = 'delivered'
        elif current_time - self.created_at <= timedelta(days=1):
            self.status = 'processing'
        else:
            self.status = 'shipped'
        
        self.save()

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductSizeColor, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)  # Stored for historical record
    size = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of purchase
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total_price = self.price * self.quantity
        super().save(*args, **kwargs)

    

