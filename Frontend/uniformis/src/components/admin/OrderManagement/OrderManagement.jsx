import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, MoreVertical, Search, User } from "lucide-react"
import { toast } from "react-toastify"
import { orderApi } from "../../../adminaxiosconfig"

import { Calendar } from "../../components/ui/calendar"
import { Card } from "../../components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import './OrderManagement.css'

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
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

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderApi.get("")
      console.log("admin order fetching: ",response.data)
      setOrders(response.data)
    } catch (error) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filters, dateRange])

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

  const handleRefund = async (orderId) => {
    try {
      await orderApi.post(`/${orderId}/refund/`)
      toast.success("Refund initiated successfully")
      fetchOrders()
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
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <>
                    <TableRow 
                      key={order.id}
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
                                e.stopPropagation()
                                handleRefund(order.id)
                              }}
                              disabled={order.payment_status === "refunded" || order.payment_method === "cod"}
                            >
                              Refund
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
                                </SelectContent>
                              </Select>
                            </div>

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
                                      <p className="text-sm text-muted-foreground">
                                        Original: ₹{item.original_price}
                                      </p>
                                      <p className="text-sm text-green-600">
                                        Discount: ₹{item.discount_amount} ({item.discount_percentage}%)
                                      </p>
                                      <p className="font-medium">Final Price: ₹{item.final_price}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}