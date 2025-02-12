import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Checkbox } from "../../components/ui/checkbox"
import { productApi } from "../../../adminaxiosconfig"

export function ProductSelectModal({ open, onClose, selectedProducts, onSelectProducts, categoryId }) {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     if (open && categoryId) {
//       fetchProducts()
//     }
//   }, [open, categoryId])
useEffect(() => {
    if (open) {
      fetchProducts()
    }
  }, [open])

//   const fetchProducts = async () => {
//     try {
//       setLoading(true)
//       const response = await productApi.get(`/items/`, {
//         params: {
//           category: categoryId
//         }
//       })
//       setProducts(response.data.results)
//     } catch (error) {
//       console.error("Failed to fetch products:", error)
//       setProducts([])
//     } finally {
//       setLoading(false)
//     }
//   }
const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = categoryId ? { category: categoryId } : {}
      const response = await productApi.get('/items/', { params })
      console.log('Fetched products:', response.data.results)
      setProducts(response.data.results)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProduct = (product) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id)
    if (isSelected) {
      onSelectProducts(selectedProducts.filter((p) => p.id !== product.id))
    } else {
      onSelectProducts([...selectedProducts, product])
    }
  }

  const calculateProductDetails = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return { totalStock: 0, minPrice: 0, maxPrice: 0 }
    }

    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock_quantity, 0)
    const prices = product.variants.map(variant => parseFloat(variant.price))
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return { totalStock, minPrice, maxPrice }
  }

  const filteredProducts = Array.isArray(products) 
    ? products.filter((product) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">Loading...</div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const isSelected = selectedProducts.some((p) => p.id === product.id)
                const { totalStock, minPrice, maxPrice } = calculateProductDetails(product)
                return (
                  <div key={product.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                    <Checkbox checked={isSelected} onCheckedChange={() => handleToggleProduct(product)} />
                    
                    {/* Product Image */}
                    {product.images && product.images.length > 0 && (
                      <div className="w-16 h-16 flex-shrink-0">
                        <img 
                          src={product.images[0].image} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Total Stock: {totalStock}</p>
                      <p className="text-sm text-muted-foreground">
                        Price: ₹{minPrice.toFixed(2)}
                        {maxPrice > minPrice && ` - ₹${maxPrice.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center h-32">No products found</div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Select {selectedProducts.length} Products</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}