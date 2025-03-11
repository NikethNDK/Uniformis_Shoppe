from .imports import *

logger = logging.getLogger(__name__)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_or_create_cart(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_or_create_cart()
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        variant = get_object_or_404(ProductSizeColor, id=variant_id)
        
        if variant.stock_quantity < quantity:
            return Response(
                {'error': 'Not enough stock available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity = min(cart_item.quantity + quantity, variant.stock_quantity)
            cart_item.save()

        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = self.get_or_create_cart()
        item_id = request.data.get('item_id')
        
        try:
            cart_item = CartItem.objects.get(cart=cart, id=item_id)
            cart_item.delete()
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in cart'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        cart = self.get_or_create_cart()
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            cart_item = CartItem.objects.get(cart=cart, id=item_id)
            if quantity <= 0:
                cart_item.delete()
            else:
                if quantity > cart_item.variant.stock_quantity:
                    return Response(
                        {'error': 'Not enough stock available'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = quantity
                cart_item.save()

            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in cart'},
                status=status.HTTP_404_NOT_FOUND
            )


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def calculate_final_amount(self, cart, coupon_code=None, wallet_amount=0):

        subtotal = cart.get_total_price()
        final_total = subtotal
        coupon_discount = 0
        total_discount = 0
        wallet_amount_used = 0

        # Calculate item-level discounts
        for cart_item in cart.items.all():
            total_discount += self.calculate_item_discount(cart_item)

        final_total = subtotal - total_discount

        # Apply coupon if provided
        if coupon_code:
            try:
                coupon = Coupon.objects.get(
                    code=coupon_code,
                    is_active=True,
                    valid_from__lte=timezone.now(),
                    valid_until__gte=timezone.now()
                )
                
                # Check coupon usage limit
                total_usage_count = CouponUsage.objects.filter(coupon=coupon, is_used=True).count()
                if coupon.usage_limit and total_usage_count >= coupon.usage_limit:
                    raise ValidationError('This coupon has reached its usage limit')

                # For single-use coupons, check if user has already used it
                user_usage_count = CouponUsage.objects.filter(
                    coupon=coupon, 
                    user=self.request.user, 
                    is_used=True
                ).count()
                
                if not coupon.allow_multiple_use and user_usage_count > 0:
                    raise ValidationError('You have already used this coupon')
                
                if subtotal >= coupon.minimum_purchase:
                    coupon_discount = (final_total * coupon.discount_percentage) / 100
                    final_total -= coupon_discount
                else:
                    raise ValidationError(f'Minimum purchase amount of ₹{coupon.minimum_purchase} required')
                    
            except Coupon.DoesNotExist:
                raise ValidationError('Invalid coupon code')
            
         # Apply wallet amount if provided
        if wallet_amount > 0:
            wallet, created = Wallet.objects.get_or_create(user=self.request.user)
            if wallet_amount > wallet.balance:
                raise ValidationError(f'Insufficient wallet balance. Available: ₹{wallet.balance}')
            
            # Use wallet amount up to final_total
            wallet_amount_used = min(wallet_amount, final_total)
            final_total -= wallet_amount_used

        return {
            'subtotal': subtotal,
            'total_discount': total_discount,
            'coupon_discount': coupon_discount,
            'wallet_amount_used': wallet_amount_used,
            'final_total': final_total
        }

    @action(detail=False, methods=['get'])
    def get_wallet_balance(self, request):
        """Get the current user's wallet balance"""
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)


    @action(detail=False, methods=['post'], url_path='create_razorpay_order')
    def create_razorpay_order(self, request):
        try:
            logger.info("Creating Razorpay order for user: %s", request.user)
            cart = get_object_or_404(Cart, user=request.user)
            
            if not cart.items.exists():
                return Response(
                    {'error': 'Cart is empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Calculate final amount including all discounts
            coupon_code = request.data.get('coupon_code')
            wallet_amount = Decimal(request.data.get('wallet_amount', 0))

            amounts = self.calculate_final_amount(cart, coupon_code, wallet_amount)

            wallet, created = Wallet.objects.get_or_create(user=request.user)
            # Create Razorpay order with final amount
            razorpay_order = create_razorpay_order(amounts['final_total'])
            
            # Include amount details in response
            response_data = {
                'razorpay_order': razorpay_order,
                'amount_details': amounts,
                'available_wallet_balance': wallet.balance 
            }
            
            return Response(response_data)
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error("Error creating Razorpay order: %s", str(e))
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        print(request)
        try:
            user = self.request.user
            cart = get_object_or_404(Cart, user=user)
            

            if not cart.items.exists():
                return Response(
                    {'error': 'Cart is empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            address_id = request.data.get('address_id')
            payment_method = request.data.get('payment_method')
            coupon_code = request.data.get('coupon_code')
            wallet_amount = Decimal(request.data.get('wallet_amount', 0))
            #new changes
            razorpay_order_id = request.data.get('razorpay_order_id')
            payment_id = request.data.get('payment_id')


            # Validate address
            try:
                address = Address.objects.get(id=address_id, user=user)
            except Address.DoesNotExist:
                return Response(
                    {'error': 'Invalid address'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Calculate all amounts upfront
            amounts = self.calculate_final_amount(cart, coupon_code, wallet_amount)

                        # Get coupon if provided
            coupon = None
            if coupon_code:
                try:
                    coupon = Coupon.objects.get(code=coupon_code)
                except Coupon.DoesNotExist:
                    return Response(
                        {'error': 'Invalid coupon code'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            #Default payment status
            payment_status = 'pending'

            # Verify Razorpay payment if card payment
            if payment_method == 'card'and amounts['final_total'] > 0:
                if payment_id and request.data.get('signature'):
                    # Payment verification attempt
                    payment_data = {
                        'razorpay_payment_id': payment_id,
                        'razorpay_order_id': razorpay_order_id,
                        'razorpay_signature': request.data.get('signature')
                    }

                    try:
                        client.utility.verify_payment_signature(payment_data)
                        payment_status = 'completed'
                    except razorpay.errors.SignatureVerificationError:
                           payment_status = 'failed'
                else:
                    # No payment data provided
                    payment_status = 'pending'

            if payment_method == 'cod':
                payment_status = 'pending'
            elif amounts['final_total'] == 0 and amounts['wallet_amount_used'] > 0:
                payment_status = 'completed'

            # Create order and items in a transaction
            with transaction.atomic():
                # Create order with pre-calculated amounts
                order = Order.objects.create(
                    user=user,
                    address=address,
                    payment_method=payment_method,
                    subtotal=amounts['subtotal'],
                    discount_amount=amounts['total_discount'],
                    coupon_discount=amounts['coupon_discount'],
                    coupon=coupon,
                    final_total=amounts['final_total'] + amounts['wallet_amount_used'],
                    delivery_charges=0,
                    wallet_amount_used=amounts['wallet_amount_used'],
                    payment_status=payment_status,
                    razorpay_order_id=razorpay_order_id,
                    razorpay_payment_id=payment_id

                )

                # Process wallet payment if used
                if amounts['wallet_amount_used'] > 0:
                    wallet = Wallet.objects.get(user=user)
                    wallet.balance -= amounts['wallet_amount_used']
                    wallet.save()
                    
                    # Create wallet transaction record
                    WalletTransaction.objects.create(
                        wallet=wallet,
                        amount=amounts['wallet_amount_used'],
                        transaction_type='DEBIT',
                        description=f'Payment for order #{order.order_number}'
                    )

                # Create order address 
                OrderAddress.objects.create(
                    user=user,
                    order=order,
                    name=address.name,
                    house_no=address.house_no,
                    city=address.city,
                    state=address.state,
                    pin_code=address.pin_code,
                    address_type=address.address_type,
                    landmark=address.landmark,
                    mobile_number=address.mobile_number,
                    alternate_number=address.alternate_number
                )

                # Create order items and update stock
                for cart_item in cart.items.all():
                    # Calculate item discount
                    original_price = cart_item.variant.price * cart_item.quantity
                    item_discount = self.calculate_item_discount(cart_item)
                    final_price = original_price - item_discount

                    OrderItem.objects.create(
                        order=order,
                        variant=cart_item.variant,
                        product_name=cart_item.variant.product.name,
                        size=cart_item.variant.size.name,
                        color=cart_item.variant.color.name,
                        quantity=cart_item.quantity,
                        original_price=original_price,
                        discount_amount=item_discount,
                        final_price=final_price
                    )

                     # Update stock only for successful/pending payments, not failed ones
                    if payment_status != 'failed':
                        variant = cart_item.variant
                        if variant.stock_quantity < cart_item.quantity:
                            raise ValidationError(f"Not enough stock for {variant.product.name}")
                        variant.stock_quantity -= cart_item.quantity
                        variant.save()

                # Create coupon usage record
                if coupon and payment_status != 'failed':
 
                    # Mark any pending usage as used
                    pending_usage = CouponUsage.objects.filter(
                        coupon=coupon,
                        user=user,
                        is_used=False
                    ).first()
                    
                    if pending_usage:
                        pending_usage.is_used = True
                        pending_usage.used_at = timezone.now()
                        pending_usage.save()
                    else:
                        # Create new usage record if none pending
                        CouponUsage.objects.create(
                            coupon=coupon,
                            user=user,
                            is_used=True,
                            used_at=timezone.now()
                        )

                # Clear cart
                if payment_status != 'failed':
                    cart.items.all().delete()

                serializer = self.get_serializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error("Error creating order: %s", str(e))
            return Response(
                {'error': "Failed to create order"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True,methods=['post'],url_path='retry-payment')
    def retry_payment(self,request,pk=None):
        #new payment for razor pay failed orders

        try:
            order=self.get_object()

            #checking the order eligibility for retry
            if order.payment_status!='failed' and order.payment_status !='pending':
                return Response(
                    {'error':'The order is not eligible for retry'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if order.payment_method !='card':
                return Response(
                    {'error':'Only card payments can be retried'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            amount_to_pay=order.final_total - order.wallet_amount_used
            if amount_to_pay <=0:
                return Response(
                    {'error':'No payment amount due'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            razorpay_order=create_razorpay_order(amount_to_pay)

            #updating the order with new razor pay id
            order.razorpay_order_id=razorpay_order['id']
            order.save()

            return Response({
                'razorpay_order': razorpay_order,
                'order_id': order.id,
                'amount': amount_to_pay
            })
        
        except Exception as e:
            logger.error("Error creating retry payment: %s", str(e))
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    @action(detail=True, methods=['post'], url_path='confirm-retry-payment')
    def confirm_retry_payment(self, request, pk=None):
        """Confirm a retried payment with Razorpay verification"""
        try:
            order = self.get_object()
            
            # Verify Razorpay payment
            payment_data = {
                'razorpay_payment_id': request.data.get('payment_id'),
                'razorpay_order_id': request.data.get('razorpay_order_id'),
                'razorpay_signature': request.data.get('signature')
            }
            
            try:
                client.utility.verify_payment_signature(payment_data)
                
                # Update order with payment details
                order.payment_status = 'completed'
                order.razorpay_payment_id = request.data.get('payment_id')
                order.save()
                
                # Now the order is fully paid, update the status if needed
                if order.status == 'payment_pending':
                    order.status = 'processing'
                    order.save()
                
                return Response({
                    'message': 'Payment successful',
                    'order_id': order.id
                })
                
            except razorpay.errors.SignatureVerificationError:
                return Response(
                    {'error': 'Invalid payment signature'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            logger.error("Error confirming retry payment: %s", str(e))
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=True, methods=['post'], url_path='cancel-item/(?P<item_id>[^/.]+)')
    def cancel_item(self, request, pk=None, item_id=None):
        try:
            order = self.get_object()
            item = order.items.get(id=item_id)
            if not item.can_cancel():
                return Response( 
                    {'error': 'Item cannot be cancelled'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            reason = request.data.get('reason')
            if not reason:
                return Response(
                    {'error': 'Cancellation reason is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.process_cancellation(reason)
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        except OrderItem.DoesNotExist:
            return Response(
                {'error': 'Item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def calculate_item_discount(self, cart_item):
        now = timezone.now()
        product = cart_item.variant.product
        
        # Get product offer
        product_offer = product.offers.filter(
            offer_type='PRODUCT',
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).order_by('-discount_percentage').first()

        # Get category offer
        category_offer = product.category.offers.filter(
            offer_type='CATEGORY',
            is_active=True,
            valid_from__lte=now,
            valid_until__gte=now
        ).order_by('-discount_percentage').first()

        # Get highest discount percentage
        discount_percentage = 0
        if product_offer and category_offer:
            discount_percentage = max(
                product_offer.discount_percentage,
                category_offer.discount_percentage
            )
        elif product_offer:
            discount_percentage = product_offer.discount_percentage
        elif category_offer:
            discount_percentage = category_offer.discount_percentage

        # Calculate discount amount
        original_price = cart_item.variant.price * cart_item.quantity
        return (original_price * discount_percentage) / 100
    
    @action(detail=True, methods=['post'])
    def return_order(self, request, pk=None):
        order = self.get_object()
        return_reason = request.data.get('return_reason')

        if not return_reason:
            return Response({'error': 'Return reason is required'}, status=status.HTTP_400_BAD_REQUEST)

        if order.status != 'delivered':
            return Response({'error': 'Only delivered orders can be returned'}, status=status.HTTP_400_BAD_REQUEST)

        if order.is_returned:
            return Response({'error': 'This order has already been returned'}, status=status.HTTP_400_BAD_REQUEST)

        # Process the return
        order.is_returned = True
        order.return_reason = return_reason
        order.status = 'returned'
        order.save()

        # Increase stock
        for item in order.items.all():
            item.variant.stock_quantity += item.quantity
            item.variant.save()

        return Response({'message': 'Return request submitted successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()

        if order.status == 'delivered':
            return Response({'error': 'Cannot cancel a delivered order'}, status=status.HTTP_400_BAD_REQUEST)

        if order.status == 'cancelled':
            return Response({'error': 'Order is already cancelled'}, status=status.HTTP_400_BAD_REQUEST)

        if not order.can_cancel():
            return Response({'error': 'Order cannot be cancelled. Cancellation is only allowed within 48 hours of placing the order'}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason', 'Order cancelled by user')

        # Update order status
        with transaction.atomic():
        # Update all items status to cancelled
            for item in order.items.all():
                # Calculate proper refund amount for each item
                item.refund_amount = order.calculate_item_refund_amount(item)
                
                # Update item status
                item.status = 'cancelled'
                item.cancelled_at = timezone.now()
                item.cancel_reason = reason
                item.refund_processed = False
                item.save()
                
                # Increase stock
                if item.variant:
                    item.variant.stock_quantity += item.quantity
                    item.variant.save()
            
            # Update order status
            order.status = 'cancelled'
            order.save()
    
        return Response({'message': 'Order cancelled successfully'}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

  
@action(detail=False, methods=['post'])
def razorpay_webhook(self, request):
    try:
        payload = request.body.decode('utf-8')
        signature = request.headers.get('X-Razorpay-Signature')

        client.utility.verify_webhook_signature(payload, signature, settings.RAZORPAY_WEBHOOK_SECRET)
        
        event = json.loads(payload)
        if event['event'] == 'payment.captured':
            payment_id = event['payload']['payment']['entity']['id']
            order = Order.objects.get(razorpay_payment_id=payment_id)
            order.payment_status = 'completed'
            order.save()
            
        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    



class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset=Wallet.objects.filter(user=self.request.user)
        print("Wallet Data : ",queryset)
        return queryset

    @action(detail=False, methods=['get'])
    def transactions(self, request):
        try:
            # create if it doesn't exist
            wallet, created = Wallet.objects.get_or_create(
                user=request.user,
                defaults={
                    'balance': 0  # default balance
                }
            )
            
            # Get transactions for the wallet
            transactions = wallet.transactions.all() 
            
            # Serialize the transactions
            serializer = WalletTransactionSerializer(transactions, many=True)
            print('wallet_balance', wallet.balance)
            return Response({
                'wallet_balance': wallet.balance,
                'transactions': serializer.data
            })
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch wallet transactions',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



