import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, removeFromCart, updateCartItemQuantity } from '../../../redux/cart/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CloudFog } from 'lucide-react';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, totalAmount } = useSelector((state) => state.cart);
  const [localQuantities, setLocalQuantities] = useState({});
  const finalTotal = useSelector(state => state.cart.finalTotal);
  console.log("Final",finalTotal)
  
  const loadCart = async () => {
    try {
      await dispatch(fetchCart()).unwrap();
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  useEffect(() => {
    
    loadCart();
  }, [dispatch]);

  // Initialize local quantities when items change  
  useEffect(() => {
    const quantities = {};
    items.forEach(item => {
      quantities[item.id] = item.quantity;
    });
    setLocalQuantities(quantities);
  }, [items]);

  const handleRemoveItem = async (itemId) => {
    try {
      await dispatch(removeFromCart({ item_id: itemId })).unwrap();

      setLocalQuantities(prev => {
        const updatedQuantities = { ...prev };
        delete updatedQuantities[itemId]; // Remove from local state
        return updatedQuantities;
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
    // loadCart()
  };

  const handleQuantityChange = (itemId, newQuantity, stockQuantity) => {
    // Validate quantity limits without making API calls
    if (newQuantity < 1 || newQuantity > 5 || newQuantity > stockQuantity) {
      return;
    }
    
    // Update local state only for smooth UI
    setLocalQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));

    // Dispatch the Redux action to persist the change
    dispatch(updateCartItemQuantity({ item_id: itemId, quantity: newQuantity }));
  };

  const handleProceedToCheckout = async () => {
    // Find items that need quantity updates
    const updates = [];
    let hasErrors = false;

    for (const item of items) {
      const localQty = localQuantities[item.id];
      const stockQty = item.variant.stock_quantity;

      // Validate quantities
      if (localQty > 5) {
        toast.error(`${item.product_name}: Maximum 5 items allowed`);
        hasErrors = true;
        continue;
      }

      if (localQty > stockQty) {
        toast.error(`${item.product_name}: Only ${stockQty} items available in stock`);
        hasErrors = true;
        continue;
      }

      // Add to updates if quantity changed
      if (localQty !== item.quantity) {
        updates.push({
          item_id: item.id,
          quantity: localQty
        });
      }
    }

    if (hasErrors) {
      return;
    }

    // Update quantities in server before checkout
    try {
      for (const update of updates) {
        await dispatch(updateCartItemQuantity(update)).unwrap();
      }
      // Proceed to checkout after all updates are successful
      navigate('/user/checkout');
    } catch (error) {
      toast.error('Failed to update cart. Please try again.');
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
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/user/home" className="text-blue-600 hover:text-blue-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => {
          const variant = item?.variant || {};
          const stockQuantity = variant.stock_quantity || 0;
          const currentQuantity = localQuantities[item.id] || item.quantity;
          const productId = item.product_id;
          console.log("productId",productId)
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
                <p className="text-gray-800">₹{item.final_price || 0}</p>
                <div className="flex items-center mt-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, currentQuantity - 1, stockQuantity)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="mx-2">{currentQuantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, currentQuantity + 1, stockQuantity)}
                    className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    disabled={currentQuantity >= Math.min(5, stockQuantity)}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                {stockQuantity <= 2 && (
                  <p className="text-red-500 text-sm mt-1">
                    Only {stockQuantity} items left in stock!
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <div className="text-xl font-bold">
          Total: ₹{finalTotal || 0}
        </div>
        <Link to='/user/checkout'>
        <button
          onClick={handleProceedToCheckout}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Proceed to Checkout
        </button></Link>
      </div>
    </div>
  );
};

export default CartPage;