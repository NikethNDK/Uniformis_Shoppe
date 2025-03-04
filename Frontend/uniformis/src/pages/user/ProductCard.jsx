
import React, { useState } from 'react';
import { Card, CardContent } from "../../components/components/ui/card";
import { useSelector, useDispatch } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../redux/Wishlist/wishlistSlice'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading } = useSelector((state) => state.wishlist);
  const [localWishlistState, setLocalWishlistState] = useState(false);
  
  if (!product) return null;

  const rating = product.reviews?.length > 0 
    ? (product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length)
    : 0;

  const variants = product.variants || [];
  const images = product.images || [];
  
  const lowestPrice = variants.length > 0
    ? variants.reduce(
        (min, variant) => (variant.price < min ? variant.price : min),
        variants[0].price
      )
    : 0;

  const discountedPrice = lowestPrice * (1 - (product.discount_percentage || 0) / 100);

  // Find the lowest priced variant that is active and has stock
  const lowestPricedVariant = variants.length > 0
    ? variants
        .filter(v => v.is_active && v.stock_quantity > 0)
        .reduce(
          (lowest, current) => (current.price < lowest.price ? current : lowest),
          variants.filter(v => v.is_active && v.stock_quantity > 0)[0] || variants[0]
        )
    : null;

  // Check if any variant of the product is in the wishlist
  const isInWishlist = wishlistItems?.some(
    (item) => 
      item.variant && 
      (item.variant.product_id === product.id || 
       (lowestPricedVariant && item.variant.id === lowestPricedVariant.id))
  ) || localWishlistState;

  const handleWishlistToggle = async (e) => {
    // Prevent event from bubbling up
    e.preventDefault();
    e.stopPropagation();
    
    if (!lowestPricedVariant) return;

    try {
      if (isInWishlist) {
        // update local state for UI responsiveness
        setLocalWishlistState(false);
        
        // Find the wishlist item to remove
        const wishlistItem = wishlistItems.find(
          (item) => 
            item.variant && 
            (item.variant.product_id === product.id || 
            (lowestPricedVariant && item.variant.id === lowestPricedVariant.id))
        );
        
        if (wishlistItem) {
          await dispatch(
            removeFromWishlist({
              item_id: wishlistItem.id,
            })
          ).unwrap();
        }
      } else {
        // update local state for UI responsiveness
        setLocalWishlistState(true);
        
        await dispatch(
          addToWishlist({
            variant_id: lowestPricedVariant.id,
            quantity: 1,
          })
        ).unwrap();
      }
    } catch (error) {
      // Revert the local state on error
      setLocalWishlistState(isInWishlist);
      console.error("Failed to update wishlist:", error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <Card className="overflow-hidden h-full relative">
      {/* Wishlist heart icon */}
      <button
        className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        onClick={handleWishlistToggle}
        disabled={!lowestPricedVariant || lowestPricedVariant.stock_quantity === 0 || loading}
      >
        <svg
          className={`w-5 h-5 ${isInWishlist ? "text-red-500 fill-current" : "text-red-500"}`}
          fill={isInWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
      
      <div className="relative h-64 overflow-hidden">
        {images[0] && (
          <img 
            src={images[0].image || "/placeholder.svg"} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate no-underline">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2 no-underline">
          {product.description}
        </p>
        <div className="flex items-center mt-2">
          {renderStars(rating)}
          <span className="text-sm text-gray-500 ml-2 no-underline">
            ({product.reviews?.length || 0} reviews)
          </span>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className="text-xl text-green-600 font-bold no-underline">
              ₹{discountedPrice.toLocaleString()}
            </span>
            {product.discount_percentage > 0 && (
              <>
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₹{lowestPrice.toLocaleString()}
                </span>
                <span className="text-sm text-red-500 ml-2 no-underline">
                  ({product.discount_percentage}% off)
                </span>
              </>
            )}
          </div>
          {product.category && (
            <span className="text-sm text-gray-500 no-underline">
              {product.category.name}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;