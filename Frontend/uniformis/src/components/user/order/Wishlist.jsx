import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CloudFog } from 'lucide-react';
import { addToCart } from '../../../redux/cart/cartSlice';
import { 
  fetchWishlist,
  removeFromWishlist,
  updateWishlistItemQuantity,
  addToWishlist 
} from '../../../redux/Wishlist/wishlistSlice';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, totalAmount } = useSelector((state) => state.wishlist);
  const [localQuantities, setLocalQuantities] = useState({});
  const finalTotal = useSelector(state => state.wishlist.finalTotal);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        await dispatch(fetchWishlist()).unwrap();
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    };
    loadWishlist();
  }, [dispatch]);

  useEffect(() => {
    const quantities = {};
    items.forEach(item => {
      quantities[item.id] = item.quantity;
    });
    setLocalQuantities(quantities);
  }, [items]);

  const handleRemoveItem = async (itemId) => {
    try {
      // Optimistically update the UI
      const updatedItems = items.filter(item => item.id !== itemId);
      dispatch({
        type: 'wishlist/setItems',
        payload: updatedItems
      });

      // Make the API call
      await dispatch(removeFromWishlist({ item_id: itemId })).unwrap();
      toast.success('Item removed from wishlist');
    } catch (error) {
      // Revert the optimistic update if the API call fails
      dispatch(fetchWishlist());
      toast.error('Failed to remove item');
      console.error('Failed to remove item:', error);
    }
  };

  const handleQuantityChange = (itemId, newQuantity, stockQuantity) => {
    if (newQuantity < 1 || newQuantity > 5 || newQuantity > stockQuantity) {
      return;
    }
    
    setLocalQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  const handleMoveToCart = async (item) => {
    try {
      if (!item.variant?.stock_quantity || item.variant.stock_quantity === 0) {
        toast.error('This item is out of stock');
        return;
      }

      // Add to cart
      await dispatch(addToCart({
        variant_id: item.variant.id,
        quantity: localQuantities[item.id] || 1
      })).unwrap();

      // Remove from wishlist
      
      await dispatch(removeFromWishlist({ item_id: item.id })).unwrap();
      
      toast.success('Item moved to cart successfully');
    } catch (error) {
      toast.error('Failed to move item to cart');
      console.error('Failed to move item to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Your Wishlist is empty</h2>
        <Link to="/user/homepage" className="text-blue-600 hover:text-blue-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Wishlist</h1>
      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => {
          const variant = item?.variant || {};
          const stockQuantity = variant.stock_quantity || 0;
          const currentQuantity = localQuantities[item.id] || item.quantity;
          const productId = item.product_id;
          const isOutOfStock = stockQuantity === 0;
          
          // Calculate single item price
          const singleItemPrice = item.final_price ? (item.final_price / item.quantity) : 0;

          return (
            <div key={item.id} className="flex border p-4 rounded-lg shadow-sm">
              <div className="w-24 h-24">
                <Link to={`/user/product/${productId}`} className="transition-transform duration-300 hover:scale-105 block">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      No Image
                    </div>
                  )}
                </Link>
              </div>
              <div className="flex-1 ml-4">
                <h3 className="font-semibold">{item.product_name}</h3>
                <p className="text-gray-600">
                  {variant.size?.name}, {variant.color?.name}
                </p>
                <p className="text-gray-800">₹{singleItemPrice.toFixed(2)} each</p>
                <div className="flex items-center mt-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, currentQuantity - 1, stockQuantity)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentQuantity <= 1 || isOutOfStock}
                  >
                    -
                  </button>
                  <span className="mx-2">{currentQuantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, currentQuantity + 1, stockQuantity)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentQuantity >= Math.min(5, stockQuantity) || isOutOfStock}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                  
                  <button 
                    onClick={() => handleMoveToCart(item)}
                    className={`ml-4 px-4 py-1 rounded ${
                      isOutOfStock 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                </div>
                {stockQuantity > 0 && stockQuantity <= 2 && (
                  <p className="text-red-500 text-sm mt-1">
                    Only {stockQuantity} items left in stock!
                  </p>
                )}
                {isOutOfStock && (
                  <p className="text-red-500 text-sm mt-1">
                    This item is currently out of stock
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <Link to='/user/add-to-cart'>
          <button className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex-1">
            Proceed to Cart
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;