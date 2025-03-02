from .imports import *

logger = logging.getLogger(__name__)
class SalesReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    
    def get_report_data(self, start_date, end_date):
        orders = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lt=end_date
        )
        
        total_sales = orders.aggregate(total=Sum('final_total'))['total'] or 0
        original_total = orders.aggregate(total=Sum('subtotal'))['total'] or 0
        total_orders = orders.count()
        total_discount = orders.aggregate(
            total=Sum(F('discount_amount') + F('coupon_discount'))
        )['total'] or 0
        total_cancelled = OrderItem.objects.filter(
            order__in=orders, 
            status='cancelled'
        ).aggregate(
            total=Sum('final_price')
        )['total'] or 0
        total_refunded = OrderItem.objects.filter(
            order__in=orders, 
            status__in=['cancelled', 'returned'],
            refund_processed=True
        ).aggregate(
            total=Sum('refund_amount')
        )['total'] or 0

        # Get detailed product information
        product_sales = OrderItem.objects.filter(
            order__in=orders
        ).values(
            'id',
            'product_name',
            'variant__product__category__name',
            'order__order_number',
            'order__created_at',
            'status',
            'cancelled_at',
            'returned_at',
            'original_price',
            'discount_amount',
            'final_price',
            'refund_amount',
            'refund_processed',
            'quantity'
        ).annotate(
            coupon_percentage=Case(
                When(
                    order__coupon__isnull=False,
                    then=F('order__coupon__discount_percentage')
                ),
                default=Value(0),
                output_field=DecimalField()
            ),
            coupon_code=Case(
                When(
                    order__coupon__isnull=False,
                    then=F('order__coupon__code')
                ),
                default=Value(''),
                output_field=CharField()
            )
        ).order_by('-order__created_at')

        # Get payment methods distribution
        payment_methods = orders.values('payment_method').annotate(
            count=Count('id'),
            total=Sum('final_total')
        ).order_by('-total')

        # Get daily sales trend
        daily_sales = orders.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total=Sum('final_total'),
            count=Count('id')
        ).order_by('date')

        return {
            "total_sales": total_sales,
            "original_total": original_total,
            "total_orders": total_orders,
            "total_discount": total_discount,
            "total_cancelled": total_cancelled,
            "total_refunded": total_refunded,
            "net_sales": total_sales - total_refunded,
            "products": list(product_sales),
            "payment_methods": list(payment_methods),
            "daily_trend": list(daily_sales)
        }

    def get_date_range(self, report_type, start_date=None, end_date=None):
        today = timezone.now().date()
        
        if report_type == 'daily':
            start_date = today
            end_date = today + timedelta(days=1)  # Include full day
        elif report_type == 'weekly':
            # Start from previous Sunday (or configured week start)
            start_date = today - timedelta(days=7)
            end_date = today + timedelta(days=1)
        elif report_type == 'monthly':
            # First day of current month
            start_date = today.replace(day=1)
            # First day of next month
            if start_date.month == 12:
                end_date = today.replace(year=start_date.year + 1, month=1, day=1)
            else:
                end_date = today.replace(month=start_date.month + 1, day=1)
        elif report_type == 'yearly':
            # First day of current year
            start_date = today.replace(month=1, day=1)
            # First day of next year
            end_date = today.replace(year=start_date.year + 1, month=1, day=1)
        elif report_type == 'custom':
            if not start_date or not end_date:
                raise ValueError("Start date and end date are required for custom reports")
            start_date = timezone.datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = timezone.datetime.strptime(end_date, "%Y-%m-%d").date() + timedelta(days=1)  # Include full end day
        
        return start_date, end_date

    @action(detail=False, methods=['get'])
    def generate(self, request):
        try:
            report_type = request.query_params.get('type', 'daily')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            start_date, end_date = self.get_date_range(report_type, start_date, end_date)
            report_data = self.get_report_data(start_date, end_date)
            
            # Add date range information to response
            report_data['report_period'] = {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': (end_date - timedelta(days=1)).strftime('%Y-%m-%d'),
                'type': report_type
            }
            
            return Response(report_data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to generate report: {str(e)}")
            return Response({"error": "Failed to generate report"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)