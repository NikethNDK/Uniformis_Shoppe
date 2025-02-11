from rest_framework import serializers
from .models import Category, Product, Review, ProductImage, Size,Color,ProductSizeColor

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'is_active']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code']
class ProductSizeColorSerializer(serializers.ModelSerializer):
    size = SizeSerializer(read_only=True)
    color = ColorSerializer(read_only=True)
    size_id = serializers.IntegerField(write_only=True)
    color_id = serializers.IntegerField(write_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = ProductSizeColor
        fields = ['id', 'size', 'color', 'size_id', 'color_id', 'stock_quantity','price']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    variants = ProductSizeColorSerializer(many=True, read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    # For writing variants
    variants_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    def validate(self, data):
        print("Received data:", data)  # Debug print
        
        if not data.get('name'):
            raise serializers.ValidationError({"name": "Product name is required"})
            
        if not data.get('category_id'):
            raise serializers.ValidationError({"category_id": "Category is required"})
            
        # if not data.get('price'):
        #     raise serializers.ValidationError({"price": "Price is required"})
            
        return data

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'name', 'description',
            'images', 'is_active', 'is_deleted',
            'variants', 'variants_data','created_at'
        ]

    def create(self, validated_data):
        try:
            print("Creating product with data:", validated_data) 
            variants_data = validated_data.pop('variants_data', [])
            product = Product.objects.create(**validated_data)

            # Create variants
            for variant in variants_data:
                ProductSizeColor.objects.create(
                    product=product,
                    size_id=variant['size_id'],
                    color_id=variant['color_id'],
                    stock_quantity=variant['stock_quantity'],
                    price=variant['price']
                )

            return product
        except Exception as e:
            print("Error creating product:", str(e))  # Debug print
            raise serializers.ValidationError(str(e))

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants_data', None)
        
        # Update product
        instance = super().update(instance, validated_data)
        
        # Update variants
        if variants_data is not None:
            current_variants = { (v.size_id, v.color_id): v for v in instance.variants.all() }
            
            # Update or create variants
            for variant in variants_data:
                key = (variant['size_id'], variant['color_id'])
                if key in current_variants:
                    # Update existing
                    current_variant = current_variants[key]
                    current_variant.stock_quantity = variant['stock_quantity']
                    current_variant.price = variant['price']
                    current_variant.save()
                else:
                    # Create new
                    ProductSizeColor.objects.create(
                        product=instance,
                        size_id=variant['size_id'],
                        color_id=variant['color_id'],
                        stock_quantity=variant['stock_quantity'],
                        price=variant['price']
                    )
            
            # Remove deleted variants
            existing_keys = set((v['size_id'], v['color_id']) for v in variants_data)
            for key, variant in current_variants.items():
                if key not in existing_keys:
                    variant.delete()
        
        return instance



class ProductDetailSerializer(ProductSerializer):
    size_color_options = ProductSizeColorSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['reviews','size_color_options']
