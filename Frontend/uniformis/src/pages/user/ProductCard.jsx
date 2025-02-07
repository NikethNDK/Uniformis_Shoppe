import React from 'react';  // Added React import

const ProductCard = ({ product }) => {
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      <div className="relative h-64 overflow-hidden">
        {images[0] && (
          <img 
            src={images[0].image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center mt-2">
          {renderStars(rating)}
          <span className="text-sm text-gray-500 ml-2">
            ({product.reviews?.length || 0} reviews)
          </span>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xl text-green-600 font-bold">
            ₹{lowestPrice.toLocaleString()}
          </span>
          {product.category && (
            <span className="text-sm text-gray-500">
              {product.category.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;