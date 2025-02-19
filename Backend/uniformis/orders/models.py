from django.db import models,transaction
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
        ('partially_refunded', 'Partially Refunded'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('card', 'Credit/Debit Card'),
        ('wallet', 'Wallet'),
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

    is_returned = models.BooleanField(default=False)
    return_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']

    def update_status(self, new_status):
        """
        Updates the order status.
        """
        if new_status and new_status in dict(self.STATUS_CHOICES):
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
    
    def recalculate_totals(self):
        """Recalculate order totals after item cancellation"""
        active_items = self.items.exclude(status='cancelled')
        
        self.subtotal = sum(item.original_price for item in active_items)
        self.discount_amount = sum(item.discount_amount for item in active_items)
        self.final_total = self.subtotal - self.discount_amount - self.coupon_discount + self.delivery_charges
        self.save()

class OrderItem(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('returned', 'Returned'),
    )


    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductSizeColor, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)
    size = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField()
    original_price = models.DecimalField(max_digits=10, decimal_places=2)  # Original price before discount
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Discount applied
    final_price = models.DecimalField(max_digits=10, decimal_places=2)  # Final price after discount
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancel_reason = models.TextField(blank=True, null=True)
    returned_at = models.DateTimeField(null=True, blank=True)
    return_reason = models.TextField(blank=True, null=True)
    refund_processed = models.BooleanField(default=False)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


    def save(self, *args, **kwargs):
        if not self.final_price:
            self.final_price = self.original_price - self.discount_amount
        super().save(*args, **kwargs)

    def can_cancel(self):
        return (
            self.status == 'active' and
            self.order.status not in ['delivered', 'cancelled'] and
            timezone.now() - self.order.created_at <= timedelta(days=2)
        )
    def process_cancellation(self, reason):
        """Process item cancellation and refund"""
        if not self.can_cancel():
            raise ValueError("Item cannot be cancelled")

        with transaction.atomic():
            # Update item status
            self.status = 'cancelled'
            self.cancelled_at = timezone.now()
            self.cancel_reason = reason
            
            # Calculate refund amount
            self.refund_amount = self.final_price
            
            # Process refund to wallet
            wallet, created = Wallet.objects.get_or_create(user=self.order.user)
            wallet.balance += self.refund_amount
            wallet.save()
            
            # Create wallet transaction record
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=self.refund_amount,
                transaction_type='CREDIT',
                description=f'Refund for cancelled item from order {self.order.order_number}'
            )
            
            # Update stock
            if self.variant:
                self.variant.stock_quantity += self.quantity
                self.variant.save()
            
            self.refund_processed = True
            self.save()
            
            # Update order total
            self.order.recalculate_totals()
    

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



class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username}'s Wallet"

class WalletTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit'),
    )
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} of {self.amount} for {self.wallet.user.username}"
    


class OrderAddress(models.Model):
    """Stores the delivery address at the time of order"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.OneToOneField('Order', on_delete=models.CASCADE, related_name='delivery_address')
    name = models.CharField(max_length=100)
    house_no = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=10)
    address_type = models.CharField(max_length=20)
    landmark = models.CharField(max_length=100, blank=True)
    mobile_number = models.CharField(max_length=15)
    alternate_number = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"Address for Order {self.order.order_number}"
