import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchNewProducts } from "../../redux/product/userProductSlice"
import ProductCard from "./ProductCard"
import FilterComponent from "./FilterComponent"
import { Link } from "react-router-dom"

const Home = () => {
  const dispatch = useDispatch()
  const { products, loading, error } = useSelector((state) => state.userProducts)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const loadMoreCount = 6

  useEffect(() => {
    dispatch(fetchNewProducts())
  }, [dispatch])

  useEffect(() => {
    if (products && products.length > 0) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const newArrivals = products.filter((product) => {
        if (product.created_at) {
          return new Date(product.created_at) >= thirtyDaysAgo
        }
        return true
      })
      
      const initialProducts = newArrivals.length > 0 ? newArrivals : products
      setFilteredProducts(initialProducts)
      setDisplayedProducts(initialProducts.slice(0, itemsPerPage))
    }
  }, [products])

  const calculateDiscountedPrice = (product) => {
    return product.variants.reduce((min, variant) => {
      const discountedPrice = variant.price * (1 - (variant.discount_percentage || 0) / 100)
      return discountedPrice < min ? discountedPrice : min
    }, product.variants[0]?.price || 0)
  }

  const handleFilter = (filters) => {
    let filtered = [...products]

    if (filters.category) {
      filtered = filtered.filter((product) => 
        product.category && product.category.id === filters.category
      )
    }

    if (filters.minPrice) {
      filtered = filtered.filter((product) => {
        const discountedPrice = calculateDiscountedPrice(product)
        return discountedPrice >= filters.minPrice
      })
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((product) => {
        const discountedPrice = calculateDiscountedPrice(product)
        return discountedPrice <= filters.maxPrice
      })
    }

    setFilteredProducts(filtered)
    setDisplayedProducts(filtered.slice(0, itemsPerPage))
    setCurrentPage(1)
  }

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    const startIndex = displayedProducts.length
    const endIndex = startIndex + loadMoreCount
    const newProducts = filteredProducts.slice(startIndex, endIndex)
    
    setDisplayedProducts([...displayedProducts, ...newProducts])
    setCurrentPage(nextPage)
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  )
  
  if (error) return <div className="text-center text-red-600 p-4">Error: {error}</div>
  if (!products || products.length === 0) return <div className="text-center p-4">No products found</div>

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold my-8">New Arrivals</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/5">
          <div className="sticky top-4 bg-white rounded-lg shadow-sm p-4">
            <FilterComponent onFilter={handleFilter} />
          </div>
        </div>
        <div className="md:w-4/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/user/product/${product.id}`}
                className="transition-transform duration-300 hover:scale-105"
              >
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
          {filteredProducts.length > displayedProducts.length && (
            <div className="flex justify-center mt-8 mb-8">
              <button
                onClick={handleLoadMore}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home