import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import axiosInstance,{orderApi, walletApi} from "../../../axiosconfig"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/components/ui/card"
import { Input } from "@/components/components/ui/input"
import { Button } from "@/components/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/components/ui/radio-group"
import { Label } from "@/components/components/ui/label"
import { Separator } from "@/components/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/components/ui/dialog"
import { Checkbox } from "@/components/components/ui/checkbox"
import { createOrder } from "../../../redux/order/orderSlice"
import Razorpay from 'react-razorpay';
import AddressFormDialog from "./AddressFormDialog"


const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [couponCode, setCouponCode] = useState("")
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCoupons, setShowCoupons] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [useWallet, setUseWallet] = useState(false)
  const [walletAmountToUse, setWalletAmountToUse] = useState(0)
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    couponDiscount: 0,
    walletAmount: 0,
    finalTotal: 0
  })

  const { items, totalAmount, finalTotal } = useSelector((state) => state.cart)
  const deliveryCharges = 0 
  const [showAddressForm, setShowAddressForm] = useState(false)

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get("/addresses/")
      setAddresses(response.data)
    } catch (error) {
      toast.error("Failed to fetch addresses")
    }
  }

  const fetchAvailableCoupons = async () => {
    try {
      const response = await axiosInstance.get("/offers/available_coupons/")
      setAvailableCoupons(response.data)
    } catch (error) {
      toast.error("Failed to fetch available coupons")
    }
  }

  const fetchWalletBalance = async () => {
    try {
      const response = await walletApi.get("/")
      console.log("checkout wallet api call",response.data)
      
      setWalletBalance(response.data[0].balance)
      console.log('wallet balce after setting: ',walletBalance)
    } catch (error) {
      toast.error("Failed to fetch wallet balance")
      console.error("Wallet fetch error:", error)
    }
  }

  useEffect(() => {
    fetchAddresses()
    fetchAvailableCoupons()
    fetchWalletBalance()
  }, [])

  // Calculate order totals whenever relevant values change
  useEffect(() => {
    updateOrderSummary()
  }, [finalTotal, appliedCoupon, useWallet, walletBalance, paymentMethod])

  // Disable wallet usage when COD is selected
  useEffect(() => {
    if (paymentMethod === 'cod' && useWallet) {
      setUseWallet(false)
    }
  }, [paymentMethod])

  const updateOrderSummary = () => {
    const discountAmount = totalAmount - finalTotal
    const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0
    let currentFinalTotal = finalTotal - couponDiscountAmount
    
    // Calculate how much wallet amount can be used (only if payment method is not COD)
    let walletAmount = 0
    if (useWallet && walletBalance > 0 && paymentMethod !== 'cod') {
      walletAmount = Math.min(walletBalance, currentFinalTotal)
      currentFinalTotal -= walletAmount
    }

    setWalletAmountToUse(walletAmount)
    setOrderSummary({
      subtotal: totalAmount,
      discount: discountAmount,
      couponDiscount: couponDiscountAmount,
      walletAmount: walletAmount,
      finalTotal: currentFinalTotal
    })
  }

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
  
    try {
      // Get the current cart total for validation
      const response = await axiosInstance.post('/offers/apply_coupons/', {
        code: couponCode,
        total_amount: finalTotal // Send the cart total for minimum purchase validation
      });
      
      setAppliedCoupon(response.data);
      toast.success("Coupon applied successfully!");
    } catch (error) {
      console.error("Coupon application error:", error.response);
      if (error.response?.status === 400 && error.response?.data?.error) {
        toast.error(error.response.data.error); 
      } else {
        toast.error("Failed to apply coupon. Please try again.");
      }
    }
  };
  
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    try {
      setLoading(true);
      
      // Only proceed with card payment if there's an amount to pay after wallet
      if (paymentMethod === 'card' && orderSummary.finalTotal > 0) {
        // Create Razorpay order with coupon and wallet if applied
        const razorpayOrderRes = await axiosInstance.post('/orders/create_razorpay_order/', {
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          wallet_amount: useWallet ? walletAmountToUse : 0
        });
        
        // Correctly access the Razorpay order data
        const orderData = razorpayOrderRes.data.razorpay_order;
        
        const handlePaymentSuccess = async (paymentResponse) => {
          try {
            console.log('Handling payment success:', paymentResponse);
            const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
              address_id: selectedAddress,
              payment_method: paymentMethod,
              payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              signature: paymentResponse.razorpay_signature,
              coupon_code: appliedCoupon ? appliedCoupon.code : null,
              wallet_amount: useWallet ? walletAmountToUse : 0
            });
            
            console.log('Order creation response:', response.data);
            toast.success("Order placed successfully!");
            navigate("/user/trackorder");
          } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.error || "Failed to create order");
          } finally {
            setLoading(false);
          }
        };
        
        // Add handler for modal closure
        const handleModalClose = async () => {
          console.log('Payment modal closed');
          try {
            // Create order with failed payment status
            const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
              address_id: selectedAddress,
              payment_method: paymentMethod,
              payment_status: 'failed',  // Explicitly set payment status as failed
              coupon_code: appliedCoupon ? appliedCoupon.code : null,
              wallet_amount: useWallet ? walletAmountToUse : 0
            });
            
            console.log('Failed payment order created:', response.data);
            toast.warning("Payment was not completed. Order saved with failed payment status.");
            navigate("/user/trackorder");
          } catch (error) {
            console.error('Error creating failed payment order:', error);
            toast.error(error.response?.data?.error || "Failed to create order");
          } finally {
            setLoading(false);
          }
        };
 
        const options = {
          key:import.meta.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: orderData.amount,  
          currency: orderData.currency,
          name: "Uniformis Shoppe",
          description: "Payment for your order",
          order_id: orderData.id,
          prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9633134666"
          },
          handler: handlePaymentSuccess,
          modal: {
            ondismiss: handleModalClose  // Handle modal closure
          },
          theme: {
            color: "#3399cc"
          }
        };

        console.log('Initializing Razorpay with options:', options);
        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function(response) {
          console.error('Payment failed:', response.error);
          toast.error(response.error.description || "Payment failed");
          
          // Create order with failed payment status
          handleModalClose();
        });

        console.log('Opening Razorpay modal...');
        rzp.open();
      } else {
        // Handle wallet-only payment or COD
        try {
          const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
            address_id: selectedAddress,
            payment_method: orderSummary.finalTotal === 0 && useWallet ? 'wallet' : paymentMethod,
            coupon_code: appliedCoupon ? appliedCoupon.code : null,
            wallet_amount: useWallet ? walletAmountToUse : 0
          });
          
          console.log('Order creation response:', response.data);
          toast.success("Order placed successfully!");
          setAppliedCoupon(null);
          navigate("/user/trackorder");
        } catch (error) {
          console.error('Error creating order:', error);
          setAppliedCoupon(null);
          toast.error(error.response?.data?.error || "Failed to create order");
        }
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.error || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // Auto-select appropriate payment method when full wallet payment is available
  useEffect(() => {
    if (useWallet && walletAmountToUse >= finalTotal - (appliedCoupon ? appliedCoupon.discount_amount : 0)) {
      // If wallet covers the entire amount, auto-select wallet method
      setPaymentMethod('wallet');
    } else if (paymentMethod === 'wallet' && orderSummary.finalTotal > 0) {
      // If wallet was selected but doesn't cover everything, revert to card
      setPaymentMethod('card');
    }
  }, [useWallet, walletAmountToUse, finalTotal, appliedCoupon]);


const handleAddressAdded = (newAddress) => {
  // Fetch the updated list of addresses
  fetchAddresses()
  // Select the newly created address
  setSelectedAddress(newAddress.id)
}


  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Your cart is empty</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Delivery Address Section */}
          <Card>
            <CardHeader>
              <CardTitle>Select Delivery Address</CardTitle>
              <CardDescription>Choose where you want your items delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                    <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer p-4 border rounded-lg">
                      <div className="font-medium">{address.name}</div>
                      <div className="text-sm text-gray-500">
                        {address.house_no}, {address.landmark}
                        <br />
                        {address.city}, {address.state} - {address.pin_code}
                        <br />
                        Phone: {address.mobile_number}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button variant="outline" className="mt-4" onClick={() => setShowAddressForm(true)}>
  Add New Address
</Button>
            </CardContent>
          </Card>

          {/* Wallet Section */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet</CardTitle>
              <CardDescription>
                {paymentMethod === 'cod' 
                  ? "Wallet payment is not available with Cash on Delivery" 
                  : "Apply wallet balance to your order"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Available Balance</h3>
                    <p className="text-lg font-bold">₹{walletBalance}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="use-wallet" 
                      checked={useWallet}
                      disabled={walletBalance <= 0 || paymentMethod === 'cod'}
                      onCheckedChange={setUseWallet}
                    />
                    <Label htmlFor="use-wallet" className={paymentMethod === 'cod' ? "text-gray-400" : ""}>
                      Use wallet balance
                      {useWallet && walletAmountToUse > 0 && ` (₹${walletAmountToUse.toFixed(2)})`}
                    </Label>
                  </div>
                </div>
                
                {paymentMethod === 'cod' && (
                  <p className="text-amber-600 text-sm">Wallet payment cannot be combined with Cash on Delivery</p>
                )}
                
                {useWallet && walletAmountToUse > 0 && (
                  <div className="text-sm">
                    {walletAmountToUse >= orderSummary.finalTotal + orderSummary.couponDiscount ? (
                      <p className="text-green-600">Your entire order will be paid using wallet balance.</p>
                    ) : (
                      <p>₹{walletAmountToUse.toFixed(2)} will be used from your wallet. Remaining amount of ₹{orderSummary.finalTotal.toFixed(2)} will be paid via card payment.</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Section */}
          <Card className={useWallet && orderSummary.finalTotal === 0 ? "opacity-50" : ""}>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                {useWallet && orderSummary.finalTotal === 0 
                  ? "Your order will be fully paid with wallet balance" 
                  : "Choose how you want to pay"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value) => {
                  setPaymentMethod(value);
                  // If switching to COD, disable wallet
                  if (value === 'cod') {
                    setUseWallet(false);
                  }
                }}
                className="space-y-4"
                disabled={useWallet && orderSummary.finalTotal === 0}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="card" 
                    id="payment-card" 
                    disabled={useWallet && orderSummary.finalTotal === 0}
                  />
                  <Label htmlFor="payment-card" className="flex items-center gap-2">
                    Credit/Debit Card
                    <span className="flex gap-1">
                      {/* Card icons */}
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="cod" 
                    id="payment-cod" 
                    disabled={useWallet && orderSummary.finalTotal === 0}
                  />
                  <Label htmlFor="payment-cod">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Section */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Price ({items.length} items)</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>You Saved</span>
                  <span className="text-green-600">₹{orderSummary.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">{deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {useWallet && walletAmountToUse > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Wallet Balance Applied</span>
                    <span>-₹{walletAmountToUse.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleCouponApply}>
                    Apply
                  </Button>
                </div>
                <Button variant="link" onClick={() => setShowCoupons(true)}>
                  Show Available Coupons
                </Button>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>₹{orderSummary.finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handlePlaceOrder} disabled={loading || !selectedAddress}>
                {loading ? "Placing Order..." : `Place Order${orderSummary.finalTotal === 0 && useWallet ? " using Wallet" : ""}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Available Coupons Modal */}
      <Dialog open={showCoupons} onOpenChange={setShowCoupons}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Available Coupons</DialogTitle>
            <DialogDescription>Select a coupon to apply to your order</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableCoupons.map((coupon) => (
              <div key={coupon.id} className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{coupon.code}</h3>
                  <p className="text-sm text-gray-500">{coupon.description}</p>
                </div>
                <Button
                  onClick={() => {
                    setCouponCode(coupon.code)
                    setShowCoupons(false)
                    setTimeout(() => {
                      handleCouponApply();
                    }, 0);
                  }}
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AddressFormDialog 
  open={showAddressForm} 
  onOpenChange={setShowAddressForm} 
  onAddressAdded={handleAddressAdded}
  axiosInstance={axiosInstance}
/>
    </div>
  )
}

export default CheckoutPage