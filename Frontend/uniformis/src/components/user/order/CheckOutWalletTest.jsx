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
import { Checkbox } from "@/components/components/ui/checkbox"
import { createOrder } from "../../../redux/order/orderSlice"
import Razorpay from 'react-razorpay';

const CheckoutPage = () => {
  // ... existing state variables ...
  const [walletBalance, setWalletBalance] = useState(0)
  const [useWallet, setUseWallet] = useState(false)
  const [walletAmountToUse, setWalletAmountToUse] = useState(0)

  // Calculate the final amount after all deductions
  const calculateFinalAmount = () => {
    const baseAmount = finalTotal + deliveryCharges
    const couponDiscount = appliedCoupon ? appliedCoupon.discount_amount : 0
    const walletDeduction = useWallet ? Math.min(walletBalance, baseAmount - couponDiscount) : 0
    return baseAmount - couponDiscount - walletDeduction
  }

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await axiosInstance.get("/wallet/")
      setWalletBalance(response.data.balance)
    } catch (error) {
      toast.error("Failed to fetch wallet balance")
    }
  }

  useEffect(() => {
    fetchAddresses()
    fetchAvailableCoupons()
    fetchWalletBalance()
  }, [])

  // Update wallet amount to use when checkbox is toggled
  useEffect(() => {
    if (useWallet) {
      const totalAfterCoupon = finalTotal + deliveryCharges - (appliedCoupon?.discount_amount || 0)
      setWalletAmountToUse(Math.min(walletBalance, totalAfterCoupon))
    } else {
      setWalletAmountToUse(0)
    }
  }, [useWallet, walletBalance, finalTotal, deliveryCharges, appliedCoupon])

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address")
      return
    }

    try {
      setLoading(true)
      const remainingAmount = calculateFinalAmount()

      if (paymentMethod === 'cod') {
        // Handle COD payment
        const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
          address_id: selectedAddress,
          payment_method: paymentMethod,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
        })
        toast.success("Order placed successfully!")
        navigate("/user/trackorder")
      } else if (useWallet && walletAmountToUse >= remainingAmount) {
        // Full payment from wallet
        const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
          address_id: selectedAddress,
          payment_method: 'wallet',
          wallet_amount: walletAmountToUse,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
        })
        toast.success("Order placed successfully using wallet!")
        navigate("/user/trackorder")
      } else {
        // Partial wallet payment + Razorpay
        const razorpayOrderRes = await axiosInstance.post('/orders/create_razorpay_order/', {
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          wallet_amount: walletAmountToUse,
        })
        
        const orderData = razorpayOrderRes.data.razorpay_order
        
        const handlePaymentSuccess = async (paymentResponse) => {
          try {
            const response = await axiosInstance.post('/orders/orders/create_from_cart/', {
              address_id: selectedAddress,
              payment_method: 'card_wallet',
              payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              signature: paymentResponse.razorpay_signature,
              wallet_amount: walletAmountToUse,
              coupon_code: appliedCoupon ? appliedCoupon.code : null
            })
            toast.success("Order placed successfully!")
            navigate("/user/trackorder")
          } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create order")
          }
        }

        const options = {
          key: 'rzp_test_MIlvGi78yuccr2',
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Uniformis Shoppe",
          description: "Payment for your order",
          order_id: orderData.id,
          handler: handlePaymentSuccess,
          modal: {
            ondismiss: function() {
              setLoading(false)
            }
          },
          theme: {
            color: "#3399cc"
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  // Add this section in the Payment Method card content
  const renderWalletOption = () => {
    if (paymentMethod === 'cod' || walletBalance <= 0) return null

    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="use-wallet"
            checked={useWallet}
            onCheckedChange={setUseWallet}
          />
          <Label htmlFor="use-wallet">
            Use Wallet Balance (Available: ₹{walletBalance})
          </Label>
        </div>
        {useWallet && (
          <div className="text-sm text-gray-600">
            Amount to be deducted from wallet: ₹{walletAmountToUse}
          </div>
        )}
      </div>
    )
  }

  // Update the Order Summary section to show wallet deduction
  const renderOrderSummary = () => (
    <div className="space-y-4">
      {/* ... existing summary items ... */}
      {useWallet && walletAmountToUse > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Wallet Amount</span>
          <span>-₹{walletAmountToUse}</span>
        </div>
      )}
      <Separator />
      <div className="flex justify-between font-bold">
        <span>Total Amount</span>
        <span>₹{calculateFinalAmount()}</span>
      </div>
    </div>
  )

  // Update the existing CardContent in the Payment Method section
  return (
    // ... existing JSX ...
    <CardContent>
      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
        {/* ... existing payment options ... */}
      </RadioGroup>
      {renderWalletOption()}
    </CardContent>
    // ... rest of the JSX ...
  )
}

export default CheckoutPage