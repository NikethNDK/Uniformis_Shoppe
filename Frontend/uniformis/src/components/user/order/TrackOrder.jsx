

// import { useEffect, useState } from "react"
// import { format } from "date-fns"
// import { Search } from "lucide-react"
// import { toast } from "react-toastify"

// import { Input } from "../../components/ui/input"
// import { Button } from "../../components/ui/button"
// import { Card, CardContent } from "../../components/ui/card"
// import { orderApi } from "../../../axiosconfig"

// export default function TrackOrder() {
//   const [orders, setOrders] = useState([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [loading, setLoading] = useState(true)
  
//   const fetchOrders = async () => {
//     try {
//       const response = await orderApi.get("/")
//       console.log("this is the response of the order",response.data)
//     //   const updatedOrders = response.data.map(order => ({
//     //     ...order,
//     //     image: order.image ? `${process.env.REACT_APP_BASE_URL}/${order.image}` : order.image
//     //   }))
  
//     //   setOrders(updatedOrders)

//       setOrders(response.data)
//     } catch (error) {
//       toast.error("Failed to fetch orders")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchOrders()
//   }, [])

//   const handleCancel = async (orderId) => {
//     try {
//         const response = await orderApi.post(`${orderId}/cancel/`);
        
//         if (response.data) {
//             toast.success("Order cancelled successfully");
//             // Update the specific order in the state
//             setOrders(prevOrders => 
//                 prevOrders.map(order => 
//                     order.id === orderId 
//                         ? { ...order, status: 'cancelled' }
//                         : order
//                 )
//             );
//         }
//     } catch (error) {
//         // More detailed error handling
//         const errorMessage = error.response?.data?.error || "Failed to cancel order";
//         toast.error(errorMessage);
//         console.error("Cancel order error:", error);
//     }
// };

// const handleReturn = async (orderId) => {
//   try {
//     const returnReason = prompt("Please provide a reason for returning the order:");
//     if (!returnReason) {
//       toast.error("Return reason is required");
//       return;
//     }

//     const response = await orderApi.post(`${orderId}/return_order/`, { return_reason: returnReason });
    
//     if (response.data) {
//       toast.success("Return request submitted successfully");
//       setOrders(prevOrders => 
//         prevOrders.map(order => 
//           order.id === orderId 
//             ? { ...order, status: 'returned', is_returned: true }
//             : order
//         )
//       );
//     }
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || "Failed to submit return request";
//     toast.error(errorMessage);
//     console.error("Return order error:", error);
//   }
// };

//   const getStatusColor = (status) => {
//     switch (status.toLowerCase()) {
//       case "processing":
//         return "text-yellow-600"
//       case "shipped":
//         return "text-blue-600"
//       case "delivered":
//         return "text-green-600"
//       case "cancelled":
//         return "text-red-600"
//       default:
//         return "text-gray-600"
//     }
//   }

//   const filteredOrders = orders.filter((order) => {
//     const searchLower = searchQuery.toLowerCase()
//     return (
//       order.order_number.toLowerCase().includes(searchLower) ||
//       order.items.some((item) => item.product_name.toLowerCase().includes(searchLower))
//     )
//   })

//   const getEstimatedDelivery = (createdAt) => {
//     const orderDate = new Date(createdAt)
//     const estimatedDate = new Date(orderDate)
//     estimatedDate.setDate(estimatedDate.getDate() + 3)
//     return format(estimatedDate, "dd.MM.yyyy")
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-6">
//         <div className="relative">
//           <Search className="absolute left- top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
//           <Input
//             className="pl-10"
//             placeholder="Search your Orders using name, Order ID, Amount"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="space-y-4">
//         {loading ? (
//           <p className="text-center">Loading orders...</p>
//         ) : filteredOrders.length === 0 ? (
//           <p className="text-center">No orders found</p>
//         ) : (
//           filteredOrders.map((order) => (
//             <Card key={order.id}>
//               {order.items.map((item) => (
//                 <CardContent key={item.id} className="flex items-center gap-4 p-4">
//                   <img src={item.image} alt={item.product_name} className="h-24 w-24 rounded-md object-cover" />
//                   <div className="flex-1 space-y-1">
//                     <h6 className="font-normal">{order.order_number}</h6>
//                     <h3 className="font-medium">{item.product_name}</h3>
//                     <p className="text-sm text-gray-500">
//                       Size: {item.size}, Color: {item.color}
//                     </p>
//                     <p className="font-medium">₹{order.final_total}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className={`font-medium ${getStatusColor(order.status)}`}>{order.status}</p>
//                     <p className="text-sm text-red-500">
//                       Payment Type : {order.payment_method}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       Order Date: {format(new Date(order.created_at), "dd.MM.yyyy")}
//                     </p>
//                     <p className="text-sm text-gray-500">Est. Delivery: {getEstimatedDelivery(order.created_at)}</p>
//                     {order.status !== "delivered" && order.status !== "cancelled" && (
//                       <Button variant="destructive" size="sm" className="mt-2" onClick={() => handleCancel(order.id)}>
//                         Cancel
//                       </Button>
//                     )}
//                     {order.status === "delivered" && (
//                         <div className="space-x-2">
//                           <Button variant="outline" size="sm">
//                             Review
//                           </Button>
//                           <Button 
//                             variant="secondary" 
//                             size="sm" 
//                             onClick={() => handleReturn(order.id)}
//                           >
//                             Return
//                           </Button>
//                         </div>
//                     )}
//                   </div>
//                 </CardContent>
//               ))}
//             </Card>
//           ))
//         )}
//       </div>
//     </div>
//   )
// }


import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search } from 'lucide-react';
import { toast } from "react-toastify";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { orderApi } from "../../../axiosconfig";

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

  const fetchOrders = async () => {
    try {
      const response = await orderApi.get("/");
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
              {order.items.map((item) => (
                <CardContent key={item.id} className="flex items-center gap-4 p-4">
                  <img src={item.image || "/placeholder.svg"} alt={item.product_name} className="h-24 w-24 rounded-md object-cover" />
                  <div className="flex-1 space-y-1">
                    <h6 className="font-normal">{order.order_number}</h6>
                    <h3 className="font-medium">{item.product_name}</h3>
                    <p className="text-sm text-gray-500">
                      Size: {item.size}, Color: {item.color}
                    </p>
                    <p className="font-medium">₹{order.final_total}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getStatusColor(order.status)}`}>{order.status}</p>
                    <p className="text-sm text-red-500">
                      Payment Type : {order.payment_method}
                    </p>
                    <p className="text-sm text-gray-500">
                      Order Date: {format(new Date(order.created_at), "dd.MM.yyyy")}
                    </p>
                    <p className="text-sm text-gray-500">Est. Delivery: {getEstimatedDelivery(order.created_at)}</p>
                    {order.status !== "delivered" && order.status !== "cancelled" && order.status !== "returned" && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setCancelDialogOpen(true);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    {order.status === "delivered" && !order.is_returned && (
                      <div className="space-x-2 mt-2">
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setReturnDialogOpen(true);
                          }}
                        >
                          Return
                        </Button>
                      </div>
                    )}
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setSelectedOrder(order);
                        setInvoiceDialogOpen(true);
                      }}
                    >
                      View Invoice
                    </Button>
                  </div>
                </CardContent>
              ))}
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-4">Order Invoice</h2>
              <p><strong>Order Number:</strong> {selectedOrder.order_number}</p>
              <p><strong>Order Date:</strong> {format(new Date(selectedOrder.created_at), "dd.MM.yyyy")}</p>
              <p><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-2">Items</h3>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Product</th>
                    <th className="text-left">Size</th>
                    <th className="text-left">Color</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.size}</td>
                      <td>{item.color}</td>
                      <td className="text-right">₹{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-6">
                <p><strong>Subtotal:</strong> ₹{selectedOrder.subtotal}</p>
                <p><strong>Shipping:</strong> ₹{selectedOrder.shipping_cost}</p>
                <p><strong>Total:</strong> ₹{selectedOrder.final_total}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}