from .imports import *


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def get_or_create_wishlist(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        wishlist = self.get_or_create_wishlist()
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            variant = get_object_or_404(ProductSizeColor, id=variant_id)
            
            if variant.stock_quantity < quantity:
                return Response(
                    {'error': 'Not enough stock available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            wishlist_item, created = WishlistItem.objects.get_or_create(
                wishlist=wishlist,
                variant=variant,
                defaults={'quantity': quantity}
            )

            if not created:
                wishlist_item.quantity = min(wishlist_item.quantity + quantity, variant.stock_quantity)
                wishlist_item.save()

            serializer = self.get_serializer(wishlist)
            return Response(serializer.data)
            
        except IntegrityError:
            return Response(
                {'error': 'Item already exists in wishlist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        wishlist = self.get_or_create_wishlist()
        item_id = request.data.get('item_id')
        
        try:
            wishlist_item = wishlist.wishitems.get(id=item_id)  # Changed to wishitems
            wishlist_item.delete()
            serializer = self.get_serializer(wishlist)
            return Response(serializer.data)
        except WishlistItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in wishlist'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        wishlist = self.get_or_create_wishlist()
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            wishlist_item = wishlist.wishitems.get(id=item_id)  # Changed to wishitems
            
            if quantity <= 0:
                wishlist_item.delete()
            else:
                if quantity > wishlist_item.variant.stock_quantity:
                    return Response(
                        {'error': 'Not enough stock available'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                wishlist_item.quantity = quantity
                wishlist_item.save()

            serializer = self.get_serializer(wishlist)
            return Response(serializer.data)
        except WishlistItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in wishlist'},
                status=status.HTTP_404_NOT_FOUND
            )
