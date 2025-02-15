// "use client"

// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { useDispatch, useSelector } from "react-redux"
// import { toast } from "react-toastify"
// import axiosInstance from "../../../axiosconfig"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/components/ui/card"
// import { Input } from "@/components/components/ui/input"
// import { Button } from "@/components/components/ui/button"
// import { RadioGroup, RadioGroupItem } from "@/components/components/ui/radio-group"
// import { Label } from "@/components/components/ui/label"
// import { Separator } from "@/components/components/ui/separator"
// import { createOrder } from "../../../redux/order/orderSlice"
// import Razorpay from 'react-razorpay';

// const CheckoutPage = () => {
//   const navigate = useNavigate()
//   const dispatch = useDispatch()
//   const [selectedAddress, setSelectedAddress] = useState(null)
//   const [paymentMethod, setPaymentMethod] = useState("cod")
//   const [couponCode, setCouponCode] = useState("")
//   const [addresses, setAddresses] = useState([])
//   const [loading, setLoading] = useState(false)

//   const { items, totalAmount,finalTotal } = useSelector((state) => state.cart)
//   const deliveryCharges = 0 // You can calculate this based on your logic
//   // console.log('first',finalTotal)
//   const fetchAddresses = async () => {
//     try {
//       const response = await axiosInstance.get("/addresses/")
//       setAddresses(response.data)
//     } catch (error) {
//       toast.error("Failed to fetch addresses")
//     }
//   }
//   useEffect(() => {
  
//     fetchAddresses()
//   }, [])

//   const handleCouponApply = () => {
//     // Implement coupon logic here
//     toast.info("Coupon functionality coming soon!")
//   }

//   const handlePlaceOrder = async () => {
//   if (!selectedAddress) {
//     toast.error("Please select a delivery address");
//     return;
//   }

//   try {
//     setLoading(true);

//     if (paymentMethod === 'card') {
//       // Check if Razorpay is loaded
//       if (typeof window.Razorpay === 'undefined') {
//         toast.error("Payment gateway is not loaded. Please try again later.");
//         return;
//       }

//       console.log('Creating Razorpay order...');
//       const razorpayOrderRes = await axiosInstance.post('/orders/create_razorpay_order/');
//       console.log('Razorpay order response:', razorpayOrderRes.data);
      
//       const orderData = razorpayOrderRes.data;

//       // Move handlePaymentSuccess outside of options to avoid closure issues
//       const handlePaymentSuccess = async (paymentResponse) => {
//         try {
//           console.log('Handling payment success:', paymentResponse);
//           const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
//             address_id: selectedAddress,
//             payment_method: paymentMethod,
//             payment_id: paymentResponse.razorpay_payment_id,
//             razorpay_order_id: paymentResponse.razorpay_order_id,
//             signature: paymentResponse.razorpay_signature
//           });
          
//           console.log('Order creation response:', response.data);
//           toast.success("Order placed successfully!");
//           navigate("/user/trackorder");
//         } catch (error) {
//           console.error('Error creating order:', error);
//           toast.error(error.response?.data?.error || "Failed to create order");
//         } finally {
//           setLoading(false);
//         }
//       };

//       const options = {
//         key: 'rzp_test_MIlvGi78yuccr2', // Move key to environment variable
//         amount: orderData.amount*100,
//         currency: orderData.currency,
//         name: "Uniformis Shoppe",
//         description: "Payment for your order",
//         order_id: orderData.id,
//         prefill: {
//           name: "Customer Name",
//           email: "customer@example.com",
//           contact: "9633134666"
//         },
//         handler: handlePaymentSuccess,
//         modal: {
//           ondismiss: function() {
//             console.log('Payment modal closed');
//             setLoading(false);
//           }
//         },
//         theme: {
//           color: "#3399cc"
//         }
//       };

//       console.log('Initializing Razorpay with options:', options);
//       const rzp = new window.Razorpay(options);
      
//       // Add error handling for Razorpay
//       rzp.on('payment.failed', function(response) {
//         console.error('Payment failed:', response.error);
//         toast.error(response.error.description || "Payment failed");
//         setLoading(false);
//       });

//       console.log('Opening Razorpay modal...');
//       rzp.open();
//     } else {
//       // Handle COD payment
//       try {
//         const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
//           address_id: selectedAddress,
//           payment_method: paymentMethod,
//         });
        
//         console.log('COD order creation response:', response.data);
//         toast.success("Order placed successfully!");
//         navigate("/user/trackorder");
//       } catch (error) {
//         console.error('Error creating COD order:', error);
//         toast.error(error.response?.data?.error || "Failed to create order");
//       }
//     }
//   } catch (error) {
//     console.error('Order creation error:', error);
//     toast.error(error.response?.data?.error || "Failed to place order");
//   } finally {
//     setLoading(false);
//   }
// };

//   if (!items || items.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <Card>
//           <CardContent className="pt-6">
//             <p className="text-center">Your cart is empty</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">Checkout</h1>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2 space-y-6">
//           {/* Delivery Address Section */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Select Delivery Address</CardTitle>
//               <CardDescription>Choose where you want your items delivered</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-4">
//                 {addresses.map((address) => (
//                   <div key={address.id} className="flex items-center space-x-2">
//                     <RadioGroupItem value={address.id} id={`address-${address.id}`} />
//                     <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer p-4 border rounded-lg">
//                       <div className="font-medium">{address.name}</div>
//                       <div className="text-sm text-gray-500">
//                         {address.house_no}, {address.landmark}
//                         <br />
//                         {address.city}, {address.state} - {address.pin_code}
//                         <br />
//                         Phone: {address.mobile_number}
//                       </div>
//                     </Label>
//                   </div>
//                 ))}
//               </RadioGroup>
//               {/* <Button variant="outline" className="mt-4" onClick={() => navigate("/user/address/add")}>
//                 Add New Address
//               </Button> */}
//             </CardContent>
//           </Card>

//           {/* Payment Method Section */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Payment Method</CardTitle>
//               <CardDescription>Choose how you want to pay</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="card" id="payment-card" />
//                   <Label htmlFor="payment-card" className="flex items-center gap-2">
//                     Credit/Debit Card
//                     <span className="flex gap-1">
//                       <img src="/visa.svg" alt="Visa" className="h-6" />
//                       <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
//                     </span>
//                   </Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="upi" id="payment-upi" />
//                   <Label htmlFor="payment-upi">UPI</Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="cod" id="payment-cod" />
//                   <Label htmlFor="payment-cod">Cash on Delivery</Label>
//                 </div>
//               </RadioGroup>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Order Summary Section */}
//         <div className="md:col-span-1">
//           <Card>
//             <CardHeader>
//               <CardTitle>Order Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex justify-between">
//                   <span>Price ({items.length} items)</span>
//                   <span>₹{totalAmount}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>You Saved</span>
//                   <span className="text-green-600">{(totalAmount-finalTotal).toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Delivery Charges</span>
//                   <span className="text-green-600">{deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Input
//                     placeholder="Enter coupon code"
//                     value={couponCode}
//                     onChange={(e) => setCouponCode(e.target.value)}
//                   />
//                   <Button variant="outline" onClick={handleCouponApply}>
//                     Apply
//                   </Button>
//                 </div>
//                 <Separator />
//                 <div className="flex justify-between font-bold">
//                   <span>Total Amount</span>
//                   <span>₹{finalTotal + deliveryCharges}</span>
//                 </div>
//               </div>
//             </CardContent>
//             <CardFooter>
//               <Button className="w-full" onClick={handlePlaceOrder} disabled={loading || !selectedAddress}>
//                 {loading ? "Placing Order..." : "Place Order"}
//               </Button>
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CheckoutPage



import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import axiosInstance from "../../../axiosconfig"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/components/ui/card"
import { Input } from "@/components/components/ui/input"
import { Button } from "@/components/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/components/ui/radio-group"
import { Label } from "@/components/components/ui/label"
import { Separator } from "@/components/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/components/ui/dialog"
import { createOrder } from "../../../redux/order/orderSlice"
import Razorpay from 'react-razorpay';

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

  const { items, totalAmount,finalTotal } = useSelector((state) => state.cart)
  const deliveryCharges = 0 

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

  useEffect(() => {
    fetchAddresses()
    fetchAvailableCoupons()

  }, [])

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
      console.log("AppliedCoupon", response.data);
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

    if (paymentMethod === 'card') {
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        toast.error("Payment gateway is not loaded. Please try again later.");
        return;
      }

      console.log('Creating Razorpay order...');
      const razorpayOrderRes = await axiosInstance.post('/orders/create_razorpay_order/');
      console.log('Razorpay order response:', razorpayOrderRes.data);
      
      const orderData = razorpayOrderRes.data;

      // Move handlePaymentSuccess outside of options to avoid closure issues
      const handlePaymentSuccess = async (paymentResponse) => {
        try {
          console.log('Handling payment success:', paymentResponse);
          const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
            address_id: selectedAddress,
            payment_method: paymentMethod,
            payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            signature: paymentResponse.razorpay_signature
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

      const options = {
        key: 'rzp_test_MIlvGi78yuccr2', // Move key to environment variable
        amount: orderData.amount*100,
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
          ondismiss: function() {
            console.log('Payment modal closed');
            setLoading(false);
          }
        },
        theme: {
          color: "#3399cc"
        }
      };

      console.log('Initializing Razorpay with options:', options);
      const rzp = new window.Razorpay(options);
      
      // Add error handling for Razorpay
      rzp.on('payment.failed', function(response) {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || "Payment failed");
        setLoading(false);
      });

      console.log('Opening Razorpay modal...');
      rzp.open();
    } else {
      // Handle COD payment
      try {
        const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
          address_id: selectedAddress,
          payment_method: paymentMethod,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
        });
        
        console.log('COD order creation response:', response.data);
        toast.success("Order placed successfully!");
        navigate("/user/trackorder");
      } catch (error) {
        console.error('Error creating COD order:', error);
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
              {/* <Button variant="outline" className="mt-4" onClick={() => navigate("/user/address/add")}>
                Add New Address
              </Button> */}
            </CardContent>
          </Card>

          {/* Payment Method Section */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you want to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="payment-card" />
                  <Label htmlFor="payment-card" className="flex items-center gap-2">
                    Credit/Debit Card
                    <span className="flex gap-1">
                      {/* <img src="/visa.svg" alt="Visa" className="h-6" />
                      <img src="/mastercard.svg" alt="Mastercard" className="h-6" /> */}
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="payment-upi" />
                  <Label htmlFor="payment-upi">Wallet</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="payment-cod" />
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
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>You Saved</span>
                  <span className="text-green-600">₹{(totalAmount - finalTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600">{deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discount_amount}</span>
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
                  <span>₹{finalTotal + deliveryCharges - (appliedCoupon ? appliedCoupon.discount_amount : 0)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handlePlaceOrder} disabled={loading || !selectedAddress}>
                {loading ? "Placing Order..." : "Place Order"}
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
    </div>
  )
}

export default CheckoutPage