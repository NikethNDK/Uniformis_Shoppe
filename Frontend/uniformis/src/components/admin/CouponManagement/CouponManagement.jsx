"use client"

import { useState, useEffect } from "react"
import { Search, Trash2, Pencil } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Switch } from "../../components/ui/switch"
import { Textarea } from "../../components/ui/textarea"
import { toast } from "react-toastify"
import { offersApi } from "../../../adminaxiosconfig"
import LoadingSpinner from "../../components/ui/loading-spinner"

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discount_percentage: "",
    minimum_purchase: "",
    usage_limit: "",
    valid_from: "",
    valid_until: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setIsLoading(true)
      const response = await offersApi.get("/coupons/")
      setCoupons(response.data)
    } catch (error) {
      toast.error("Failed to fetch coupons")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon)
    setNewCoupon({
      ...coupon,
      valid_from: coupon.valid_from.split("T")[0],
      valid_until: coupon.valid_until.split("T")[0],
    })
  }

  const handleAddOrUpdateCoupon = async () => {
    try {
      if (!newCoupon.code.trim()) {
        toast.error("Coupon code is required")
        return
      }
      if (!newCoupon.discount_percentage || newCoupon.discount_percentage < 0 || newCoupon.discount_percentage > 100) {
        toast.error("Please enter a valid discount percentage between 0 and 100")
        return
      }
      if (!newCoupon.usage_limit || newCoupon.usage_limit < 1) {
        toast.error("Usage limit must be at least 1")
        return
      }
      if (
        newCoupon.valid_from &&
        newCoupon.valid_until &&
        new Date(newCoupon.valid_from) >= new Date(newCoupon.valid_until)
      ) {
        toast.error("End date must be after start date")
        return
      }

      setIsLoading(true)
      if (editingCoupon) {
        await offersApi.put(`/coupons/${editingCoupon.id}/`, newCoupon)
        toast.success("Coupon updated successfully")
      } else {
        await offersApi.post("/coupons/", newCoupon)
        toast.success("Coupon added successfully")
      }
      resetForm()
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingCoupon ? "update" : "add"} coupon`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleCoupon = async (couponId) => {
    try {
      await offersApi.patch(`/coupons/${couponId}/`, {
        is_active: !coupons.find((c) => c.id === couponId).is_active,
      })
      fetchCoupons()
      toast.success("Coupon status updated")
    } catch (error) {
      toast.error("Failed to update coupon status")
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    try {
      await offersApi.delete(`/coupons/${couponId}/`)
      fetchCoupons()
      toast.success("Coupon deleted successfully")
    } catch (error) {
      toast.error("Failed to delete coupon")
    }
  }

  const resetForm = () => {
    setNewCoupon({
      code: "",
      description: "",
      discount_percentage: "",
      minimum_purchase: "",
      usage_limit: "",
      valid_from: "",
      valid_until: "",
    })
    setEditingCoupon(null)
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const filteredCoupons = coupons.filter((coupon) => coupon.code.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="ml-64 p-8">
      {isLoading && <LoadingSpinner />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="bg-muted/50 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Coupon Code"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Discount Percentage"
            value={newCoupon.discount_percentage}
            onChange={(e) => setNewCoupon({ ...newCoupon, discount_percentage: e.target.value })}
            min="0"
            max="100"
          />
          <Input
            type="number"
            placeholder="Usage Limit"
            value={newCoupon.usage_limit}
            onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
            min="1"
          />
          <Input
            type="number"
            placeholder="Minimum Purchase Amount"
            value={newCoupon.minimum_purchase}
            onChange={(e) => setNewCoupon({ ...newCoupon, minimum_purchase: e.target.value })}
            min="0"
          />
          <Input
            type="date"
            value={newCoupon.valid_from}
            onChange={(e) => setNewCoupon({ ...newCoupon, valid_from: e.target.value })}
            placeholder="Valid From"
          />
          <Input
            type="date"
            value={newCoupon.valid_until}
            onChange={(e) => setNewCoupon({ ...newCoupon, valid_until: e.target.value })}
            placeholder="Valid Until"
          />
          <Textarea
            placeholder="Description"
            value={newCoupon.description}
            onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
            className="md:col-span-2"
          />
        </div>
        <div className="flex justify-end gap-2">
          {editingCoupon && (
            <Button onClick={handleCancelEdit} variant="outline">
              Cancel
            </Button>
          )}
          <Button onClick={handleAddOrUpdateCoupon}>{editingCoupon ? "Update Coupon" : "Add Coupon"}</Button>
        </div>
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Minimum Amount</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage Limit</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell>₹{coupon.minimum_purchase}</TableCell>
                <TableCell>{coupon.discount_percentage}%</TableCell>
                <TableCell>{coupon.usage_limit}</TableCell>
                <TableCell>{new Date(coupon.valid_until).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Switch checked={coupon.is_active} onCheckedChange={() => handleToggleCoupon(coupon.id)} />
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditCoupon(coupon)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(coupon.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

