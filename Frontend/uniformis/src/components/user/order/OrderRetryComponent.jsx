import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderApi } from '../../../axiosconfig';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRetryDialogOpen, setIsRetryDialogOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderApi.get(`/${orderId}/`);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to fetch order details');
      console.error('Order fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    try {
      setPaymentProcessing(true);
      const response = await orderApi.post(`/${orderId}/retry-payment/`);
      
      const orderData = response.data.razorpay_order;
      
      const options = {
        key: 'rzp_test_MIlvGi78yuccr2',
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Uniformis Shoppe",
        description: "Payment retry for your order",
        order_id: orderData.id,
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9633134666"
        },
        handler: function (response) {
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
            setPaymentProcessing(false);
          }
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || "Payment failed");
        setPaymentProcessing(false);
      });

      rzp.open();
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate payment retry');
      console.error('Payment retry error:', error);
      setPaymentProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      const response = await orderApi.post(`/${orderId}/confirm-retry-payment/`, {
        payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
      });
      
      toast.success("Payment successful!");
      fetchOrderDetails(); // Refresh order details
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to confirm payment");
      console.error('Payment confirmation error:', error);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading order details...</div>;
  }

  if (!order) {
    return <div className="container mx-auto py-8">Order not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.order_number}</CardTitle>
          <CardDescription>
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Order Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-sm text-gray-500">Order Status</h3>
                <p className="text-lg font-bold">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-sm text-gray-500">Payment Method</h3>
                <p className="text-lg font-bold">
                  {order.payment_method === 'card' 
                    ? 'Credit/Debit Card' 
                    : order.payment_method === 'cod' 
                      ? 'Cash on Delivery' 
                      : 'Wallet'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-sm text-gray-500">Payment Status</h3>
                <p className={`text-lg font-bold ${
                  order.payment_status === 'completed' 
                    ? 'text-green-600' 
                    : order.payment_status === 'failed' 
                      ? 'text-red-600' 
                      : 'text-yellow-600'
                }`}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </p>
                
                {/* Retry Payment Button */}
                {(order.payment_status === 'failed' || order.payment_status === 'pending') && 
                 order.payment_method === 'card' && (
                  <Button 
                    className="mt-2 w-full" 
                    onClick={() => setIsRetryDialogOpen(true)}
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? 'Processing...' : 'Retry Payment'}
                  </Button>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-2">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        Size: {item.size}, Color: {item.color}, Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.final_price}</p>
                      {item.discount_amount > 0 && (
                        <p className="text-sm text-green-600">
                          You saved: ₹{item.discount_amount}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Details */}
            <div>
              <h3 className="font-semibold mb-2">Price Details</h3>
              <div className="space-y-2 p-3 border rounded-lg">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Product Discount</span>
                    <span>-₹{order.discount_amount}</span>
                  </div>
                )}
                {order.coupon_discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{order.coupon_discount}</span>
                  </div>
                )}
                {order.wallet_amount_used > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Wallet Amount Used</span>
                    <span>-₹{order.wallet_amount_used}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total Amount</span>
                  <span>₹{order.final_total}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">{order.shipping_address?.name}</p>
                <p className="text-sm">
                  {order.shipping_address?.house_no}, {order.shipping_address?.landmark}
                  <br />
                  {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pin_code}
                  <br />
                  Phone: {order.shipping_address?.mobile_number}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retry Payment Dialog */}
      <AlertDialog open={isRetryDialogOpen} onOpenChange={setIsRetryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retry Payment</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to retry payment for this order. You will be redirected to the payment gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRetryPayment}>
              Continue to Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderDetailPage;