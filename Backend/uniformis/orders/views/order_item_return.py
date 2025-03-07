from .imports import *

class OrderItemReturnView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id, item_id):
        """
        Process return for a specific order item
        
        Request body should contain:
        - return_reason: Reason for returning the item
        """
        try:
            # Validate that the order belongs to the current user
            order = Order.objects.get(
                id=order_id, 
                user=request.user
            )

            # Find the specific item in the order
            order_item = order.items.get(
                id=item_id, 
                status='active'  # Only active items can be returned
            )

            # Validate return conditions
            if not self.can_return_item(order_item):
                return Response(
                    {"error": "Item cannot be returned at this time"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate return reason
            return_reason = request.data.get('return_reason')
            if not return_reason:
                return Response(
                    {"error": "Return reason is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

 # Process the return
            with transaction.atomic():
                # Update item status
                order_item.status = 'returned'
                order_item.returned_at = timezone.now()
                order_item.return_reason = return_reason
                order_item.is_returned = True
                order_item.save()
                
                # Optional: Update order status if all items are returned
                self.update_order_status(order_item.order)

            # Serialize and return the updated order
            serializer = OrderSerializer(
                order, 
                context={'request': request}
            )

            return Response(
                serializer.data, 
                status=status.HTTP_200_OK
            )

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except OrderItem.DoesNotExist:
            return Response(
                {"error": "Order item not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def can_return_item(self, order_item):
        """
        Check if an item can be returned
        
        Return conditions:
        1. Order must be delivered
        2. Item must be active
        3. Within return window (e.g., 14 days from delivery)
        """
        # Ensure the order is delivered
        if order_item.order.status != 'delivered':
            return False

        # Item must be active
        if order_item.status != 'active':
            return False

        # Check return window (e.g., 14 days from order delivery)
        delivery_date = order_item.order.delivered_at
        return_window = delivery_date + timezone.timedelta(days=14)
        
        return timezone.now() <= return_window


    def update_order_status(self, order):
        """
        Update order status if all items are returned
        """
        # Check if all items in the order are returned
        all_returned = all(
            item.status == 'returned' 
            for item in order.items.all()
        )

        if all_returned:
            order.status = 'returned'
            order.save()