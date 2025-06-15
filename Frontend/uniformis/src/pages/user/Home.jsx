// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchNewProducts } from "../../redux/product/userProductSlice"
// import ProductCard from "./ProductCard"
// import FilterComponent from "./FilterComponent"
// import { Link, useLocation } from "react-router-dom"
// import { ChevronDown, Search } from "lucide-react"

// const Home = () => {
//   const dispatch = useDispatch()
//   const location = useLocation()
//   const { products, loading, error } = useSelector((state) => state.userProducts)
//   const [filteredProducts, setFilteredProducts] = useState([])
//   const [displayedProducts, setDisplayedProducts] = useState([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [isFilterVisible, setIsFilterVisible] = useState(false)
//   const [searchTerm, setSearchTerm] = useState("")
//   const itemsPerPage = 9
//   const loadMoreCount = 6

//   // Extract search query from URL or localStorage
//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search)
//     const searchQuery = queryParams.get('search')
    
//     if (searchQuery) {
//       setSearchTerm(searchQuery)
//       localStorage.setItem('searchQuery', searchQuery)
//     } else {
//       const storedQuery = localStorage.getItem('searchQuery')
//       if (storedQuery) {
//         setSearchTerm(storedQuery)
//       }
//     }
//   }, [location.search])

//   useEffect(() => {
//     dispatch(fetchNewProducts())
//   }, [dispatch])

//   useEffect(() => {
//     if (products && products.length > 0) {
//       let filtered = [...products]
      
//       // Apply search filter if search term exists
//       if (searchTerm) {
//         filtered = filtered.filter(product => 
//           product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//           product.description.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       } else {
//         // If no search term, show new arrivals by default
//         const thirtyDaysAgo = new Date()
//         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
//         filtered = products.filter((product) => {
//           if (product.created_at) {
//             return new Date(product.created_at) >= thirtyDaysAgo
//           }
//           return true
//         })
//       }
      
//       setFilteredProducts(filtered)
//       setDisplayedProducts(filtered.slice(0, itemsPerPage))
//     }
//   }, [products, searchTerm])

//   const calculateDiscountedPrice = (product) => {
//     return product.variants.reduce((min, variant) => {
//       const discountedPrice = variant.price * (1 - (variant.discount_percentage || 0) / 100)
//       return discountedPrice < min ? discountedPrice : min
//     }, product.variants[0]?.price || 0)
//   }

//   const handleFilter = (filters) => {
//     let filtered = [...products]

//     // Apply search filter first
//     if (searchTerm) {
//       filtered = filtered.filter(product => 
//         product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//         product.description.toLowerCase().includes(searchTerm.toLowerCase())
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
//     setIsFilterVisible(false)
//   }

//   const handleLoadMore = () => {
//     const nextPage = currentPage + 1
//     const startIndex = displayedProducts.length
//     const endIndex = startIndex + loadMoreCount
//     const newProducts = filteredProducts.slice(startIndex, endIndex)
    
//     setDisplayedProducts([...displayedProducts, ...newProducts])
//     setCurrentPage(nextPage)
//   }

//   // Clear search
//   const clearSearch = () => {
//     setSearchTerm("")
//     localStorage.removeItem('searchQuery')
//     // Reset to show new arrivals
//     if (products && products.length > 0) {
//       const thirtyDaysAgo = new Date()
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
//       const newArrivals = products.filter((product) => {
//         if (product.created_at) {
//           return new Date(product.created_at) >= thirtyDaysAgo
//         }
//         return true
//       })
      
//       setFilteredProducts(newArrivals)
//       setDisplayedProducts(newArrivals.slice(0, itemsPerPage))
//     }
//   }

//   if (loading) return (
//     <div className="flex justify-center items-center min-h-screen">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//     </div>
//   )
  
//   if (error) return (
//     <div className="flex justify-center items-center min-h-screen">
//       <div className="bg-red-50 text-red-800 rounded-lg p-4 max-w-md">
//         <h3 className="text-lg font-semibold mb-2">Error</h3>
//         <p>{error}</p>
//       </div>
//     </div>
//   )

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
//           <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            
//             <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">
//               {searchTerm ? `Search Results: "${searchTerm}"` : "New Arrivals"}
//               <span className="block text-sm font-normal text-gray-500 mt-2">
//                 {searchTerm ? 
//                   `Found ${filteredProducts.length} products matching your search` : 
//                   "Discover our latest products and trending items"
//                 }
//               </span>
//             </h1>
            
//             <div className="flex items-center gap-3">
//               {searchTerm && (
//                 <button
//                   onClick={clearSearch}
//                   className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
//                 >
//                   Clear Search
//                 </button>
//               )}
//               <button
//                 onClick={() => setIsFilterVisible(!isFilterVisible)}
//                 className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors md:hidden"
//               >
//                 Filters
//                 <ChevronDown className={`w-4 h-4 transition-transform ${isFilterVisible ? 'rotate-180' : ''}`} />
//               </button>
//             </div>
//           </div>

//           <div className="flex flex-col md:flex-row gap-8">
//             <div className={`md:w-1/4 ${isFilterVisible ? 'block' : 'hidden'} md:block`}>
//               <FilterComponent onFilter={handleFilter} />
//             </div>

//             <div className="md:w-3/4">
//               {displayedProducts.length > 0 ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {displayedProducts.map((product) => (
//                     <Link
//                       key={product.id}
//                       to={`/user/product/${product.id}`}
//                       className="transform transition-all duration-300 hover:scale-105"
//                     >
//                       <ProductCard product={product} />
//                     </Link>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center py-16">
//                   <Search className="h-16 w-16 text-gray-300 mb-4" />
//                   <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
//                   <p className="text-gray-500 text-center max-w-md">
//                     We couldn't find any products matching "{searchTerm}". 
//                     Try a different search term or browse our categories.
//                   </p>
//                   <button
//                     onClick={clearSearch}
//                     className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full shadow transition-all duration-300"
//                   >
//                     View All Products
//                   </button>
//                 </div>
//               )}

//               {filteredProducts.length > displayedProducts.length && (
//                 <div className="flex justify-center mt-12">
//                   <button
//                     onClick={handleLoadMore}
//                     className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//                   >
//                     Load More Products
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Home

"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchNewProducts , fetchProducts} from "../../redux/product/userProductSlice"
import ProductCard from "./ProductCard"
import FilterComponent from "./FilterComponent"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown, Search, X } from "lucide-react"

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
    const searchQuery = queryParams.get("search")

    if (searchQuery) {
      setSearchTerm(searchQuery)
      localStorage.setItem("searchQuery", searchQuery)
    } else {
      const storedQuery = localStorage.getItem("searchQuery")
      if (storedQuery) {
        setSearchTerm(storedQuery)
      }
    }
  }, [location.search])
//on 15 june 2025 to show all the products soreted by created adate updated this funciton
  // useEffect(() => {
  //   dispatch(fetchNewProducts())
  // }, [dispatch])
   useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])
  

  useEffect(() => {
    if (products && products.length > 0) {
      let filtered = [...products]

      // Apply search filter if search term exists
      if (searchTerm) {
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()),
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
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
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
    localStorage.removeItem("searchQuery")
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

  // if (loading)
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex justify-center items-center">
  //       <div className="text-center">
  //         <div className="relative">
  //           <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
  //           <div className="w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin absolute top-2 left-2"></div>
  //         </div>
  //         <p className="mt-4 text-blue-600 font-medium">Loading uniforms...</p>
  //       </div>
  //     </div>
  //   )

  // if (error)
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex justify-center items-center p-4">
  //       <div className="bg-white border border-red-200 text-red-800 rounded-2xl p-8 max-w-md shadow-xl">
  //         <div className="text-center">
  //           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //             <X className="w-8 h-8 text-red-600" />
  //           </div>
  //           <h3 className="text-xl font-bold mb-3">Oops! Something went wrong</h3>
  //           <p className="text-red-600 leading-relaxed">{error}</p>
  //           <button
  //             onClick={() => window.location.reload()}
  //             className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-200"
  //           >
  //             Try Again
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-8 mb-8 backdrop-blur-sm bg-white/90">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                {searchTerm ? `Search Results` : "New Arrivals"}
              </h1>
              {searchTerm && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg text-slate-600">for</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">"{searchTerm}"</span>
                </div>
              )}
              <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                {searchTerm
                  ? `Found ${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} matching your search`
                  : "Discover our latest uniform collection with premium quality and modern designs"}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium border border-slate-200 hover:border-slate-300"
                >
                  <X className="w-4 h-4" />
                  Clear Search
                </button>
              )}
              <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl lg:hidden"
              >
                Filters
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isFilterVisible ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-80 ${isFilterVisible ? "block" : "hidden"} lg:block`}>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <FilterComponent onFilter={handleFilter} />
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {displayedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  {displayedProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/user/product/${product.id}`}
                      className="group block transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                    >
                      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-blue-300 overflow-hidden group-hover:ring-2 group-hover:ring-blue-200">
                        <ProductCard product={product} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="bg-slate-100 rounded-full p-6 mb-6">
                    <Search className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-3">No Products Found</h3>
                  <p className="text-slate-500 text-center max-w-md leading-relaxed mb-8">
                    {searchTerm
                      ? `We couldn't find any uniforms matching "${searchTerm}". Try a different search term or browse our categories.`
                      : "No new arrivals available at the moment. Check back soon for the latest uniform collections."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      View All Products
                    </button>
                  )}
                </div>
              )}

              {/* Load More Button */}
              {filteredProducts.length > displayedProducts.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-300"
                  >
                    Load More Products
                    <span className="ml-2 text-blue-200">
                      ({filteredProducts.length - displayedProducts.length} remaining)
                    </span>
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
