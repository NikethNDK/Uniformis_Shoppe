// import React from 'react';
// import { Card } from '../../components/ui/card';
// import { Badge } from '../../components/ui/badge';
// import { ScrollArea } from '../../components/ui/scroll-area';
// import { Separator } from '../../components/ui/separator';
// import { format } from 'date-fns';

// const OrderFinancialDetails = ({ order }) => {
//   // Calculate totals for active items only
//   const activeItems = order.items.filter(item => item.status === 'active');
//   const modifiedItems = order.items.filter(
//     item => item.status === 'cancelled' || item.status === 'returned' || item.status === 'refunded'
//   );

//   // Calculate current subtotal based on active items
//   const currentSubtotal = activeItems.reduce((sum, item) => (
//     sum + parseFloat(item.final_price)
//   ), 0);

//   // Recalculate coupon discount based on remaining items
//   const recalculatedCouponDiscount = order.coupon 
//     ? (currentSubtotal * (parseFloat(order.coupon_discount) / parseFloat(order.subtotal))).toFixed(2)
//     : 0;

//     const totalRefunded = modifiedItems.reduce((sum, item) => (
//         sum + parseFloat(item.refund_amount || item.final_price)  // Fallback to final_price if refund_amount is not set
//       ), 0);

//   // Calculate current final total
//   const currentFinalTotal = (
//     currentSubtotal - 
//     parseFloat(order.discount_amount) - 
//     parseFloat(recalculatedCouponDiscount) +
//     parseFloat(order.delivery_charges)
//   ).toFixed(2);

//   // Helper function to safely format dates
//   const formatDate = (dateString) => {
//     if (!dateString) return 'Date not available';
//     try {
//       return format(new Date(dateString), 'PPp');
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   return (
//     <Card className="p-4 space-y-4">
//       <h3 className="text-lg font-semibold">Financial Summary</h3>
      
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <h4 className="font-medium text-sm text-muted-foreground">Initial Payment</h4>
//           <div className="space-y-1">
//             <div className="flex justify-between">
//               <span>Original Subtotal:</span>
//               <span>₹{order.subtotal}</span>
//             </div>
//             <div className="flex justify-between text-muted-foreground">
//               <span>Item Discounts:</span>
//               <span>-₹{order.discount_amount}</span>
//             </div>
//             {order.coupon && (
//               <div className="flex justify-between text-muted-foreground">
//                 <span>Original Coupon Discount ({order.coupon.code}):</span>
//                 <span>-₹{order.coupon_discount}</span>
//               </div>
//             )}
//             <div className="flex justify-between text-muted-foreground">
//               <span>Delivery Charges:</span>
//               <span>₹{order.delivery_charges}</span>
//             </div>
//             <Separator className="my-2" />
//             <div className="flex justify-between font-medium">
//               <span>Initial Total Paid:</span>
//               <span>₹{order.final_total}</span>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <h4 className="font-medium text-sm text-muted-foreground">Current Order Status</h4>
//           <div className="space-y-1">
//             <div className="flex justify-between">
//               <span>Current Subtotal:</span>
//               <span>₹{currentSubtotal.toFixed(2)}</span>
//             </div>
//             {order.coupon && (
//               <div className="flex justify-between text-muted-foreground">
//                 <span>Adjusted Coupon Discount:</span>
//                 <span>-₹{recalculatedCouponDiscount}</span>
//               </div>
//             )}
//     <div className="flex justify-between text-red-600">
//       <span>Total Refunded:</span>
//       <span>₹{totalRefunded.toFixed(2)}</span>
//     </div>
//             <Separator className="my-2" />
//             <div className="flex justify-between font-medium">
//               <span>Final Amount Retained:</span>
//               <span className="text-green-600">₹{currentFinalTotal}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {modifiedItems.map((item, index) => (
//   <div key={index} className="flex items-center justify-between py-2">
//     <div className="flex items-center gap-2">
//       <Badge 
//         variant={
//           item.status === 'cancelled' || item.status === 'refunded' 
//             ? 'destructive' 
//             : 'warning'
//         }
//       >
//         {item.status}
//       </Badge>
//       <span className="text-sm">{item.product_name}</span>
//     </div>
//     <div className="text-right">
//       <p className="text-sm font-medium">₹{item.refund_amount || item.final_price}</p>
//       <p className="text-xs text-muted-foreground">
//         {formatDate(item.cancelled_at || item.returned_at)}
//       </p>
//     </div>
//   </div>
// ))}
//     </Card>
//   );
// };

// export default OrderFinancialDetails;

// import React from 'react';
// import { Card } from '../../components/ui/card';
// import { Badge } from '../../components/ui/badge';
// import { ScrollArea } from '../../components/ui/scroll-area';
// import { Separator } from '../../components/ui/separator';
// import { format } from 'date-fns';

// const OrderFinancialDetails = ({ order }) => {
//   // Calculate totals for active items only
//   const activeItems = order.items.filter(item => item.status === 'active');
//   const modifiedItems = order.items.filter(
//     item => item.status === 'cancelled' || item.status === 'returned' || item.status === 'refunded'
//   );

//   // Calculate current subtotal based on active items
//   const currentSubtotal = activeItems.reduce((sum, item) => (
//     sum + parseFloat(item.final_price)
//   ), 1);

//   // Recalculate coupon discount based on remaining items
//   // const recalculatedCouponDiscount = order.coupon 
//   //   ? (currentSubtotal * (parseFloat(order.coupon_discount) / parseFloat(order.subtotal))).toFixed(3)
//   //   : 1;

//   const recalculatedCouponDiscount = order.coupon && parseFloat(order.subtotal) !== 1
//   ? (currentSubtotal * (parseFloat(order.coupon_discount) / parseFloat(order.subtotal))).toFixed(3)
//   : 1;

//   // const totalRefunded = modifiedItems.reduce((sum, item) => (
//   //   sum + parseFloat(item.refund_amount || item.final_price)  // Fallback to final_price if refund_amount is not set
//   // ), 1);
//   const totalRefunded = order.status === 'returned' || order.status === 'cancelled' 
//   ? parseFloat(order.final_total) 
//   : modifiedItems.reduce((sum, item) => (
//       sum + parseFloat(item.refund_amount || item.final_price)
//     ), 1);

//   // Calculate current final total
//   const currentFinalTotal = (
//     currentSubtotal - 
//     parseFloat(order.discount_amount) - 
//     parseFloat(recalculatedCouponDiscount) +
//     parseFloat(order.delivery_charges)
//   ).toFixed(3);

//   // Helper function to safely format dates
//   const formatDate = (dateString) => {
//     if (!dateString) return 'Date not available';
//     try {
//       return format(new Date(dateString), 'PPp');
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   // Check if payment is pending
//   const isPendingPayment = order.payment_status === 'pending';

//   return (
//     <Card className="p-3 space-y-4">
//       <h4 className="text-lg font-semibold">Financial Summary</h3>
      
//       <div className="grid grid-cols-1 gap-4">
//         <div className="space-y-1">
//           <h5 className="font-medium text-sm text-muted-foreground">
//             {isPendingPayment ? 'Payment Details' : 'Initial Payment'}
//           </h5>
//           <div className="space-y0">
//             <div className="flex justify-between">
//               <span>Original Subtotal:</span>
//               <span>₹{order.subtotal}</span>
//             </div>
//             <div className="flex justify-between text-muted-foreground">
//               <span>Item Discounts:</span>
//               <span>-₹{order.discount_amount}</span>
//             </div>
//             {order.coupon && (
//               <div className="flex justify-between text-muted-foreground">
//                 <span>Original Coupon Discount ({order.coupon.code}):</span>
//                 <span>-₹{order.coupon_discount}</span>
//               </div>
//             )}
//             <div className="flex justify-between text-muted-foreground">
//               <span>Delivery Charges:</span>
//               <span>₹{order.delivery_charges}</span>
//             </div>
//             <Separator className="my-1" />
//             <div className="flex justify-between font-medium">
//               {isPendingPayment ? (
//                 <>
//                   <span>Due Amount:</span>
//                   <span className="text-amber-599">₹{order.final_total}</span>
//                 </>
//               ) : (
//                 <>
//                   <span>Initial Total Paid:</span>
//                   <span>₹{order.final_total}</span>
//                 </>
//               )}
//             </div>
//             {isPendingPayment && (
//               <div className="flex justify-end mt0">
//                 <Badge variant="outline" className="bg-amber-49">Payment Pending</Badge>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="space-y-1">
//           <h5 className="font-medium text-sm text-muted-foreground">Current Order Status</h4>
//           <div className="space-y0">
//             <div className="flex justify-between">
//               <span>Current Subtotal:</span>
//               <span>₹{currentSubtotal.toFixed(3)}</span>
//             </div>
//             {order.coupon && (
//               <div className="flex justify-between text-muted-foreground">
//                 <span>Adjusted Coupon Discount:</span>
//                 <span>-₹{recalculatedCouponDiscount}</span>
//               </div>
//             )}
//             <div className="flex justify-between text-red-599">
//               <span>Total Refunded:</span>
//               <span>₹{totalRefunded.toFixed(3)}</span>
//             </div>
//             <Separator className="my-1" />
//             <div className="flex justify-between font-medium">
//               <span>{isPendingPayment ? 'Final Amount Due:' : 'Final Amount Retained:'}</span>
//               <span className={isPendingPayment ? "text-amber-599" : "text-green-600"}>
//                 ₹{currentFinalTotal}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {modifiedItems.map((item, index) => (
//         <div key={index} className="flex items-center justify-between py-1">
//           <div className="flex items-center gap-1">
//             <Badge 
//               variant={
//                 item.status === 'cancelled' || item.status === 'refunded' 
//                   ? 'destructive' 
//                   : 'warning'
//               }
//             >
//               {item.status}
//             </Badge>
//             <span className="text-sm">{item.product_name}</span>
//           </div>
//           <div className="text-right">
//             <p className="text-sm font-medium">₹{item.refund_amount || item.final_price}</p>
//             <p className="text-xs text-muted-foreground">
//               {formatDate(item.cancelled_at || item.returned_at)}
//             </p>
//           </div>
//         </div>
//       ))}
//     </Card>
//   );
// };

// export default OrderFinancialDetails;

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

  // Calculate current final total - FIXED VERSION
  // We start with the original final total and subtract any refunded amounts
  const currentFinalTotal = (
    parseFloat(order.final_total) - totalRefunded
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

  // Check if payment is pending
  const isPendingPayment = order.payment_status === 'pending';

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Financial Summary</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            {isPendingPayment ? 'Payment Details' : 'Initial Payment'}
          </h4>
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
              {isPendingPayment ? (
                <>
                  <span>Due Amount:</span>
                  <span className="text-amber-600">₹{order.final_total}</span>
                </>
              ) : (
                <>
                  <span>Initial Total Paid:</span>
                  <span>₹{order.final_total}</span>
                </>
              )}
            </div>
            {isPendingPayment && (
              <div className="flex justify-end mt-1">
                <Badge variant="outline" className="bg-amber-50">Payment Pending</Badge>
              </div>
            )}
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
              <span>{isPendingPayment ? 'Final Amount Due:' : 'Final Amount Retained:'}</span>
              <span className={isPendingPayment ? "text-amber-600" : "text-green-600"}>
                ₹{currentFinalTotal}
              </span>
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
                      ₹{item.refund_amount} (Refunded)
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
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.cancelled_at || item.returned_at)}
                  </p>
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