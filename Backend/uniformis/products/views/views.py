from .imports import *

logger = logging.getLogger(__name__)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # permission_classes = [permissions.IsAdminUser]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Category.objects.all()
        active_only = self.request.query_params.get('active_only', None)
        
        if active_only == 'true':
            queryset = queryset.filter(is_active=True)
        elif not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        
        return queryset


    @action(detail=True, methods=['PATCH'])
    def toggle_active(self, request, pk=None):
        category = self.get_object()
        category.is_active = not category.is_active
        category.save()
        return Response({'status': 'category status updated'})

class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [permissions.IsAdminUser]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer
    permission_classes = [permissions.IsAdminUser]

class ProductPagination(PageNumberPagination):
    page_size=10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BaseProductViewSet(viewsets.ModelViewSet):
    """Base ViewSet with common functionality"""
    queryset = Product.objects.filter(is_deleted=False)
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer

class AdminProductViewSet(BaseProductViewSet):
    """ViewSet for admin-specific product operations"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        # return Product.objects.filter(is_deleted=False).order_by('-id')
        queryset = Product.objects.filter(is_deleted=False).order_by('-id')
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset

    @action(detail=True, methods=['POST'])
    def update_stock(self, request, pk=None):
        product = self.get_object()
        new_stock = request.data.get('stock_quantity')
        if new_stock is not None:
            product.stock_quantity = new_stock
            product.save()
            return Response({'status': 'stock updated'})
        return Response(
            {'error': 'stock_quantity required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['PATCH'])
    def toggle_active(self, request, pk=None):
        product = self.get_object()
        product.is_active = not product.is_active
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def restore(self, request, pk=None):
        product = self.get_object()
        product.is_deleted = False
        product.is_active = True
        product.save()
        return Response({'status': 'product restored'})

    @action(detail=True, methods=['DELETE'])
    def delete_image(self, request, pk=None):
        image_id = request.data.get('image_id')
        if not image_id:
            return Response(
                {'error': 'image_id required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            image = ProductImage.objects.get(id=image_id, product_id=pk)
            image.delete()
            return Response({'status': 'image deleted'})
        except ProductImage.DoesNotExist:
            return Response(
                {'error': 'Image not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, 
            data=request.data, 
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if 'images' in request.FILES:
            for image in request.FILES.getlist('images'):
                ProductImage.objects.create(product=instance, image=image)

        return Response(serializer.data)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=['PATCH'])
    def toggle_variant(self, request, pk=None):
        variant_id = request.data.get('variant_id')
        print("Received variant_id:", variant_id)
        print("Full request data:", request.data)

        if not variant_id:
            return Response(
                {'error': 'variant_id required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            variant = ProductSizeColor.objects.get(
                id=variant_id,
                product_id=pk,
                is_deleted=False
            )
            print("Found variant:", variant) 
            variant.is_active = not variant.is_active
            variant.save()
            serializer = ProductSizeColorSerializer(variant)
            return Response(serializer.data)
        except ProductSizeColor.DoesNotExist:
            return Response(
                {'error': 'Variant not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print("Error in toggle_variant:", str(e))  # Debug print
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['POST'])
    def restore_variant(self, request, pk=None):
        variant_id = request.data.get('variant_id')
        if not variant_id:
            return Response(
                {'error': 'variant_id required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            variant = ProductSizeColor.objects.get(
                id=variant_id,
                product_id=pk,
                is_deleted=True
            )
            variant.is_deleted = False
            variant.is_active = True
            variant.save()
            serializer = ProductSizeColorSerializer(variant)
            return Response(serializer.data)
        except ProductSizeColor.DoesNotExist:
            return Response(
                {'error': 'Variant not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    

class UserProductViewSet(BaseProductViewSet):
    """ViewSet for customer-facing product operations"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            is_deleted=False
        ).order_by('-created_at')

    @action(detail=True, methods=['GET'])
    def similar_products(self, request, pk=None):
        product = self.get_object()
        similar_products = Product.objects.filter(
            category=product.category,
            is_active=True,
            is_deleted=False
        ).exclude(id=product.id)[:5]
        serializer = ProductSerializer(similar_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def best_sellers(self, request):
        best_sellers = Product.objects.filter(
            is_active=True,
            is_deleted=False
        ).annotate(
            order_count=Count('orderitem')
        ).order_by('-order_count')[:8]
        serializer = self.get_serializer(best_sellers, many=True)
        return Response(serializer.data)




class AddProductView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        try:
            print("Received request data:", request.data)  # Debug 
            
            # Get the variants data
            variants_data = request.data.get('variants_data', '[]')
            if isinstance(variants_data, str):
                variants_data = json.loads(variants_data)
            
            # Prepare product data
            product_data = {
                'name': request.data.get('name'),  
                # 'price': request.data.get('price'),
                'category_id': request.data.get('category_id'), 
                'description': request.data.get('description'),
                'variants_data': variants_data
            }
            
            print("Processed product data:", product_data)  # Debug print
            
            # Create product using serializer
            product_serializer = ProductSerializer(data=product_data)
            if product_serializer.is_valid():
                # Save the product
                product = product_serializer.save()
                
                # Handle images
                images = request.FILES.getlist('images')
                for image in images:
                    ProductImage.objects.create(product=product, image=image)
                
                # Return the serialized data
                return Response(product_serializer.data, status=status.HTTP_201_CREATED)
            
            print("Serializer errors:", product_serializer.errors)  # Debug print
            return Response(product_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except json.JSONDecodeError as e:
            return Response(
                {"error": f"Invalid variants data format: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error adding product: {str(e)}")
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateProductView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def patch(self, request, *args, **kwargs):
        try:
            product_id = kwargs.get('pk')
            product = Product.objects.get(id=product_id)
            
            logger.info(f"Received update request for product {product_id}")
            logger.debug(f"Request data: {request.data}")
            
            # Get the variants data
            variants_data = request.data.get('variants_data', '[]')
            if isinstance(variants_data, str):
                variants_data = json.loads(variants_data)
            
            # Prepare product data
            product_data = {
                'name': request.data.get('name'),  
                'category_id': request.data.get('category_id'), 
                'description': request.data.get('description'),
                'variants_data': variants_data
            }
            
            logger.debug(f"Processed product data: {product_data}")
            
            # Update product using serializer
            product_serializer = ProductSerializer(product, data=product_data, partial=True)
            if product_serializer.is_valid():
                # Save the product
                product = product_serializer.save()
                
                # Handle images
                images = request.FILES.getlist('images')
                for image in images:
                    ProductImage.objects.create(product=product, image=image)
                
                # Return the serialized data
                return Response(product_serializer.data, status=status.HTTP_200_OK)
            
            logger.error(f"Serializer errors: {product_serializer.errors}")
            return Response(product_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Product.DoesNotExist:
            logger.error(f"Product with id {kwargs.get('pk')} not found")
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error updating product: {str(e)}")
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET', 'PUT', 'DELETE'])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        product.soft_delete()
        return Response({'message': 'Product successfully deleted'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def product_list(request):
    products = Product.objects.filter(is_deleted=False)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)
