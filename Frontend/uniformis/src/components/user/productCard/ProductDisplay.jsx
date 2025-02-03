import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts, fetchMoreProducts } from "../../../redux/product/userProductSlice"
import ProductCard from "./ProductCard"
import { Link } from "react-router-dom"

const ProductDisplay = () => {
  const dispatch = useDispatch()
  const { products, categories, loading, error, nextPage } = useSelector((state) => state.userProducts)
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialFetchDone, setInitialFetchDone] = useState(false)

  useEffect(() => {
    if (!initialFetchDone && !loading && !error) {
      dispatch(fetchProducts())
      setInitialFetchDone(true)
    }
  }, [dispatch, initialFetchDone, loading, error])

  const loadMoreProducts = () => {
    if (nextPage && !loadingMore) {
      setLoadingMore(true)
      dispatch(fetchMoreProducts(nextPage)).finally(() => setLoadingMore(false))
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">Error: {error}</div>
  }

  if (!products.length && initialFetchDone) {
    return <div className="text-center p-4">No products available.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {categories.map((category) => {
        const categoryProducts = products.filter((product) => product.category && product.category.id === category.id)

        if (categoryProducts.length === 0) return null

        return (
          <div key={category.id} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{category.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/user/product/${product.id}`}
                  className="transition-transform duration-300 hover:scale-105"
                >
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          </div>
        )
      })}
      {nextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMoreProducts}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductDisplay

