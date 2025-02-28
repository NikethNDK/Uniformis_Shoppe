from .imports import *

# class CreateReviewView(APIView):
#     permission_classes=[permissions.IsAuthenticated]


    
#     def post(self, request, order_id, item_id):
#         rating = request.data.get("rating")
#         comment = request.data.get('comment')

#         print("rating and comment : ", rating)
#         print(comment)

#         if rating is None:
#             return Response({'error': 'Rating is required'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             rating = int(rating)
#             if rating < 1 or rating > 5:
#                 return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
#         except (ValueError, TypeError):
#             return Response({'error': 'Rating must be a number between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)

#         if not comment:
#             return Response({'error': 'Comment is required'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             # Checking order exists and it belongs to the user
#             print("Looking for order item...")
#             order_item = get_object_or_404(OrderItem, id=item_id, order_id=order_id, order__user=request.user)
#             print(f"Found order item: {order_item.id}")

#             # Check if variant exists
#             print("Checking variant...")
#             if not order_item.variant:
#                 print("No variant found")
#                 return Response(
#                     {'error': 'Cannot review this product as variant information is not available'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#             print(f"Found variant: {order_item.variant.id}")

#             # Get the product through the variant relationship
#             print("Getting product...")
#             product = order_item.variant.product
#             print(f"Found product: {product.id}")

#             # Check if user already reviewed
#             print("Checking for existing review...")
#             existing_review = Review.objects.filter(user=request.user, order_item=order_item).first()
#             if existing_review:
#                 print(f"Found existing review: {existing_review.id}")
#                 return Response(
#                     {'error': 'You have already reviewed this product for this order item'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#             print("No existing review found")

#             print("Creating review...")
#             review = Review.objects.create(
#                 user=request.user,
#                 order_item=order_item,
#                 product=product,
#                 rating=rating,
#                 comment=comment
#             )
#             order_item.is_reviewed = True
#             order_item.save()

#             print(f"Review created with ID: {review.id} and order_item.is_reviewed set to True")

#             serializer = ReviewSerializer(review)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         except Exception as e:
#             print(f"ERROR: {str(e)}")
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

# class ProductReviewsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, order_id, item_id):
#         try:
#             # Get the specific order item
#             order_item = get_object_or_404(OrderItem, id=item_id, order_id=order_id, order__user=request.user)
            
#             # Get the review for this order item
#             review = get_object_or_404(Review, order_item=order_item, user=request.user)
            
#             serializer = ReviewSerializer(review)
#             return Response(serializer.data)
#         except Http404:
#             return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
#     def put(self, request, order_id, item_id):
#         try:
#             # Get the review to update
#             order_item = get_object_or_404(OrderItem, id=item_id, order_id=order_id, order__user=request.user)
#             review = get_object_or_404(Review, order_item=order_item, user=request.user)
            
#             # Update the review with new data
#             rating = request.data.get("rating")
#             comment = request.data.get('comment')
            
#             if rating is None:
#                 return Response({'error': 'Rating is required'}, status=status.HTTP_400_BAD_REQUEST)
            
#             try:
#                 rating = int(rating)
#                 if rating < 1 or rating > 5:
#                     return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
#             except (ValueError, TypeError):
#                 return Response({'error': 'Rating must be a number between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
            
#             if not comment:
#                 return Response({'error': 'Comment is required'}, status=status.HTTP_400_BAD_REQUEST)
            
#             # Update the review
#             review.rating = rating
#             review.comment = comment
#             review.save()
            
#             serializer = ReviewSerializer(review)
#             return Response(serializer.data)
#         except Http404:
#             return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



class CreateReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_id, item_id):
        rating = request.data.get("rating")
        comment = request.data.get('comment')

        print("rating and comment : ", rating)
        print(comment)

        if rating is None:
            return Response({'error': 'Rating is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'error': 'Rating must be a number between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)

        if not comment:
            return Response({'error': 'Comment is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Checking order exists and it belongs to the user
            print("Looking for order item...")
            order_item = get_object_or_404(OrderItem, id=item_id, order_id=order_id, order__user=request.user)
            print(f"Found order item: {order_item.id}")

            # Check if variant exists
            print("Checking variant...")
            if not order_item.variant:
                print("No variant found")
                return Response(
                    {'error': 'Cannot review this product as variant information is not available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            print(f"Found variant: {order_item.variant.id}")

            # Get the product through the variant relationship
            print("Getting product...")
            product = order_item.variant.product
            print(f"Found product: {product.id}")

            # Check if user already reviewed
            print("Checking for existing review...")
            existing_review = Review.objects.filter(user=request.user, order_item=order_item).first()
            if existing_review:
                print(f"Found existing review: {existing_review.id}")
                return Response(
                    {'error': 'You have already reviewed this product for this order item'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            print("No existing review found")

            print("Creating review...")
            review = Review.objects.create(
                user=request.user,
                order_item=order_item,
                product=product,
                rating=rating,
                comment=comment
            )
            order_item.is_reviewed = True
            order_item.save()

            print(f"Review created with ID: {review.id} and order_item.is_reviewed set to True")

            serializer = ReviewSerializer(review)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"ERROR: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

class ProductReviewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id, item_id):
        try:
            # Get the specific order item
            order_item = get_object_or_404(OrderItem, id=item_id, order_id=order_id, order__user=request.user)
            
            # Get the review for this order item
            review = get_object_or_404(Review, order_item=order_item, user=request.user)
            
            serializer = ReviewSerializer(review)
            return Response(serializer.data)
        except Http404:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, order_id, item_id):
        try:
            # Get the review to update
            order_item = get_object_or_404(OrderItem, id=item_id, order_id=order_id, order__user=request.user)
            review = get_object_or_404(Review, order_item=order_item, user=request.user)
            
            # Update the review with new data
            rating = request.data.get("rating")
            comment = request.data.get('comment')
            
            if rating is None:
                return Response({'error': 'Rating is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                rating = int(rating)
                if rating < 1 or rating > 5:
                    return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({'error': 'Rating must be a number between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not comment:
                return Response({'error': 'Comment is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update the review
            review.rating = rating
            review.comment = comment
            review.save()
            
            serializer = ReviewSerializer(review)
            return Response(serializer.data)
        except Http404:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# New views for product reviews with pagination
class ReviewPagination(PageNumberPagination):
    page_size = 4
    page_size_query_param = 'page_size'
    max_page_size = 20


class ProductReviewListView(APIView):
    pagination_class = ReviewPagination
    
    def get(self, request, product_id):
        try:
            # Get the product
            product = get_object_or_404(Product, id=product_id)
            
            # Get all reviews for this product
            reviews = Review.objects.filter(product=product).order_by('-created_at')
            
            # Paginate results
            paginator = self.pagination_class()
            paginated_reviews = paginator.paginate_queryset(reviews, request)
            
            serializer = ReviewSerializer(paginated_reviews, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Http404:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProductReviewStatsView(APIView):
    def get(self, request, product_id):
        try:
            # Get the product
            product = get_object_or_404(Product, id=product_id)
            
            # Get review statistics
            reviews = Review.objects.filter(product=product)
            review_count = reviews.count()
            
            # Calculate average rating
            avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
            
            # Calculate rating distribution
            distribution = {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0
            }
            
            # Count reviews for each rating
            rating_counts = reviews.values('rating').annotate(count=Count('id'))
            
            for rating_data in rating_counts:
                rating = rating_data['rating']
                count = rating_data['count']
                distribution[rating] = count
            
            stats = {
                'average': avg_rating,
                'count': review_count,
                'distribution': distribution
            }
            
            return Response(stats)
        except Http404:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

