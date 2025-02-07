
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { fetchProducts } from "../../../redux/product/userProductSlice"
import ProductGrid from "../../components/components/ui/product-grid"
import PriceFilter from "../../components/components/ui/price-filter"

export default function CategoryPage() {
  const { categoryId } = useParams()
  const dispatch = useDispatch()
  const { products, loading } = useSelector((state) => state.products)
  const [priceRange, setPriceRange] = useState([0, 10000])

  const categoryProducts = products.filter((product) => product.category.id === Number.parseInt(categoryId))

  const filteredProducts = categoryProducts.filter((product) => {
    const productPrice = Math.min(...product.variants.map((v) => v.price))
    return productPrice >= priceRange[0] && productPrice <= priceRange[1]
  })

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{categoryProducts[0]?.category.name || "Products"}</h1>

      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0">
          <PriceFilter value={priceRange} onChange={setPriceRange} min={0} max={10000} />
        </div>

        <div className="flex-1">
          <ProductGrid products={filteredProducts} loading={loading} />
        </div>
      </div>
    </div>
  )
}

