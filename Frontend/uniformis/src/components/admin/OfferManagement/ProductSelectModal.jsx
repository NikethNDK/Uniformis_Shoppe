
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Checkbox } from "../../components/ui/checkbox"

export function ProductSelectModal({ open, onClose, selectedProducts, onSelectProducts, categoryId }) {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && categoryId) {
      fetchProducts()
    }
  }, [open, categoryId])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?category=${categoryId}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Failed to fetch products:", error)
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

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedProducts.some((p) => p.id === product.id)
                return (
                  <div key={product.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                    <Checkbox checked={isSelected} onCheckedChange={() => handleToggleProduct(product)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground truncate">Stock: {product.stock_quantity}</p>
                    </div>
                    {product.price && <div className="text-sm font-medium">${product.price}</div>}
                  </div>
                )
              })
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

