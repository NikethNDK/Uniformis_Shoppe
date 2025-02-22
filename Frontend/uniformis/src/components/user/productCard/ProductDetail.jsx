import React, { useState, useEffect, useRef } from 'react';
import { useParams,Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts,fetchSimilarProducts } from '../../../redux/product/userProductSlice';
import  Lens from '../../../components/ui/lens'
import { useNavigate } from 'react-router-dom';
import './ProductDetail.css'
import { toast } from 'react-toastify';
import { addToCart } from '../../../redux/cart/cartSlice';
import { addToWishlist,removeFromWishlist } from '../../../redux/Wishlist/wishlistSlice';


const WishlistButton = ({ variant, onToggle, isInWishlist }) => {
  return (
    <button 
      className="p-3 border rounded-md hover:border-red-500"
      onClick={onToggle}
      disabled={!variant || variant.stock_quantity === 0}
    >
      <svg 
        className={`w-6 h-6 ${isInWishlist ? 'text-red-500 fill-current' : 'text-red-500'}`} 
        fill={isInWishlist ? 'currentColor' : 'none'} 
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
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate =useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize]=useState(null)
  const [selectedColor, setSelectedColor]=useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1);
  const scrollRef = useRef(null);

  const { products, similarProducts, loading } = useSelector((state) => state.userProducts);
  const product = products.find(p => p.id === parseInt(id));

  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const isInWishlist = wishlistItems.some(item => item.variant.id === selectedVariant?.id);

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);


  useEffect(() => {
    if (product?.id) {
      dispatch(fetchSimilarProducts(product.id));
    }
  }, [product, dispatch]);


  // const handleWishlistToggle = async () => {
  //   if (isInWishlist) {
  //     // Find the wishlist item and remove it
  //     const wishlistItem = wishlistItems.find(item => item.variant.id === selectedVariant.id);
  //     if (wishlistItem) {
  //       await dispatch(removeFromWishlist({ item_id: wishlistItem.id }));
  //     }
  //   } else {
  //     await dispatch(addToWishlist({
  //       variant_id: selectedVariant.id,
  //       quantity: 1
  //     }));
  //   }
  // };

  const handleWishlistToggle = async () => {
    if (!selectedVariant) return;

    try {
      if (isInWishlist) {
        const wishlistItem = wishlistItems.find(item => 
          item.variant.id === selectedVariant.id
        );
        if (wishlistItem) {
          await dispatch(removeFromWishlist({ 
            item_id: wishlistItem.id 
          })).unwrap();
        }
      } else {
        await dispatch(addToWishlist({
          variant_id: selectedVariant.id,
          quantity: 1
        })).unwrap();
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      
    }
  };

  const findLowestPricedVariant = (variants) => {
    const activeVariantsWithStock = variants.filter(v => v.is_active && v.stock_quantity > 0);
    if (activeVariantsWithStock.length === 0) return variants[0]; // fallback
    return activeVariantsWithStock.reduce((lowest, current) => 
      (current.price < lowest.price ? current : lowest)
    );
  }
  const getActiveVariants = () => {
    return product?.variants?.filter(v => v.is_active) || [];
  };

  useEffect(() => {
    if (product && product.variants.length > 0) {
      const lowestPricedVariant = findLowestPricedVariant(product.variants)
      setSelectedSize(lowestPricedVariant.size.name)
      setSelectedColor(lowestPricedVariant.color.name)
      setSelectedVariant(lowestPricedVariant)
    }
  }, [product])

  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = product.variants.find((v) => v.size.name === selectedSize && v.color.name === selectedColor)
      setSelectedVariant(variant)
      setQuantity(1)
    }
  }, [selectedSize, selectedColor, product])

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const scrollThumbnails = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -100 : 100;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  const handleSizeSelect = (size) => {
    setSelectedSize(size)
    const variantsForSize = product.variants.filter((v) => v.size.name === size)
    const lowestPricedVariant = findLowestPricedVariant(variantsForSize)
    setSelectedColor(lowestPricedVariant.color.name)
    setSelectedVariant(lowestPricedVariant)
    setQuantity(1)
  }

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    const variantsForColor = product.variants.filter((v) => v.color.name === color)
    const lowestPricedVariant = findLowestPricedVariant(variantsForColor)
    setSelectedVariant(lowestPricedVariant)
    setQuantity(1)
  }

  const calculateDiscountedPrice = (variant) => {
    if (!variant) return null;
    const discount = product.discount_percentage || 0;
    const discountedPrice = variant.price * (1 - discount / 100);
    return discountedPrice;
  };

  const handleVariantSelect = (variant) => {
    if (!variant.is_active || variant.stock_quantity === 0) {
      toast.warning('This variant is not available');
      return;
    }
    setSelectedVariant(variant);
    setQuantity(1);
  }
  
  const getAvailableSizes = () => {
    const activeVariants = getActiveVariants();
    const variantsWithStock = activeVariants.filter(v => v.stock_quantity > 0);
    return [...new Set(variantsWithStock.map(v => v.size.name))];
  };
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 5 && newQuantity <= selectedVariant.stock_quantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToWishlist = async () => {
        try {
          await dispatch(addToWishlist({
            variant_id: selectedVariant.id,
            quantity: quantity
          })).unwrap()
        } catch (error) {
          // Error handling is already done in the slice
          toast.error('Failed to add to wishlist');
          console.error('Failed to add to wishlist:', error);
    
        }
      };
      const getAvailableColors = (size) => {
        const activeVariants = getActiveVariants();
        return [...new Set(
          activeVariants
            .filter(v => v.size.name === size && v.stock_quantity > 0)
            .map(v => v.color)
        )];
      };
  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({
        variant_id: selectedVariant.id,
        quantity: quantity
      })).unwrap()
    } catch (error) {
      // Error handling is already done in the slice
      toast.error('Failed to add to cart');
      console.error('Failed to add to cart:', error);

    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    
    try {
      // First add to cart
      await dispatch(addToCart({ 
        variantId: selectedVariant.id, 
        quantity: 1 
      })).unwrap();
      
      // Navigate to checkout page
      navigate('/user/checkout');
    } catch (error) {
      console.error('Failed to proceed to checkout:', error);
    }
  };


  if (loading || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // const availableSizes = [...new Set(product.variants.map((v) => v.size.name))]

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-gray-600 mb-8">
        <ol className="list-none p-0 flex flex-wrap">
          <li className="flex items-center">
            <Link to="/user/homepage" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <Link to={`/user/homepage`} className="hover:text-blue-600">
              {product.category.name}
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-800">{product.name}</li>
        </ol>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}


        <div className="relative w-full max-w-[500px] mx-auto">
          <Lens>
            <img
              src={product.images[currentImageIndex].image}
              alt={product.name}
              className="w-full h-[500px] object-contain"
            />
          </Lens>
          {/* Thumbnails */}

          <div className="relative mt-4">
            <button 
              onClick={() => scrollThumbnails('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
            >
              ←
            </button>
            <div 
              ref={scrollRef}
              className="flex space-x-2 overflow-x-hidden relative mx-8 scroll-smooth"
            >
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 ${
                    currentImageIndex === index 
                      ? 'border-2 border-blue-500' 
                      : 'border border-gray-200'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image.image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-16 h-16 object-cover"
                  />
                </button>
              ))}
            </div>
            <button 
              onClick={() => scrollThumbnails('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
            >
              →
            </button>
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="relative">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-5 h-5 ${
                  index < Math.round(product.average_rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {/* {selectedVariant && (
            <div className="text-2xl font-bold text-green-600 mb-4">₹{selectedVariant.price}</div>
          )} */}
           {selectedVariant && (
        <div className="flex items-baseline gap-2 mb-4">
          <div className="text-2xl font-bold text-green-600">
            ₹{calculateDiscountedPrice(selectedVariant).toLocaleString()}
          </div>
          {product.discount_percentage > 0 && (
            <>
              <div className="text-lg text-gray-500 line-through">
                ₹{selectedVariant.price.toLocaleString()}
              </div>
              <div className="text-sm text-red-500">
                ({product.discount_percentage}% off)
              </div>
            </>
          )}
        </div>
      )}
  

          <div className="mb-4">
            <span className="text-gray-600">Category: </span>
            <span className="font-medium">{product.category.name}</span>
          </div>

          <div className="mb-6">
            <h5 className="font-semibold mb-2">Description:</h5>
            <p className="text-gray-600">{product.description}</p>
          </div>

        
<div className="mb-6">
            <h5 className="font-semibold mb-2">Available Sizes:</h5>
            <div className="flex flex-wrap gap-2">
          {getAvailableSizes().map((size) => (
            <button
              key={size}
              className={`px-4 py-2 border rounded-md ${
                selectedSize === size ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
              onClick={() => handleSizeSelect(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {selectedSize && (
        <div className="mb-6">
          <h5 className="font-semibold mb-2">Available Colors:</h5>
          <div className="flex flex-wrap gap-2">
            {getAvailableColors(selectedSize).map((color) => (
              <button
                key={color.id}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color.name ? "border-blue-500" : "border-gray-300"
                }`}
                style={{ backgroundColor: color.hex_code }}
                onClick={() => handleColorSelect(color.name)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}


{selectedVariant && (
            <div className="flex items-center space-x-4 mb-6">
              <button
                className="px-3 py-1 border rounded-md"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                className="px-3 py-1 border rounded-md"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 5}
              >
                +
              </button>
              {quantity === 5 && (
                <span className="text-red-500 text-sm">Maximum 5 items can be selected of the same type.</span>
              )}

              
            </div>
            
          )}


{selectedVariant && (
  <div className="mb-4">
    {!selectedVariant.is_active ? (
      <p className="text-red-500 font-bold">This variant is not available</p>
    ) : selectedVariant.stock_quantity === 0 ? (
      <p className="text-red-500 font-bold">Out of stock</p>
    ) : selectedVariant.stock_quantity <= 2 ? (
      <p className="text-red-500 font-bold">Hurry up! Only {selectedVariant.stock_quantity} item(s) left</p>
    ) : null}
  </div>
)}

          <div className="flex space-x-4">
            <button
              className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex-1"
              onClick={() =>{handleAddToCart()}}
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
            >
              Add to Cart
            </button>
            <button
              className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 flex-1"
              onClick={() =>handleBuyNow()}
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
            >
              Buy Now
            </button>
            {/* <button 
              className="p-3 border rounded-md hover:border-red-500"
              onClick={()=>handleAddToWishlist()}
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
            >
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button> */}
            <WishlistButton 
  variant={selectedVariant}
  onToggle={handleWishlistToggle}
  isInWishlist={isInWishlist}
/>
          </div>
        </div>
        <div className="mt-16">
  <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
  <div className="flex overflow-x-auto space-x-4 py-4 scrollbar-hide">
    {similarProducts.map((similar) => (
      <Link 
        key={similar.id} 
        to={`/user/product/${similar.id}`}
        className="group flex-shrink-0 w-48"
      >
        <div className="border rounded-lg p-4 transition-transform hover:scale-105 shadow-lg">
          <img
            src={similar?.images[0]?.image || 'placeholder.jpg'}
            alt={similar.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h3 className="font-medium text-gray-800 mb-2 truncate">
            {similar.name}
          </h3>
          <div className="flex items-center justify-between">
            {/* <span className="text-green-600 font-bold">₹ ₹{Math.min(...similar.variants.map((v) => v.price))}</span> */}
            <div className="flex flex-col">
                    <span className="text-green-600 font-bold">
                      ₹{(Math.min(...similar.variants.map(v => v.price)) * (1 - (similar.discount_percentage || 0) / 100)).toLocaleString()}
                    </span>
                    {similar.discount_percentage > 0 && (
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-500 line-through">
                          ₹{Math.min(...similar.variants.map(v => v.price)).toLocaleString()}
                        </span>
                        <span className="text-xs text-red-500">
                          ({similar.discount_percentage}% off)
                        </span>
                      </div>
                    )}
                  </div>



            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`w-4 h-4 ${
                    index < Math.round(similar.average_rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>
      </div>
    </div>
  );
};

export default ProductDetail;

