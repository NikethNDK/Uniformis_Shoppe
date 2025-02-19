"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, MoreVertical, Search, User, Package2 } from "lucide-react"
import { toast } from "react-toastify"
import { orderApi } from "../../../adminaxiosconfig"
import logo from '../../../assets/logo.png'
import { Calendar } from "../../components/ui/calendar"
import { Card } from "../../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import "./OrderManagement.css"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
import {
  DialogContent,
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-orange-100 text-orange-800",
}

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState([null, null])
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    paymentMethod: "all",
  })
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [refundConfirmationOpen, setRefundConfirmationOpen] = useState(false)
  const [orderToRefund, setOrderToRefund] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 15

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderApi.get("")
      console.log("admin order fetching: ", response.data)
      setOrders(response.data)
    } catch (error) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filters, dateRange]) // Added filters and dateRange as dependencies

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId)
      await orderApi.patch(`${orderId}/update_status/`, { status: newStatus })
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
      toast.success("Order status updated successfully")
      fetchOrders()
    } catch (error) {
      toast.error("Failed to update order status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleRefund = async (orderId, itemId = null) => {
    try {
      if (itemId) {
        await orderApi.post(`/${orderId}/refund-item/${itemId}/`)
        toast.success("Item refund initiated successfully")
      } else {
        await orderApi.post(`/${orderId}/refund/`)
        toast.success("Order refund initiated successfully")
      }
      fetchOrders()
      setRefundConfirmationOpen(false)
    } catch (error) {
      toast.error("Failed to initiate refund")
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number?.toLowerCase().includes(filters.search.toLowerCase())
    const matchesStatus = filters.status === "all" || order.status === filters.status
    const matchesPayment = filters.paymentMethod === "all" || order.payment_method === filters.paymentMethod
    const matchesDate =
      !dateRange[0] ||
      !dateRange[1] ||
      (new Date(order.created_at) >= dateRange[0] && new Date(order.created_at) <= dateRange[1])

    return matchesSearch && matchesStatus && matchesPayment && matchesDate
  })
  const handleViewInvoice = (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOrder(order);
    setInvoiceDialogOpen(true);
  };
  
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="admin-order-management content1">
      <Card className="p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Order Management</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange[0] && dateRange[1]
                    ? `${format(dateRange[0], "PP")} - ${format(dateRange[1], "PP")}`
                    : "Date Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentMethod}
              onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="cod">COD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Order ID</TableHead>
                <TableHead className="min-w-[250px]">Customer Details</TableHead>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[150px]">Payment</TableHead>
                <TableHead className="w-[100px] text-right">Total</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 7 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : currentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                currentOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {order.user?.first_name} {order.user?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">{order.user?.email}</p>
                            <p className="text-sm text-muted-foreground">{order.user?.phone_number}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(order.created_at), "PP")}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.payment_method}</p>
                          <p className="text-sm text-muted-foreground">{order.payment_status}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <p className="font-medium">Items Total: ₹{order.subtotal}</p>
                          <p className="text-sm text-muted-foreground">Savings: ₹{order.total_savings}</p>
                          <p className="text-sm font-medium text-green-600">Final: ₹{order.final_total}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation();
          setOrderToRefund(order);
          setRefundConfirmationOpen(true);
        }}
        disabled={
          order.payment_status === "refunded" ||
          order.payment_method === "cod" ||
          !["cancelled", "returned"].includes(order.status)
        }
      >
        Refund Order
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(e) => handleViewInvoice(e, order)}
      >
        View Invoice
      </DropdownMenuItem>
    </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="p-6 space-y-6 bg-muted/50">
                            <div className="flex items-center gap-4">
                              <Label className="text-sm font-medium">Update Status:</Label>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusUpdate(order.id, value)}
                                disabled={updatingStatus === order.id}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                  <SelectItem value="returned">Returned</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="address">
                                <AccordionTrigger>Delivery Address</AccordionTrigger>
                                <AccordionContent>
                                  {order.delivery_address && (
                                    <div className="text-sm">
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

                            <div className="space-y-4">
                              <h3 className="font-medium text-lg">Order Items</h3>
                              <div className="grid gap-4">
                                {order.items?.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-4 bg-background rounded-lg border p-4"
                                  >
                                    <img
                                      src={item.image || "/placeholder.svg"}
                                      alt={item.product_name}
                                      className="h-24 w-24 rounded-md object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-lg truncate">{item.product_name}</h4>
                                      <div className="mt-1 text-sm text-muted-foreground space-y-1">
                                        <p>Size: {item.size}</p>
                                        <p>Color: {item.color}</p>
                                        <p>Quantity: {item.quantity}</p>
                                      </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                      <p className="text-sm text-muted-foreground">Original: ₹{item.original_price}</p>
                                      <p className="text-sm text-green-600">
                                        Discount: ₹{item.discount_amount} ({item.discount_percentage}%)
                                      </p>
                                      <p className="font-medium">Final Price: ₹{item.final_price}</p>
                                      {item.status !== "cancelled" && order.payment_method !== "cod" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setOrderToRefund(order)
                                            setRefundConfirmationOpen(true)
                                          }}
                                        >
                                          Refund Item
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }, (_, i) => (
            <Button
              key={i}
              onClick={() => paginate(i + 1)}
              variant={currentPage === i + 1 ? "default" : "outline"}
              className="mx-1"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </Card>

      <Dialog 
  open={invoiceDialogOpen} 
  onOpenChange={(open) => {
    if (!open) {
      setSelectedOrder(null);
      setInvoiceDialogOpen(false);
    }
  }}
>
  <DialogContent className="max-w-4xl max-h-screen flex flex-col">
    <DialogHeader>
      <DialogTitle className="invoice">Invoice</DialogTitle>
    </DialogHeader>
    {selectedOrder ? (
      <>
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            
            <div className="text-center">
              <img src={logo} alt="Logo" className="logo-img mx-auto" />
              <p className="text-sm text-gray-600">1st Floor Rabby Tower, Kannur,670001</p>
            </div>
            
           
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">
                  Bill To: <span>{selectedOrder.delivery_address.name}</span>
                </h3>
                <div className="mt-2">
                  <h6 className="font-medium">Delivery Address</h6>
                  <div className="leading-none">
                    <p className="font-semibold leading-none">{selectedOrder.delivery_address.name}</p>
                    <p>{selectedOrder.delivery_address.house_no},</p>
                    <p>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}</p>
                    <p>{selectedOrder.delivery_address.pin_code}</p>
                  </div>
                </div>
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

            <div className="w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left w-16">Sl No.</th>
                    <th className="border p-2 text-left w-1/3">Item Description</th>
                    <th className="border p-2 text-left w-16">Qty</th>
                    <th className="border p-2 text-left w-24">Price</th>
                    <th className="border p-2 text-left w-24">Discount</th>
                    <th className="border p-2 text-left w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className={`
                        ${item.status === "cancelled" ? "cancelled-stamp" : ""}
                        ${item.status === "delivered" ? "delivered-stamp" : ""}
                      `}
                    >
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{item.product_name}</td>
                      <td className="border p-2">{item.quantity}</td>
                      <td className="border p-2">₹{item.original_price}</td>
                      <td className="border p-2">₹{item.discount_amount}</td>
                      <td className="border p-2">₹{item.final_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right space-y-2">
              <p>
                <strong>Subtotal:</strong> ₹{selectedOrder.subtotal}
              </p>
              <p>
                <strong>Discount:</strong> ₹{selectedOrder.discount_amount}
              </p>
              {selectedOrder.coupon_discount > 0 && (
                <p>
                  <strong>Coupon Discount:</strong> ₹{selectedOrder.coupon_discount}
                </p>
              )}
              <p className="text-xl font-bold">
                <strong>Total:</strong> ₹{selectedOrder.final_total}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              setInvoiceDialogOpen(false);
            }}
          >
            Close
          </Button>
        </div>
      </>
    ) : (
      <div>Loading invoice details...</div>
    )}
  </DialogContent>
</Dialog>

      <Dialog open={refundConfirmationOpen} onOpenChange={setRefundConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to refund this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleRefund(orderToRefund.id)}>Confirm Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

