import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search } from 'lucide-react';
import { toast } from "react-toastify";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle  } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { orderApi } from "../../../axiosconfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"

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

  const fetchOrders = async () => {
    try {
      const response = await orderApi.get("/");
      console.log("Order page api call response: ",response.data)
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

  const handleCancel = async () => {
    try {
      const response = await orderApi.post(`${selectedOrderId}/cancel/`);
      
      if (response.data) {
        toast.success("Order cancelled successfully");
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrderId 
              ? { ...order, status: 'cancelled' }
              : order
          )
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to cancel order";
      toast.error(errorMessage);
      console.error("Cancel order error:", error);
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

      const response = await orderApi.post(`${selectedOrderId}/return_order/`, { return_reason: returnReason });
      
      if (response.data) {
        toast.success("Return request submitted successfully");
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrderId 
              ? { ...order, status: 'returned', is_returned: true }
              : order
          )
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to submit return request";
      toast.error(errorMessage);
      console.error("Return order error:", error);
    } finally {
      setReturnDialogOpen(false);
      setReturnReason("");
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

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.items.some((item) => item.product_name.toLowerCase().includes(searchLower))
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
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrder.id 
              ? response.data 
              : order
          )
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to cancel item";
      toast.error(errorMessage);
    } finally {
      setItemCancelDialogOpen(false);
      setItemCancelReason("");
      setSelectedItem(null);
    }
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
                <CardTitle className="text-lg font-semibold">Order #{order.order_number}</CardTitle>
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
                            {order.delivery_address.city}, {order.delivery_address.state}
                          </p>
                          <p>PIN: {order.delivery_address.pin_code}</p>
                          <p>Phone: {order.delivery_address.mobile_number}</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border-b last:border-b-0">
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
                      <p className={`font-medium ${getStatusColor(item.status)}`}>{item.status}</p>
                      {item.status === "active" && order.status !== "delivered" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSelectedOrder(order)
                            setSelectedItem(item)
                            setItemCancelDialogOpen(true)
                          }}
                        >
                          Cancel Item
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className={`font-medium ${getStatusColor(order.status)}`}>Order Status: {order.status}</p>
                    <p className="text-sm text-gray-500">
                      Order Date: {format(new Date(order.created_at), "dd.MM.yyyy")}
                    </p>
                    <p className="text-sm text-gray-500">Est. Delivery: {getEstimatedDelivery(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total: ₹{order.final_total}</p>
                    <p className="text-sm text-gray-500">Payment: {order.payment_method}</p>
                    <p className="text-sm text-gray-500">Payment Status: {order.payment_status}</p>
                    {order.status !== "delivered" && order.status !== "cancelled" && order.status !== "returned" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSelectedOrderId(order.id)
                          setCancelDialogOpen(true)
                        }}
                      >
                        Cancel Order
                      </Button>
                    )}
                    {order.status === "delivered" && !order.is_returned && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSelectedOrderId(order.id)
                          setReturnDialogOpen(true)
                        }}
                      >
                        Return Order
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 ml-2"
                      onClick={() => {
                        setSelectedOrder(order)
                        setInvoiceDialogOpen(true)
                      }}
                    >
                      View Invoice
                    </Button>
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
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleCancel}>Confirm</Button>
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
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReturn}>Submit Return Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


<Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4">
              <div className="text-center mb-6">
                <Package2 className="h-12 w-12 mx-auto mb-2" />
                <h2 className="text-2xl font-bold">Uniformis Shoppe</h2>
                <p className="text-sm text-gray-600">123 Fashion Street, Style City, SC 54321</p>
              </div>
              <div className="flex justify-between mb-6">
                <div>
                  <h3 className="font-semibold">Bill To:</h3>
                  <p>{selectedOrder.delivery_address.name}</p>
                  <p>{selectedOrder.delivery_address.house_no}</p>
                  <p>
                    {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}
                  </p>
                  <p>{selectedOrder.delivery_address.pin_code}</p>
                </div>
                <div className="text-right">
                  <p>
                    <strong>Invoice Date:</strong> {format(new Date(selectedOrder.created_at), "dd.MM.yyyy")}
                  </p>
                  <p>
                    <strong>Order Number:</strong> {selectedOrder.order_number}
                  </p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl No.</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.items.map((item, index) => (
                    <TableRow key={item.id} className={item.status === "cancelled" ? "line-through text-gray-500" : ""}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.price.toFixed(2)}</TableCell>
                      <TableCell>₹{item.discount_amount.toFixed(2)}</TableCell>
                      <TableCell>₹{item.final_price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 text-right">
                <p>
                  <strong>Subtotal:</strong> ₹{selectedOrder.subtotal.toFixed(2)}
                </p>
                <p>
                  <strong>Discount:</strong> ₹{selectedOrder.discount_amount.toFixed(2)}
                </p>
                {selectedOrder.coupon_discount > 0 && (
                  <p>
                    <strong>Coupon Discount:</strong> ₹{selectedOrder.coupon_discount.toFixed(2)}
                  </p>
                )}
                <p className="text-xl font-bold mt-2">
                  <strong>Total:</strong> ₹{selectedOrder.final_total.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setInvoiceDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={itemCancelDialogOpen} onOpenChange={setItemCancelDialogOpen}>
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
            <Button variant="outline" onClick={() => setItemCancelDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleItemCancel}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
