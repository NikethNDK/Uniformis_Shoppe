# accounts/utils.py
from django.core.mail import send_mail
import random
from django.utils import timezone
from datetime import timedelta

def generate_otp():
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

def send_otp_email(user, otp):
    subject = 'Uniformis Shoppe Verify your email - OTP'
    message = f'Your OTP for email verification for Uniformis Shoppe is: {otp}\nThis OTP will expire in 2 minutes.'
    from_email = 'nikethdileepkumar@gmail.com'  # Configure this
    recipient_list = [user.email]
    
    send_mail(subject, message, from_email, recipient_list)