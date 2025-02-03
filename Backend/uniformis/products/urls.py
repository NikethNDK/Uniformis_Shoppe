# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import ProductViewSet, CategoryViewSet, ReviewViewSet, add_product,SizeViewSet,product_detail,product_list

# # Create a router instance
# router = DefaultRouter()

# # Register the viewsets
# router.register(r'items', ProductViewSet, basename='product')
# router.register(r'categories', CategoryViewSet, basename='category')
# router.register(r'reviews', ReviewViewSet, basename='review')
# router.register(r'size',SizeViewSet,basename='size')

# # Define the urlpatterns
# urlpatterns = [
#     path('addproduct/', add_product, name='add-product'),
#     path('products/', product_list, name='product-list'),
#     path('products/<int:pk>/',product_detail, name='product-detail'),
#     path('', include(router.urls)),  # Include the router-generated URLs
# ]

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import ProductViewSet, CategoryViewSet, ReviewViewSet, add_product, SizeViewSet, product_detail, product_list

# router = DefaultRouter()
# router.register(r'', ProductViewSet, basename='product')
# router.register(r'categories', CategoryViewSet, basename='category')
# router.register(r'reviews', ReviewViewSet, basename='review')
# router.register(r'size', SizeViewSet, basename='size')

# urlpatterns = [
#     path('addproduct/', add_product, name='add-product'),
#     path('', product_list, name='product-list'),
#     path('<int:pk>/', product_detail, name='product-detail'),
#     path('', include(router.urls)),
# ]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, ReviewViewSet, AddProductView, SizeViewSet, product_detail, product_list,ColorViewSet,UpdateProductView

router = DefaultRouter()
router.register(r'items', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'size', SizeViewSet, basename='size')
router.register(r'colors', ColorViewSet)


urlpatterns = [
    path('addproduct/', AddProductView.as_view(), name='add-product'),
     path('updateproduct/<int:pk>/', UpdateProductView.as_view(), name='update-product'),
    path('', product_list, name='product-list'),
    path('<int:pk>/', product_detail, name='product-detail'),
    path('', include(router.urls)),
]