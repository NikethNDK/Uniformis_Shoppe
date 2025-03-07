import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import Invoice from "../../admin/OrderManagement/Invoice";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { orderApi, productApi } from "../../../axiosconfig";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { extractErrorMessages } from "../ErrorHandler/ErrorHandler";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import ReviewForm from "./ReviewForm";
import ReviewDisplay from "./ReviewDisplay";
import { apiHelpers } from "../../../axiosconfig";

export default function TrackOrder() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCancelReason, setItemCancelReason] = useState("");
  const [itemCancelDialogOpen, setItemCancelDialogOpen] = useState(false);
  const [isRetryDialogOpen, setIsRetryDialogOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [viewReviewDialogOpen, setViewReviewDialogOpen] = useState(false);
  const [itemReturnDialogOpen, setItemReturnDialogOpen] = useState(false);
  const [itemReturnReason, setItemReturnReason] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await orderApi.get("/");
      console.log("Order page api call response: ", response.data);
      setOrders(response.data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReviewSubmit = async (orderId, itemId, rating, comment) => {
    console.log('Submitting review:', { orderId, itemId, rating, comment });
    try {
      await productApi.post(`/orders/${orderId}/items/${itemId}/review/`, {
        rating,
        comment,
      });
      toast.success("Review submitted successfully");

      // Update the local state to reflect the review submission
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.id === itemId ? { ...item, is_reviewed: true } : item
                ),
              }
            : order
        )
      );
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setReviewDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await orderApi.post(`${selectedOrderId}/cancel/`);

      if (response.data) {
        toast.success("Order cancelled successfully");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrderId
              ? { ...order, status: "cancelled" }
              : order
          )
        );
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Cancel order error:", error.response.data.error);
        const errorMessage = extractErrorMessages(
          error.response.data.error
        ).join(", ");
        toast.error(errorMessage);
      } else {
        console.error("Cancel order error:", error);
      }
    } finally {
      setCancelDialogOpen(false);
    }
  };

  const handleReturn = async () => {
    try {
      if (!returnReason) {
        toast.error("Return reason is required");
        return;
      }

      const response = await orderApi.post(`${selectedOrderId}/return_order/`, {
        return_reason: returnReason,
      });

      if (response.data) {
        toast.success("Return request submitted successfully");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrderId
              ? { ...order, status: "returned", is_returned: true }
              : order
          )
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to submit return request";
      toast.error(errorMessage);
      console.error("Return order error:", error);
    } finally {
      setReturnDialogOpen(false);
      setReturnReason("");
    }
  };

  const handleItemReturn = async () => {
    try {
      if (!itemReturnReason) {
        toast.error("Return reason is required");
        return;
      }

      const response = await orderApi.post(
        `${selectedOrder.id}/return-item/${selectedItem.id}/`,
        { 
          return_reason: itemReturnReason,
          item_id: selectedItem.id 
        }
      );

      if (response.data) {
        toast.success("Item return request submitted successfully");
        // Update orders state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrder.id 
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.id === selectedItem.id 
                      ? { ...item, status: 'returned', is_returned: true } 
                      : item
                  )
                }
              : order
          )
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to submit item return request";
      toast.error(errorMessage);
      console.error("Item return error:", error);
    } finally {
      setItemReturnDialogOpen(false);
      setItemReturnReason("");
      setSelectedItem(null);
    }
  };

  const handleRetryPayment = async () => {
    try {
      setPaymentProcessing(true);
      const response = await orderApi.post(
        `/${selectedOrderId}/retry-payment/`
      );

      const orderData = response.data.razorpay_order;

      const options = {
        key: "rzp_test_MIlvGi78yuccr2",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Uniformis Shoppe",
        description: "Payment retry for your order",
        order_id: orderData.id,
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9633134666",
        },
        handler: function (response) {
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed");
            setPaymentProcessing(false);
          },
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        toast.error(response.error.description || "Payment failed");
        setPaymentProcessing(false);
      });

      rzp.open();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to initiate payment retry"
      );
      console.error("Payment retry error:", error);
      setPaymentProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      const response = await orderApi.post(
        `/${selectedOrderId}/confirm-retry-payment/`,
        {
          payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature,
        }
      );

      toast.success("Payment successful!");
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to confirm payment");
      console.error("Payment confirmation error:", error);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "text-yellow-600";
      case "shipped":
        return "text-blue-600";
      case "delivered":
        return "text-green-600";
      case "cancelled":
      case "returned":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.items.some((item) =>
        item.product_name.toLowerCase().includes(searchLower)
      )
    );
  });

  const getEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + 3);
    return format(estimatedDate, "dd.MM.yyyy");
  };

  const handleItemCancel = async () => {
    try {
      if (!itemCancelReason) {
        toast.error("Cancellation reason is required");
        return;
      }

      const response = await orderApi.post(
        `${selectedOrder.id}/cancel-item/${selectedItem.id}/`,
        { reason: itemCancelReason }
      );

      if (response.data) {
        toast.success("Item cancelled successfully");
        // Update orders state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrder.id ? response.data : order
          )
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to cancel item";
      toast.error(errorMessage);
    } finally {
      setItemCancelDialogOpen(false);
      setItemCancelReason("");
      setSelectedItem(null);
    }
  };

  const handleCloseInvoice = () => {
    setInvoiceDialogOpen(false);
    setSelectedOrder(null);
    // Add a small delay to ensure clean up
    setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search your Orders using name, Order ID, Amount"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center">No orders found</p>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Order #{order.order_number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="mb-4">
                  <AccordionItem value="delivery-address">
                    <AccordionTrigger>Delivery Address</AccordionTrigger>
                    <AccordionContent>
                      {order.delivery_address && (
                        <div className="text-sm text-gray-600">
                          <p>{order.delivery_address.name}</p>
                          <p>{order.delivery_address.house_no}</p>
                          <p>
                            {order.delivery_address.city},{" "}
                            {order.delivery_address.state}
                          </p>
                          <p>PIN: {order.delivery_address.pin_code}</p>
                          <p>Phone: {order.delivery_address.mobile_number}</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border-b last:border-b-0"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.product_name}
                      className="h-24 w-24 rounded-md object-cover"
                    />
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{item.product_name}</h3>
                      <p className="text-sm text-gray-500">
                        Size: {item.size}, Color: {item.color}
                      </p>
                      <p className="font-medium">₹{item.final_price}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </p>
                      {order.status === 'delivered' && !item.is_returned && item.status !== 'returned' && item.status !== 'refunded' &&  (
  <Button className="ml-2 bg-yellow-500 hover:bg-yellow-700"
    variant="secondary"
    size="sm"
    onClick={() => {
      setSelectedOrder(order);
      setSelectedItem(item);
      setItemReturnDialogOpen(true);
    }}
  >
    Return Item
  </Button>
)}
                      {item.status === "active" &&
                        order.status !== "delivered" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSelectedOrder(order);
                              setSelectedItem(item);
                              setItemCancelDialogOpen(true);
                            }}
                          >
                            Cancel Item
                          </Button>
                        )}
                 
                      {order.status === "delivered" && (
                        <>
                          {!item.is_reviewed ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 ml-2"
                              onClick={() => {
                                setSelectedOrder(order);
                                setSelectedItem(item);
                                setReviewDialogOpen(true);
                              }}
                            >
                              Write Review
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setSelectedOrder(order);
                                setSelectedItem(item);
                                setViewReviewDialogOpen(true);
                              }}
                            >
                              View Review
                            </Button>
                          )}

                          
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p
                      className={`font-medium ${getStatusColor(order.status)}`}
                    >
                      Order Status: {order.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      Order Date:{" "}
                      {format(new Date(order.created_at), "dd.MM.yyyy")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Est. Delivery: {getEstimatedDelivery(order.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Total: ₹{order.final_total}</p>
                    <p className="text-sm text-gray-500">
                      Payment: {order.payment_method}
                    </p>
                    <p
                      className={`text-sm font-medium ${getPaymentStatusColor(
                        order.payment_status
                      )}`}
                    >
                      Payment Status: {order.payment_status}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.status !== "delivered" &&
                        order.status !== "cancelled" &&
                        order.status !== "returned" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setCancelDialogOpen(true);
                            }}
                          >
                            Cancel Order
                          </Button>
                        )}
                      {(order.payment_status === "failed" ||
                        order.payment_status === "pending") &&
                        order.payment_method === "card" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIsRetryDialogOpen(true);
                            }}
                            disabled={paymentProcessing}
                          >
                            {paymentProcessing
                              ? "Processing..."
                              : "Retry Payment"}
                          </Button>
                        )}
                      {order.status === "delivered" && !order.is_returned && (
                        <Button
                        className=" bg-yellow-500 hover:bg-yellow-700"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setReturnDialogOpen(true);
                          }}
                        >
                          Return Order
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setInvoiceDialogOpen(true);
                        }}
                      >
                        View Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your order?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for returning the order:
            </DialogDescription>
          </DialogHeader>
          <Input
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Enter return reason"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReturnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReturn}>Submit Return Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {invoiceDialogOpen && selectedOrder && (
        <Dialog open={invoiceDialogOpen} onOpenChange={handleCloseInvoice}>
          <Invoice order={selectedOrder} onClose={handleCloseInvoice} />
        </Dialog>
      )}

      <Dialog
        open={itemCancelDialogOpen}
        onOpenChange={setItemCancelDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Item</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this item:
            </DialogDescription>
          </DialogHeader>
          <Input
            value={itemCancelReason}
            onChange={(e) => setItemCancelReason(e.target.value)}
            placeholder="Enter cancellation reason"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setItemCancelDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleItemCancel}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retry Payment Dialog */}
      <AlertDialog open={isRetryDialogOpen} onOpenChange={setIsRetryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retry Payment</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to retry payment for this order. You will be
              redirected to the payment gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRetryPayment}
              disabled={paymentProcessing}
            >
              {paymentProcessing ? "Processing..." : "Continue to Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {reviewDialogOpen && selectedOrder && selectedItem && (
        <ReviewForm
          orderId={selectedOrder.id}
          itemId={selectedItem.id}
          onReviewSubmitted={handleReviewSubmit}
          onClose={() => {
            setReviewDialogOpen(false);
            setSelectedItem(null);
          }}
        />
      )}

{viewReviewDialogOpen && selectedOrder && selectedItem && (
  <ReviewDisplay
    orderId={selectedOrder.id}
    itemId={selectedItem.id}
    onReviewSubmitted={handleReviewSubmit}
    onClose={() => {
      setViewReviewDialogOpen(false);
      setSelectedItem(null);
    }}
  />
)}

<Dialog 
        open={itemReturnDialogOpen} 
        onOpenChange={setItemReturnDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Item</DialogTitle>
            <DialogDescription>
              Please provide a reason for returning this item:
            </DialogDescription>
          </DialogHeader>
          <Input
            value={itemReturnReason}
            onChange={(e) => setItemReturnReason(e.target.value)}
            placeholder="Enter return reason"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setItemReturnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleItemReturn}>
              Submit Return Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}