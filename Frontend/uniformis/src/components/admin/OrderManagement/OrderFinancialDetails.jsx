import React from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { format } from 'date-fns';

const OrderFinancialDetails = ({ order }) => {
  // Calculate totals for active items only
  const activeItems = order.items.filter(item => item.status === 'active');
  const modifiedItems = order.items.filter(
    item => item.status === 'cancelled' || item.status === 'returned' || item.status === 'refunded'
  );

  // Calculate current subtotal based on active items
  const currentSubtotal = activeItems.reduce((sum, item) => (
    sum + parseFloat(item.final_price)
  ), 0);

  // Recalculate coupon discount based on remaining items
  const recalculatedCouponDiscount = order.coupon 
    ? (currentSubtotal * (parseFloat(order.coupon_discount) / parseFloat(order.subtotal))).toFixed(2)
    : 0;

    const totalRefunded = modifiedItems.reduce((sum, item) => (
        sum + parseFloat(item.refund_amount || item.final_price)  // Fallback to final_price if refund_amount is not set
      ), 0);

  // Calculate current final total
  const currentFinalTotal = (
    currentSubtotal - 
    parseFloat(order.discount_amount) - 
    parseFloat(recalculatedCouponDiscount) +
    parseFloat(order.delivery_charges)
  ).toFixed(2);

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return format(new Date(dateString), 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Financial Summary</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Initial Payment</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Original Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Item Discounts:</span>
              <span>-₹{order.discount_amount}</span>
            </div>
            {order.coupon && (
              <div className="flex justify-between text-muted-foreground">
                <span>Original Coupon Discount ({order.coupon.code}):</span>
                <span>-₹{order.coupon_discount}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Charges:</span>
              <span>₹{order.delivery_charges}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Initial Total Paid:</span>
              <span>₹{order.final_total}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Current Order Status</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Current Subtotal:</span>
              <span>₹{currentSubtotal.toFixed(2)}</span>
            </div>
            {order.coupon && (
              <div className="flex justify-between text-muted-foreground">
                <span>Adjusted Coupon Discount:</span>
                <span>-₹{recalculatedCouponDiscount}</span>
              </div>
            )}
    <div className="flex justify-between text-red-600">
      <span>Total Refunded:</span>
      <span>₹{totalRefunded.toFixed(2)}</span>
    </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Final Amount Retained:</span>
              <span className="text-green-600">₹{currentFinalTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {modifiedItems.map((item, index) => (
  <div key={index} className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <Badge 
        variant={
          item.status === 'cancelled' || item.status === 'refunded' 
            ? 'destructive' 
            : 'warning'
        }
      >
        {item.status}
      </Badge>
      <span className="text-sm">{item.product_name}</span>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium">₹{item.refund_amount || item.final_price}</p>
      <p className="text-xs text-muted-foreground">
        {formatDate(item.cancelled_at || item.returned_at)}
      </p>
    </div>
  </div>
))}
    </Card>
  );
};

export default OrderFinancialDetails;