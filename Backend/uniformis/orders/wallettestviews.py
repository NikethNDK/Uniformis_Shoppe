class OrderViewSet(viewsets.ModelViewSet):
    # ... existing code ...

    def calculate_final_amount(self, cart, coupon_code=None, wallet_amount=0):
        """
        Calculate final amount including all discounts, coupons and wallet payments
        """
        amounts = super().calculate_final_amount(cart, coupon_code)
        
        # If wallet amount is provided, deduct it from final total
        if wallet_amount > 0:
            amounts['wallet_amount'] = min(wallet_amount, amounts['final_total'])
            amounts['final_total'] -= amounts['wallet_amount']
        else:
            amounts['wallet_amount'] = 0

        return amounts

    @action(detail=False, methods=['post'], url_path='create_razorpay_order')
    def create_razorpay_order(self, request):
        try:
            logger.info("Creating Razorpay order for user: %s", request.user)
            cart = get_object_or_404(Cart, user=request.user)
            
            if not cart.items.exists():
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            # Get wallet amount to use
            wallet_amount = Decimal(request.data.get('wallet_amount', 0))
            
            # Validate wallet amount if provided
            if wallet_amount > 0:
                wallet = get_object_or_404(Wallet, user=request.user)
                if wallet_amount > wallet.balance:
                    return Response({'error': 'Insufficient wallet balance'}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate final amount including wallet deduction
            amounts = self.calculate_final_amount(
                cart, 
                request.data.get('coupon_code'),
                wallet_amount
            )
            
            # Only create Razorpay order if there's remaining amount after wallet
            if amounts['final_total'] > 0:
                razorpay_order = create_razorpay_order(amounts['final_total'])
                response_data = {
                    'razorpay_order': razorpay_order,
                    'amount_details': amounts
                }
            else:
                response_data = {'amount_details': amounts}
            
            return Response(response_data)
        except Exception as e:
            logger.error("Error creating Razorpay order: %s", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        try:
            user = self.request.user
            cart = get_object_or_404(Cart, user=user)

            if not cart.items.exists():
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            address_id = request.data.get('address_id')
            payment_method = request.data.get('payment_method')
            coupon_code = request.data.get('coupon_code')
            wallet_amount = Decimal(request.data.get('wallet_amount', 0))

            # Validate address
            try:
                address = Address.objects.get(id=address_id, user=user)
            except Address.DoesNotExist:
                return Response({'error': 'Invalid address'}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate all amounts including wallet deduction
            amounts = self.calculate_final_amount(cart, coupon_code, wallet_amount)

            # Handle wallet payment
            if wallet_amount > 0:
                wallet = get_object_or_404(Wallet, user=user)
                if wallet_amount > wallet.balance:
                    return Response({'error': 'Insufficient wallet balance'}, status=status.HTTP_400_BAD_REQUEST)

            # Verify Razorpay payment if card payment is involved
            if payment_method in ['card', 'card_wallet'] and amounts['final_total'] > 0:
                payment_data = {
                    'razorpay_payment_id': request.data.get('payment_id'),
                    'razorpay_order_id': request.data.get('razorpay_order_id'),
                    'razorpay_signature': request.data.get('signature')
                }

                try:
                    client.utility.verify_payment_signature(payment_data)
                except razorpay.errors.SignatureVerificationError:
                    return Response({'error': 'Invalid payment signature'}, status=status.HTTP_400_BAD_REQUEST)

            # Create order and process wallet transaction in atomic transaction
            with transaction.atomic():
                # Create order
                order = Order.objects.create(
                    user=user,
                    address=address,
                    payment_method=payment_method,
                    subtotal=amounts['subtotal'],
                    discount_amount=amounts['total_discount'],
                    coupon_discount=amounts['coupon_discount'],
                    wallet_amount=amounts['wallet_amount'],
                    coupon=coupon,
                    final_total=amounts['final_total'],
                    delivery_charges=0,
                    payment_status='completed' if payment_method in ['card', 'card_wallet', 'wallet'] else 'pending'
                )

                # Process wallet transaction if used
                if wallet_amount > 0:
                    wallet = Wallet.objects.get(user=user)
                    wallet.balance -= wallet_amount
                    wallet.save()

                    # Create wallet transaction record
                    WalletTransaction.objects.create(
                        wallet=wallet,
                        amount=wallet_amount,
                        transaction_type='DEBIT',
                        description=f'Payment for order #{order.id}'
                    )

                # ... rest of the order creation code (OrderAddress, OrderItems, etc.) ...

                serializer = self.get_serializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error("Error creating order: %s", str(e))
            return Response({'error': "Failed to create order"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)