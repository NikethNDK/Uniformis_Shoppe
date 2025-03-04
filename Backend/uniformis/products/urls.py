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

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import ProductViewSet, CategoryViewSet, ReviewViewSet, AddProductView, SizeViewSet, product_detail, product_list,ColorViewSet,UpdateProductView

# router = DefaultRouter()
# router.register(r'items', ProductViewSet, basename='product')
# router.register(r'categories', CategoryViewSet, basename='category')
# router.register(r'reviews', ReviewViewSet, basename='review')
# router.register(r'size', SizeViewSet, basename='size')
# router.register(r'colors', ColorViewSet)


# urlpatterns = [
#     path('addproduct/', AddProductView.as_view(), name='add-product'),
#      path('updateproduct/<int:pk>/', UpdateProductView.as_view(), name='update-product'),
#     path('', product_list, name='product-list'),
#     path('<int:pk>/', product_detail, name='product-detail'),
#     path('', include(router.urls)),
# ]




from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from .views import AdminProductViewSet,UserProductViewSet, CategoryViewSet, ReviewViewSet, AddProductView, SizeViewSet, product_detail, product_list,ColorViewSet,UpdateProductView,CreateReviewView,ProductReviewsView
from .views import *

router = DefaultRouter()
# router.register(r'items', ProductViewSet, basename='product')
# router.register(r'categories', CategoryViewSet, basename='category')
# router.register(r'reviews', ReviewViewSet, basename='review')
# router.register(r'size', SizeViewSet, basename='size')
# router.register(r'colors', ColorViewSet)



admin_router = DefaultRouter()
admin_router.register('items', AdminProductViewSet)
admin_router.register('categories', CategoryViewSet)
admin_router.register('size', SizeViewSet)
admin_router.register('colors', ColorViewSet)

user_router = DefaultRouter()
user_router.register('items', UserProductViewSet)
user_router.register('categories', CategoryViewSet)
user_router.register('reviews', ReviewViewSet)



urlpatterns = [
    path('admin/addproduct/', AddProductView.as_view(), name='add-product'),
     path('admin/updateproduct/<int:pk>/', UpdateProductView.as_view(), name='update-product'),
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin-review-list'),
    path('admin/reviews/<int:review_id>/', AdminReviewDeleteView.as_view(), name='admin-review-delete'),

    
    
    path('', product_list, name='product-list'),
    path('<int:pk>/', product_detail, name='product-detail'),
    # path('', include(router.urls)),
    
    # Admin routes
    path('admin/', include(admin_router.urls)),
    
    # User routes
    path('', include(user_router.urls)),


    path('products/<int:product_id>/reviews/', ProductReviewsView.as_view(), name='product-reviews'),
    path('orders/<int:order_id>/items/<int:item_id>/review/', CreateReviewView.as_view(), name='create-review'),
    path('orders/<int:order_id>/items/<int:item_id>/reviews/', ProductReviewsView.as_view(), name='order-item-reviews'),

    path('<int:product_id>/reviews/', ProductReviewListView.as_view(), name='product-reviews'),
    path('<int:product_id>/review-stats/', ProductReviewStatsView.as_view(), name='product-review-stats'),
]