import profile
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone



class MyAccountManager(BaseUserManager):
    def create_user(self, first_name, last_name, username, email, phone_number, password = None):
        if not email:
            raise ValueError('User must have an email address')
        if not username:
            raise ValueError('User must have an username')
        
        user = self.model(
            email = self.normalize_email(email),
            username = username,
            first_name = first_name,
            last_name = last_name,
            phone_number=phone_number,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, first_name, last_name, email, username, password,phone_number=""):
        user = self.create_user(
            email       = self.normalize_email(email),
            username    = username,
            password    = password,
            first_name  = first_name,
            last_name   = last_name,
            phone_number=phone_number, 
        )
        user.is_admin = True
        user.is_active      = True
        user.is_staff       = True
        user.is_superadmin  = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    first_name      = models.CharField(max_length=50)
    last_name       = models.CharField(max_length=50)
    username        = models.CharField(max_length=50, unique=True)
    email           = models.EmailField(max_length=100, unique=True)
    phone_number    = models.CharField(max_length=50, blank=True)

    date_joined     = models.DateTimeField(auto_now_add=True)
    last_login      = models.DateTimeField(auto_now_add=True)
    is_admin        = models.BooleanField(default=False)
    is_staff        = models.BooleanField(default=False)
    is_active       = models.BooleanField(default=True)
    is_superadmin   = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False) #for signup otp
    date_of_birth = models.DateField(null=True, blank=True)

    USERNAME_FIELD  = 'email'   
    REQUIRED_FIELDS = ['username','first_name','last_name']

    # defining cusotm managere so that for creating i can access the MyAccountManager create_user function for creating
    objects         = MyAccountManager()

    def __str__(self):
        return self.email
    
    def has_perm(self, perm, obj=None):
        return self.is_admin
    
    def has_module_perms(self,app_label):
        return True

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='user/profile_pic/', null=True, blank=True)

    def __str__(self):
        return str(self.user.first_name)

# accounts/models.py (add these models)
class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

class Address (models.Model):
    ADDRESS_TYPES =(
         ('home', 'Home'),
        ('work', 'Work'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    name = models.CharField(max_length=100)
    house_no = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=6)
    address_type = models.CharField(max_length=4, choices=ADDRESS_TYPES)
    landmark = models.CharField(max_length=200, blank=True)
    mobile_number = models.CharField(max_length=10)
    alternate_number = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name}'s {self.address_type} address"
    
