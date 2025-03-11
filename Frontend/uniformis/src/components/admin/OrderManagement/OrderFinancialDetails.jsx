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
  const recalculatedCouponDiscount = order.coupon && parseFloat(order.subtotal) !== 0
    ? (currentSubtotal * (parseFloat(order.coupon_discount) / parseFloat(order.subtotal))).toFixed(2)
    : 0;

  // Calculate the processed refunds (with actual refund_amount)
  const processedRefunds = modifiedItems.reduce((sum, item) => {
    if (item.refund_amount) {
      return sum + parseFloat(item.refund_amount);
    }
    return sum;
  }, 0);

  // Calculate estimated pending refunds (for items without refund_amount)
  const pendingItems = modifiedItems.filter(item => !item.refund_amount && (item.status === 'returned' || item.status === 'cancelled'));
  const pendingRefundTotal = pendingItems.reduce((sum, item) => {
    // Calculate coupon impact on this item
    const itemOriginalPrice = parseFloat(item.final_price);
    const couponImpact = order.coupon && parseFloat(order.subtotal) !== 0
      ? (itemOriginalPrice * (parseFloat(order.coupon_discount) / parseFloat(order.subtotal)))
      : 0;
      
    // Item refund should be the price minus its portion of the coupon discount
    const estimatedRefund = itemOriginalPrice - couponImpact;
    return sum + estimatedRefund;
  }, 0);

  // Total refunded amount (processed + estimated pending)
  const totalRefunded = processedRefunds;
  const totalPendingRefund = pendingRefundTotal;

  // Calculate original total from items instead of using order.final_total
  const originalTotalFromItems = order.items.reduce((sum, item) => (
    sum + parseFloat(item.final_price)
  ), 0);
  
  // Add delivery charges to the calculated total
  const calculatedOriginalTotal = originalTotalFromItems + parseFloat(order.delivery_charges || 0);

  // Calculate current final total - use the active items sum instead of subtracting from potentially incorrect final_total
  const currentFinalTotal = activeItems.length > 0 ? currentSubtotal.toFixed(2) : "0.00";

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return format(new Date(dateString), 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Determine the actual payment status based on order status and payment status
  const determinePaymentStatusDisplay = () => {
    if (order.status === 'cancelled' && order.payment_status === 'refunded') {
      return 'fully_refunded';
    } else if (processedRefunds > 0 && activeItems.length > 0) {
      return 'partially_refunded';
    } else if (order.payment_status === 'pending') {
      return 'pending';
    } else if (activeItems.length === 0 && modifiedItems.length > 0) {
      return 'to_be_refunded';
    } else {
      return 'paid';
    }
  };

  const paymentStatus = determinePaymentStatusDisplay();
  
  // Consider wallet amount in calculations
  const walletAmountUsed = parseFloat(order.wallet_amount_used) || 0;
  const cardAmountPaid = parseFloat(order.final_total) - walletAmountUsed;

  // For debugging - log values to help understand discrepancies
  console.log("Order final_total:", order.final_total);
  console.log("Sum of item prices:", originalTotalFromItems);
  console.log("Active items total:", currentSubtotal);
  console.log("Total refunded:", totalRefunded);

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Financial Summary</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            Original Payment Details
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Original Subtotal:</span>
              <span>₹{originalTotalFromItems.toFixed(2)}</span>
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
            {walletAmountUsed > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Wallet Amount Used:</span>
                <span>₹{walletAmountUsed.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              {paymentStatus === 'pending' ? (
                <>
                  <span>Due Amount:</span>
                  <span className="text-amber-600">₹{calculatedOriginalTotal.toFixed(2)}</span>
                </>
              ) : (
                <>
                  <span>Total Amount:</span>
                  <span>₹{calculatedOriginalTotal.toFixed(2)}</span>
                </>
              )}
            </div>
            <div className="flex justify-end mt-1">
              {paymentStatus === 'pending' && (
                <Badge variant="outline" className="bg-amber-50">Payment Pending</Badge>
              )}
              {paymentStatus === 'partially_refunded' && (
                <Badge variant="outline" className="bg-blue-50">Partially Refunded</Badge>
              )}
              {paymentStatus === 'fully_refunded' && (
                <Badge variant="outline" className="bg-green-50">Fully Refunded</Badge>
              )}
              {paymentStatus === 'to_be_refunded' && (
                <Badge variant="outline" className="bg-amber-50">To Be Refunded</Badge>
              )}
              {paymentStatus === 'paid' && activeItems.length > 0 && (
                <Badge variant="outline" className="bg-green-50">Paid</Badge>
              )}
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
            {totalRefunded > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Total Refunded:</span>
                <span>₹{totalRefunded.toFixed(2)}</span>
              </div>
            )}
            {totalPendingRefund > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Pending Refunds:</span>
                <span>₹{totalPendingRefund.toFixed(2)} (Est.)</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              {activeItems.length > 0 ? (
                <>
                  <span>Current Amount:</span>
                  <span className={paymentStatus === 'pending' ? "text-amber-600" : "text-green-600"}>
                    ₹{currentFinalTotal}
                  </span>
                </>
              ) : (
                <>
                  <span>Refund Amount:</span>
                  <span className="text-red-600">
                    ₹{(totalRefunded + totalPendingRefund).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {modifiedItems.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Modified Items</h4>
          {modifiedItems.map((item, index) => {
            // Calculate estimated refund for this item
            const itemOriginalPrice = parseFloat(item.final_price);
            const couponImpact = order.coupon && parseFloat(order.subtotal) !== 0
              ? (itemOriginalPrice * (parseFloat(order.coupon_discount) / parseFloat(order.subtotal))).toFixed(2)
              : 0;
            const estimatedRefund = (itemOriginalPrice - couponImpact).toFixed(2);
            
            return (
              <div key={index} className="flex items-center justify-between py-2 border-t">
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
                  {item.refund_amount ? (
                    <p className="text-sm font-medium text-red-600">
                      Refunded: ₹{item.refund_amount} 
                    </p>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">₹{item.final_price} (Original)</p>
                      {order.coupon && (
                        <p className="text-xs text-muted-foreground">
                          Est. Refund: ₹{estimatedRefund} after coupon adjustment
                        </p>
                      )}
                    </div>
                  )}
                  {/* <p className="text-xs text-muted-foreground">
                    {formatDate(item.cancelled_at || item.returned_at)}
                  </p> */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default OrderFinancialDetails;