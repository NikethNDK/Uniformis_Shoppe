from .imports import *

class AdminOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Order.objects.select_related('user').prefetch_related('items').all().order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        
        try:
            order = self.get_object()
            new_status = request.data.get('status')
            print("the request in the update status",new_status)
            
            if order.status == 'returned':
                return Response(
                    {'error': 'Status cannot be updated as the order is already returned.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if new_status not in dict(Order.STATUS_CHOICES):
                return Response(
                    {'error': 'Invalid status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            order.status = new_status
            order.delivered_at=now()
            order.save()

            if new_status=='delivered' and order.payment_status!='completed':
                order.payment_status='completed'
                order.save()

            return Response(self.get_serializer(order).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        order = self.get_object()
        
        if order.payment_status == 'refunded':
            return Response(
                {'error': 'Order is already refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process full order refund
        wallet, created = Wallet.objects.get_or_create(user=order.user)
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=order.final_total,
            transaction_type='CREDIT',
            description=f'Refund for order #{order.order_number}'
        )
        wallet.balance += order.final_total
        wallet.save()
            
        order.payment_status = 'refunded'
        order.save()
        
        # Update all items status to refunded
        order.items.all().update(status='refunded')
        
        # Validate and adjust coupon if needed
        order.validate_coupon_after_cancellation()
        
        return Response({'status': 'Full order refund processed and credited to wallet'})
    
    @action(detail=True, methods=['post'], url_path='refund-item/(?P<item_id>[^/.]+)')
    def refund_item(self, request, pk=None, item_id=None):
        order = self.get_object()

        try:
            item = order.items.get(id=item_id)
            print(item.status)
        except OrderItem.DoesNotExist:
            return Response(
                {'error': 'Item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if item.status == 'refunded':
            return Response(
                {'error': 'Item is already refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if item.status != 'cancelled' and item.status!='returned':
            return Response(
                {'error': 'Only cancelled and returned items can be refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                # Calculate refund amount and handle cancellation
                refund_amount = order.calculate_item_refund_amount(item)

                # Process the refund
                order.process_refund(refund_amount, item)

                # Update item status
                item.status = 'refunded'
                item.refund_amount = refund_amount
                item.refund_processed = True
                item.save()

                # Check if all items are refunded
                if not order.items.exclude(status='refunded').exists():
                    order.payment_status = 'refunded'
                    order.save()

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'status': 'Item refund processed and credited to wallet',
            'refunded_amount': float(refund_amount),
            'coupon_adjustment': float(item.final_price - refund_amount)
        })

  