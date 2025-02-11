

import { useState, useEffect } from "react"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { ProductSelectModal } from "./ProductSelectModal"
import { toast } from "react-toastify"
import { offersApi, productApi } from "../../../adminaxiosconfig"

export default function OffersPage() {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedProducts, setSelectedProducts] = useState([])
  const [offerPercentage, setOfferPercentage] = useState("")
  const [offers, setOffers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Fetch categories and offers on component mount
    fetchCategories()
    fetchOffers()
  }, [])

  const fetchCategories = async () => {
    try {
     const response = await productApi.get("/categories/")
     const sortedCategories = response.data.sort((a, b) => a.id - b.id)
      setCategories(sortedCategories)
    } catch (error) {
      toast.error("Failed to fetch Category")
    }
  }

  const fetchOffers = async () => {
    try {
      const response = await  offersApi.get("/offers")
      const data = await response.json()
      setOffers(data)
    } catch (error) {
      toast.error("Failed to fetch offers")
    }
  }

  const handleAddOffer = async () => {
    try {
      const response = await offersApi.post("/offers", {
           
          category_id: selectedCategory,
          product_ids: selectedProducts.map((p) => p.id),
          discount_percentage: Number.parseInt(offerPercentage),
      
      })

      if (!response.ok) throw new Error("Failed to add offer")

      toast.success("Offer added successfully")

      // Reset form and refresh offers
      setSelectedCategory("")
      setSelectedProducts([])
      setOfferPercentage("")
      fetchOffers()
    } catch (error) {
      toast.error("Failed to add offer")
    }
  }

  const handleToggleOffer = async (offerId, currentStatus) => {
    try {
      await offersApi.patch(`/offers/${offerId}/toggle`, {
        is_active: !currentStatus,
      });
  
      fetchOffers();
      toast.success("Offer status updated successfully");
    } catch (error) {
      toast.error("Failed to update offer status");
    }
  };
  

  const handleDeleteOffer = async (offerId) => {
    try {
      await offersApi.delete(`/offers/${offerId}`);
  
      fetchOffers();
      toast.success("Offer deleted successfully");
    } catch (error) {
      toast.error("Failed to delete offer");
    }
  };
  

  const filteredOffers = offers.filter(
    (offer) =>
      offer.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="ml-64 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Offers</h1>
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

      <div className="bg-muted/50 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <Button variant="outline" className="w-full" onClick={() => setIsModalOpen(true)}>
              {selectedProducts.length ? `${selectedProducts.length} products selected` : "Select Products"}
            </Button>
          </div>

          <Input
            type="number"
            placeholder="Offer percentage"
            value={offerPercentage}
            onChange={(e) => setOfferPercentage(e.target.value)}
            min="0"
            max="100"
          />

          <Button onClick={handleAddOffer}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Offer</TableHead>
              <TableHead>Action</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOffers.map((offer, index) => (
              <TableRow key={offer.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{offer.category.name}</TableCell>
                <TableCell>{offer.product.name}</TableCell>
                <TableCell>{offer.discount_percentage}%</TableCell>
                <TableCell>
                  <Button
                    variant={offer.is_active ? "default" : "destructive"}
                    size="sm"
                    onClick={() => handleToggleOffer(offer.id, offer.is_active)}
                  >
                    {offer.is_active ? "List" : "Unlist"}
                  </Button>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteOffer(offer.id)}>
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
        selectedProducts={selectedProducts}
        onSelectProducts={setSelectedProducts}
        categoryId={selectedCategory}
      />
    </div>
  )
}

