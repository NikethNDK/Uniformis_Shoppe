"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Star } from "lucide-react"
import { productApi } from "../../../axiosconfig"

const ReviewComponent = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [stats, setStats] = useState({
    average: 0,
    count: 0,
    distribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  })

  useEffect(() => {
    fetchReviews(1, true)
    fetchReviewStats()
  }, [productId]) //Fixed: Removed unnecessary dependencies

  const fetchReviews = async (pageNum, reset = false) => {
    try {
      setLoading(true)
      // Fixed URL to match backend route
      const response = await productApi.get(`/${productId}/reviews/?page=${pageNum}`)

      if (reset) {
        setReviews(response.data.results)
      } else {
        setReviews((prev) => [...prev, ...response.data.results])
      }

      setHasMore(response.data.next !== null)
      setPage(pageNum)
      setLoading(false)
    } catch (err) {
      setError("Failed to load reviews")
      setLoading(false)
      console.error("Error fetching reviews:", err)
    }
  }

  const fetchReviewStats = async () => {
    try {
      // Fixed URL to match backend route
      const response = await productApi.get(`/${productId}/review-stats/`)
      setStats(response.data)
    } catch (err) {
      console.error("Error fetching review stats:", err)
    }
  }

  const handleLoadMore = () => {
    fetchReviews(page + 1)
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} ${months === 1 ? "month" : "months"} ago`
    }
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? "year" : "years"} ago`
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Average Rating */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-800">{stats.average.toFixed(1)}</div>
          <div className="flex items-center my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.average) ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600">Product Rating</div>
          <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
            {stats.count} {stats.count === 1 ? "review" : "reviews"}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          {[5, 4, 3, 2, 1].map((rating) => {
            const percentage = stats.count > 0 ? Math.round((stats.distribution[rating] / stats.count) * 100) : 0

            return (
              <div key={rating} className="flex items-center mb-2">
                <div className="flex items-center w-16">
                  <span className="text-sm mr-1">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-sm ml-2 w-10 text-right">{percentage}%</span>
              </div>
            )
          })}
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4">Reviews</h3>

      {reviews.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review this product!</div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mr-4">
                  {getInitials(review.user_name)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{review.user_name}</h4>
                      <div className="text-sm text-gray-500">{formatDate(review.created_at)}</div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {hasMore && !loading && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium transition-colors"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewComponent

