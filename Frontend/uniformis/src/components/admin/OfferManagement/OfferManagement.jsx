
// working piece
import { useState, useEffect } from "react"
import { Plus, Search, Pencil, Trash2, X } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ProductSelectModal } from "./ProductSelectModal"
import { DatePicker } from "../../components/ui/date-picker"
import { Switch } from "../../components/ui/switch"
import { toast } from "react-toastify"
import { offersApi, productApi } from "../../../adminaxiosconfig"
import LoadingSpinner from "../../components/ui/loading-spinner"

export default function OfferManagement() {
  // Form state
  const initialFormState = {
    id: null,
    name: "",
    offerType: "PRODUCT",
    category: "",
    products: [],
    discountPercentage: "",
    validFrom: new Date(),
    validUntil: new Date(new Date().setDate(new Date().getDate() + 7)),
  }
  
  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)

  // Other state
  const [categories, setCategories] = useState([])
  const [offers, setOffers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [referralOffer, setReferralOffer] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchOffers()
    fetchReferralOffer()
  }, [])

  // Fetch functions remain the same...
  const fetchCategories = async () => {
    try {
      const response = await productApi.get("/categories/")
      setCategories(response.data)
    } catch (error) {
      toast.error("Failed to fetch categories")
    }
  }

  const fetchOffers = async () => {
    try {
      setIsLoading(true)
      const response = await offersApi.get("/offers/")
      console.log("get offers: ",response.data)
      setOffers(response.data)
    } catch (error) {
      toast.error("Failed to fetch offers")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReferralOffer = async () => {
    try {
      const response = await offersApi.get("/referral-offers/")
      setReferralOffer(response.data[0] || null)
    } catch (error) {
      toast.error("Failed to fetch referral offer")
    }
  }

  // Form handling
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) {
      errors.name = "Offer name is required"
    }
    if (!formData.discountPercentage || formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      errors.discountPercentage = "Please enter a valid discount percentage between 0 and 100"
    }
    if (formData.validUntil <= formData.validFrom) {
      errors.validUntil = "End date must be after start date"
    }
    if (formData.offerType === "CATEGORY" && !formData.category) {
      errors.category = "Please select a category"
    }
    if (formData.offerType === "PRODUCT" && formData.products.length === 0) {
      errors.products = "Please select at least one product"
    }
    return errors
  }

  const handleEdit = (offer) => {
    setIsEditing(true)
    setFormData({
      id: offer.id,
      name: offer.name,
      offerType: offer.offer_type,
      category: offer.category?.id?.toString() || "",
      products: offer.products || [],
      discountPercentage: offer.discount_percentage.toString(),
      validFrom: new Date(offer.valid_from),
      validUntil: new Date(offer.valid_until)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      Object.values(errors).forEach(error => toast.error(error))
      return
    }

    try {
      setIsLoading(true)
      
      const offerData = {
        name: formData.name,
        offer_type: formData.offerType,
        discount_percentage: Number.parseInt(formData.discountPercentage),
        valid_from: formData.validFrom.toISOString(),
        valid_until: formData.validUntil.toISOString(),
      }

      if (formData.offerType === "CATEGORY") {
        offerData.category_id = formData.category
      } else if (formData.offerType === "PRODUCT") {
        offerData.product_ids = formData.products.map(p => p.id)
      }

      if (formData.offerType === "REFERRAL") {
        const referralData = {
          referrer_discount: Number.parseInt(formData.discountPercentage),
          referee_discount: Number.parseInt(formData.discountPercentage),
          valid_until: formData.validUntil.toISOString(),
        }
        
        if (referralOffer) {
          await offersApi.put(`/referral-offers/${referralOffer.id}/`, referralData)
        } else {
          await offersApi.post("/referral-offers/", referralData)
        }
        toast.success("Referral offer updated successfully")
        fetchReferralOffer()
      }  else {
        if (isEditing) {
          const response = await offersApi.put(`/offers/${formData.id}/`, offerData)
          if (!response.data) throw new Error('No response data received')
          toast.success("Offer updated successfully")
        } else {
          const response = await offersApi.post("/offers/", offerData)
          if (!response.data) throw new Error('No response data received')
          toast.success("Offer added successfully")
        }
        fetchOffers()
      }

      setFormData(initialFormState)
      setIsEditing(false)
    } catch (error) {
      console.error('Error details:', error)
      toast.error(error.response?.data?.message || "Failed to save offer")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData(initialFormState)
    setFormErrors({})
  }

  
const handleToggleOffer = async (offerId) => {
  try {
    await offersApi.patch(`/offers/${offerId}/toggle_active/`)
    fetchOffers()
    toast.success("Offer status updated")
  } catch (error) {
    toast.error("Failed to update offer status")
  }
}

const handleDeleteOffer = async (offerId) => {
  try {
    await offersApi.delete(`/offers/${offerId}/`)
    fetchOffers()
    toast.success("Offer deleted successfully")
  } catch (error) {
    toast.error("Failed to delete offer")
  }
}

  return (
    <div className="ml-64 p-8">
      {isLoading && <LoadingSpinner />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Offers Management</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-muted/50 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Offer" : "Add New Offer"}
          </h2>
          {isEditing && (
            <Button type="button" variant="ghost" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel Edit
            </Button>
          )}
        </div>
        <h2 className="text-lg font-semibold mb-4">Add New Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              placeholder="Offer Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          <Select value={formData.offerType} onValueChange={(value) => handleInputChange('offerType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Offer Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRODUCT">Product Offer</SelectItem>
              <SelectItem value="CATEGORY">Category Offer</SelectItem>
              <SelectItem value="REFERRAL">Referral Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {formData.offerType === "CATEGORY" && (
            <div>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
            </div>
          )}

          {formData.offerType === "PRODUCT" && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className={formErrors.products ? 'border-red-500' : ''}
              >
                {formData.products.length ? `${formData.products.length} products selected` : "Select Products"}
              </Button>
              {formErrors.products && <p className="text-red-500 text-sm mt-1">{formErrors.products}</p>}
            </div>
          )}

          <div>
            <Input
              type="number"
              placeholder="Discount Percentage"
              value={formData.discountPercentage}
              onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
              min="0"
              max="100"
              className={formErrors.discountPercentage ? 'border-red-500' : ''}
            />
            {formErrors.discountPercentage && (
              <p className="text-red-500 text-sm mt-1">{formErrors.discountPercentage}</p>
            )}
          </div>

          <DatePicker
            selected={formData.validFrom}
            onChange={(date) => handleInputChange('validFrom', date)}
            placeholder="Valid From"
          />

          <div>
            <DatePicker
              selected={formData.validUntil}
              onChange={(date) => handleInputChange('validUntil', date)}
              placeholder="Valid Until"
              className={formErrors.validUntil ? 'border-red-500' : ''}
            />
            {formErrors.validUntil && <p className="text-red-500 text-sm mt-1">{formErrors.validUntil}</p>}
          </div>
        </div>
        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner className="h-4 w-4 mr-2" />
              {isEditing ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {isEditing ? "Update Offer" : "Add Offer"}
            </>
          )}
        </Button>
        
      </form>

      {/* Rest of the table component remains the same */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Item/Category</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>{offer.name}</TableCell>
                <TableCell>{offer.offer_type}</TableCell>
                <TableCell>
                  {offer.offer_type === "PRODUCT" && offer.products?.[0] && (
                    <div className="flex items-center gap-2">
                      <img
                        src={offer.products[0].images?.[0]?.image}
                        alt={offer.products[0].name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span>{offer.products[0].name}</span>
                    </div>
                  )}
                  {offer.offer_type === "CATEGORY" && offer.category?.name}
                  {offer.offer_type === "REFERRAL" && "N/A"}
                </TableCell>
                <TableCell>{offer.discount_percentage}%</TableCell>
                <TableCell>{new Date(offer.valid_until).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Switch checked={offer.is_active} onCheckedChange={() => handleToggleOffer(offer.id)} />
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEdit(offer)}
                    disabled={isEditing}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteOffer(offer.id)}
                    disabled={isEditing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductSelectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedProducts={formData.products}
        onSelectProducts={(products) => handleInputChange('products', products)}
        categoryId={formData.category}
      />
    </div>
  )
}