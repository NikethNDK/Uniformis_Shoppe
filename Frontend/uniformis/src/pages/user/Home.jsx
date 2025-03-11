// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchNewProducts } from "../../redux/product/userProductSlice"
// import ProductCard from "./ProductCard"
// import FilterComponent from "./FilterComponent"
// import { Link } from "react-router-dom"

// const Home = () => {
//   const dispatch = useDispatch()
//   const { products, loading, error } = useSelector((state) => state.userProducts)
//   const [filteredProducts, setFilteredProducts] = useState([])
//   const [displayedProducts, setDisplayedProducts] = useState([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const itemsPerPage = 9
//   const loadMoreCount = 6

//   useEffect(() => {
//     dispatch(fetchNewProducts())
//   }, [dispatch])

//   useEffect(() => {
//     if (products && products.length > 0) {
//       const thirtyDaysAgo = new Date()
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
//       const newArrivals = products.filter((product) => {
//         if (product.created_at) {
//           return new Date(product.created_at) >= thirtyDaysAgo
//         }
//         return true
//       })
      
//       const initialProducts = newArrivals.length > 0 ? newArrivals : products
//       setFilteredProducts(initialProducts)
//       setDisplayedProducts(initialProducts.slice(0, itemsPerPage))
//     }
//   }, [products])

//   const calculateDiscountedPrice = (product) => {
//     return product.variants.reduce((min, variant) => {
//       const discountedPrice = variant.price * (1 - (variant.discount_percentage || 0) / 100)
//       return discountedPrice < min ? discountedPrice : min
//     }, product.variants[0]?.price || 0)
//   }

//   const handleFilter = (filters) => {
//     let filtered = [...products]

//     if (filters.category) {
//       filtered = filtered.filter((product) => 
//         product.category && product.category.id === filters.category
//       )
//     }

//     if (filters.minPrice) {
//       filtered = filtered.filter((product) => {
//         const discountedPrice = calculateDiscountedPrice(product)
//         return discountedPrice >= filters.minPrice
//       })
//     }

//     if (filters.maxPrice) {
//       filtered = filtered.filter((product) => {
//         const discountedPrice = calculateDiscountedPrice(product)
//         return discountedPrice <= filters.maxPrice
//       })
//     }

//     setFilteredProducts(filtered)
//     setDisplayedProducts(filtered.slice(0, itemsPerPage))
//     setCurrentPage(1)
//   }

//   const handleLoadMore = () => {
//     const nextPage = currentPage + 1
//     const startIndex = displayedProducts.length
//     const endIndex = startIndex + loadMoreCount
//     const newProducts = filteredProducts.slice(startIndex, endIndex)
    
//     setDisplayedProducts([...displayedProducts, ...newProducts])
//     setCurrentPage(nextPage)
//   }

//   if (loading) return (
//     <div className="flex justify-center items-center min-h-screen">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//     </div>
//   )
  
//   if (error) return <div className="text-center text-red-600 p-4">Error: {error}</div>
//   if (!products || products.length === 0) return <div className="text-center p-4">No products found</div>

//   return (
//     <div className="container mx-auto px-4">
//       <h1 className="text-3xl font-bold my-8">New Arrivals</h1>
//       <div className="flex flex-col md:flex-row gap-6">
//         <div className="md:w-1/5">
//           <div className="sticky top-4 bg-white rounded-lg shadow-sm p-4">
//             <FilterComponent onFilter={handleFilter} />
//           </div>
//         </div>
//         <div className="md:w-4/5">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {displayedProducts.map((product) => (
//               <Link
//                 key={product.id}
//                 to={`/user/product/${product.id}`}
//                 className="transition-transform duration-300 hover:scale-105"
//               >
//                 <ProductCard product={product} />
//               </Link>
//             ))}
//           </div>
//           {filteredProducts.length > displayedProducts.length && (
//             <div className="flex justify-center mt-8 mb-8">
//               <button
//                 onClick={handleLoadMore}
//                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300 transform hover:-translate-y-1"
//               >
//                 Load More
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Home


import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchNewProducts } from "../../redux/product/userProductSlice"
import ProductCard from "./ProductCard"
import FilterComponent from "./FilterComponent"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown, Search } from "lucide-react"

const Home = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { products, loading, error } = useSelector((state) => state.userProducts)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 9
  const loadMoreCount = 6

  // Extract search query from URL or localStorage
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const searchQuery = queryParams.get('search')
    
    if (searchQuery) {
      setSearchTerm(searchQuery)
      localStorage.setItem('searchQuery', searchQuery)
    } else {
      const storedQuery = localStorage.getItem('searchQuery')
      if (storedQuery) {
        setSearchTerm(storedQuery)
      }
    }
  }, [location.search])

  useEffect(() => {
    dispatch(fetchNewProducts())
  }, [dispatch])

  useEffect(() => {
    if (products && products.length > 0) {
      let filtered = [...products]
      
      // Apply search filter if search term exists
      if (searchTerm) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      } else {
        // If no search term, show new arrivals by default
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        filtered = products.filter((product) => {
          if (product.created_at) {
            return new Date(product.created_at) >= thirtyDaysAgo
          }
          return true
        })
      }
      
      setFilteredProducts(filtered)
      setDisplayedProducts(filtered.slice(0, itemsPerPage))
    }
  }, [products, searchTerm])

  const calculateDiscountedPrice = (product) => {
    return product.variants.reduce((min, variant) => {
      const discountedPrice = variant.price * (1 - (variant.discount_percentage || 0) / 100)
      return discountedPrice < min ? discountedPrice : min
    }, product.variants[0]?.price || 0)
  }

  const handleFilter = (filters) => {
    let filtered = [...products]

    // Apply search filter first
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
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
    setIsFilterVisible(false)
  }

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    const startIndex = displayedProducts.length
    const endIndex = startIndex + loadMoreCount
    const newProducts = filteredProducts.slice(startIndex, endIndex)
    
    setDisplayedProducts([...displayedProducts, ...newProducts])
    setCurrentPage(nextPage)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    localStorage.removeItem('searchQuery')
    // Reset to show new arrivals
    if (products && products.length > 0) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const newArrivals = products.filter((product) => {
        if (product.created_at) {
          return new Date(product.created_at) >= thirtyDaysAgo
        }
        return true
      })
      
      setFilteredProducts(newArrivals)
      setDisplayedProducts(newArrivals.slice(0, itemsPerPage))
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  )
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-50 text-red-800 rounded-lg p-4 max-w-md">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">
              {searchTerm ? `Search Results: "${searchTerm}"` : "New Arrivals"}
              <span className="block text-sm font-normal text-gray-500 mt-2">
                {searchTerm ? 
                  `Found ${filteredProducts.length} products matching your search` : 
                  "Discover our latest products and trending items"
                }
              </span>
            </h1>
            
            <div className="flex items-center gap-3">
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors md:hidden"
              >
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterVisible ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className={`md:w-1/4 ${isFilterVisible ? 'block' : 'hidden'} md:block`}>
              <FilterComponent onFilter={handleFilter} />
            </div>

            <div className="md:w-3/4">
              {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/user/product/${product.id}`}
                      className="transform transition-all duration-300 hover:scale-105"
                    >
                      <ProductCard product={product} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    We couldn't find any products matching "{searchTerm}". 
                    Try a different search term or browse our categories.
                  </p>
                  <button
                    onClick={clearSearch}
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full shadow transition-all duration-300"
                  >
                    View All Products
                  </button>
                </div>
              )}

              {filteredProducts.length > displayedProducts.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home