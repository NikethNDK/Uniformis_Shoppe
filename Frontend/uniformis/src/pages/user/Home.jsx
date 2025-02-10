import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchNewProducts } from "../../redux/product/userProductSlice"
import ProductCard from "./ProductCard"
import FilterComponent from "./FilterComponent"
import { Link } from "react-router-dom"  

const Home = () => {
  const dispatch = useDispatch()
  const { products, loading, error, hasMore, currentPage  } = useSelector((state) => state.userProducts)
  const [filteredProducts, setFilteredProducts] = useState([])

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
        return true // Include products without created_at date
      })
      
      console.log("Available products:", products.length)
      console.log("Filtered new arrivals:", newArrivals.length)
      
      // If no new arrivals are found, show all products
      setFilteredProducts(newArrivals.length > 0 ? newArrivals : products)
    }
  }, [products])

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchNewProducts(currentPage));
    }
  };

  const handleFilter = (filters) => {
    let filtered = [...products]

    if (filters.category) {
      filtered = filtered.filter((product) => 
        product.category && product.category.id === filters.category
      )
    }

    if (filters.minPrice) {
      filtered = filtered.filter((product) => {
        const lowestPrice = product.variants.reduce(
          (min, variant) => (variant.price < min ? variant.price : min),
          product.variants[0]?.price || 0
        )
        return lowestPrice >= filters.minPrice
      })
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((product) => {
        const lowestPrice = product.variants.reduce(
          (min, variant) => (variant.price < min ? variant.price : min),
          product.variants[0]?.price || 0
        )
        return lowestPrice <= filters.maxPrice
      })
    }

    setFilteredProducts(filtered)
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
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 mb-4 md:mb-0">
          <FilterComponent onFilter={handleFilter} />
        </div>
        <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/user/product/${product.id}`}  // Changed from href to to
              className="transition-transform duration-300 hover:scale-105"
            >
              <ProductCard product={product} />
            </Link>
          ))}
           {hasMore && (
            <div className="flex justify-center mt-8 mb-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home