import { useState } from "react"
import { toast } from "react-toastify"
import { Input } from "@/components/components/ui/input"
import { Button } from "@/components/components/ui/button"
import { Label } from "@/components/components/ui/label"
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

  const [errors, setErrors] = useState({})

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        // Allow only letters and spaces
        return /^[A-Za-z\s]+$/.test(value) ? "" : "Name should contain only letters and spaces"
      case "house_no":
        // Allow letters, numbers, and hyphens
        // Can be up to 3 digits with characters, or just 3 digits
        return /^([A-Za-z0-9-]+|[0-9]{1,3})$/.test(value) && value.replace(/[^0-9]/g, "").length <= 3 
          ? "" 
          : "House/Flat No should contain letters, numbers (up to 3 digits) and hyphens only"
      case "city":
      case "state":
        // Allow only letters and spaces for city and state
        return /^[A-Za-z\s]+$/.test(value) ? "" : `${name.charAt(0).toUpperCase() + name.slice(1)} should contain only letters and spaces`
      case "pin_code":
        // Allow only 6 digits for PIN code
        return /^\d{6}$/.test(value) ? "" : "PIN code must be exactly 6 digits"
      case "mobile_number":
        // Allow only 10 digits for mobile number
        return /^\d{10}$/.test(value) ? "" : "Mobile number must be exactly 10 digits"
      case "alternate_number":
        // Allow empty or 10 digits for alternate number
        return value === "" || /^\d{10}$/.test(value) ? "" : "Alternate number must be exactly 10 digits"
      default:
        return ""
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Prevent non-digit characters for numerical fields
    if (["pin_code", "mobile_number", "alternate_number"].includes(name)) {
      if (!/^\d*$/.test(value)) return
    }
    
    // For house_no, ensure numbers don't exceed 3 digits
    if (name === "house_no") {
      const numericPart = value.replace(/[^0-9]/g, "")
      if (numericPart.length > 3) return
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Validate the field and set error
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
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
    setErrors({})
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validate all required fields
    Object.keys(formData).forEach(key => {
      // Skip validation for optional fields if they are empty
      if ((key === "landmark" || key === "alternate_number") && formData[key] === "") return
      
      const error = validateField(key, formData[key])
      if (error) {
        newErrors[key] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors")
      return
    }
    
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
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="house_no">House/Flat No</Label>
              <Input
                id="house_no"
                name="house_no"
                value={formData.house_no}
                onChange={handleInputChange}
                required
                className={errors.house_no ? "border-red-500" : ""}
              />
              {errors.house_no && <p className="text-red-500 text-xs mt-1">{errors.house_no}</p>}
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
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
                className={errors.pin_code ? "border-red-500" : ""}
              />
              {errors.pin_code && <p className="text-red-500 text-xs mt-1">{errors.pin_code}</p>}
            </div>
            <div>
              <Label>Address Type</Label>
              <div className="flex space-x-4 mt-2">
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
                className={errors.mobile_number ? "border-red-500" : ""}
              />
              {errors.mobile_number && <p className="text-red-500 text-xs mt-1">{errors.mobile_number}</p>}
            </div>
            <div>
              <Label htmlFor="alternate_number">Alternate Number (Optional)</Label>
              <Input
                id="alternate_number"
                name="alternate_number"
                value={formData.alternate_number}
                onChange={handleInputChange}
                maxLength={10}
                className={errors.alternate_number ? "border-red-500" : ""}
              />
              {errors.alternate_number && <p className="text-red-500 text-xs mt-1">{errors.alternate_number}</p>}
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