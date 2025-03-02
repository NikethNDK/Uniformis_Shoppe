import { useState } from "react"
import { toast } from "react-toastify"
import { Input } from "@/components/components/ui/input"
import { Button } from "@/components/components/ui/button"
import { Label } from "@/components/components/ui/label"
// Remove the RadioGroupItem import
// import { RadioGroupItem } from "@/components/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/components/ui/dialog"

const AddressFormDialog = ({ open, onOpenChange, onAddressAdded, axiosInstance }) => {
  const [formData, setFormData] = useState({
    name: "",
    house_no: "",
    city: "",
    state: "",
    pin_code: "",
    address_type: "home",
    landmark: "",
    mobile_number: "",
    alternate_number: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      house_no: "",
      city: "",
      state: "",
      pin_code: "",
      address_type: "home",
      landmark: "",
      mobile_number: "",
      alternate_number: "",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axiosInstance.post("/addresses/", formData)
      toast.success("Address added successfully")
      // Pass the new address back to the parent component
      onAddressAdded(response.data)
      // Close the dialog
      onOpenChange(false)
      // Reset the form
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add address")
    }
  }

  // Function to handle radio button change
  const handleAddressTypeChange = (type) => {
    setFormData(prev => ({...prev, address_type: type}))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
          <DialogDescription>
            Add a new delivery address for your order
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="house_no">House/Flat No</Label>
              <Input
                id="house_no"
                name="house_no"
                value={formData.house_no}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="pin_code">PIN Code</Label>
              <Input
                id="pin_code"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleInputChange}
                maxLength={6}
                required
              />
            </div>
            <div>
              <Label>Address Type</Label>
              <div className="flex space-x-4 mt-2">
                {/* Replace RadioGroupItem with regular radio inputs */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="home"
                    name="address_type"
                    value="home"
                    checked={formData.address_type === "home"}
                    onChange={() => handleAddressTypeChange("home")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="home">Home</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="work"
                    name="address_type"
                    value="work"
                    checked={formData.address_type === "work"}
                    onChange={() => handleAddressTypeChange("work")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="work">Work</Label>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleInputChange}
                maxLength={10}
                required
              />
            </div>
            <div>
              <Label htmlFor="alternate_number">Alternate Number (Optional)</Label>
              <Input
                id="alternate_number"
                name="alternate_number"
                value={formData.alternate_number}
                onChange={handleInputChange}
                maxLength={10}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <Button type="button" variant="outline" onClick={() => {
              onOpenChange(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button type="submit">
              Add Address
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddressFormDialog