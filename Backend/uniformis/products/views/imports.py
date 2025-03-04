from rest_framework import viewsets, permissions, status,viewsets,generics
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter


from django.db.models import Count, Avg
from products.models import Product
from products.models import Category, Product, Review, ProductImage, Size,Color,ProductSizeColor
from products.serializers import (
    CategorySerializer, ProductSerializer, SizeSerializer,
    ReviewSerializer, ProductDetailSerializer,ColorSerializer,ProductSizeColorSerializer,AdminReviewSerializer
)
from orders.models import OrderItem

from django.shortcuts import get_object_or_404
import json
import logging
from django.http import Http404
from django.db.models import Avg, Count, Case, When, IntegerField,Q

