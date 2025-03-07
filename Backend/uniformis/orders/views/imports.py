from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.db.models import Sum, Count,F
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from orders.models import Cart, CartItem, Order, OrderItem,Wishlist,WishlistItem,Wallet,WalletTransaction,OrderAddress
from offers.models import Coupon,CouponUsage
from user_app.models import Address
from orders.serializers import CartSerializer, OrderSerializer,AddressSerializer,OrderItemSerializer,WishlistSerializer,WalletTransactionSerializer,WalletSerializer,OrderAddressSerializer
from products.models import ProductSizeColor
from rest_framework.permissions import IsAdminUser
from orders.payment_gateways import client, create_razorpay_order
import razorpay
from django.conf import settings
import logging
from rest_framework.exceptions import ValidationError
from django.db import transaction
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from django.http import HttpResponse
import csv
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.http import FileResponse
import json
from django.db import IntegrityError
from decimal import Decimal
from django.db.models import When, Value, F, DecimalField, CharField, Case
from django.db.models.functions import TruncDate
from django.utils.timezone import now

