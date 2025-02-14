import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import profileReducer from './profile/profileSlice'
import productReducer from './product/productSlice'
import userProductReducer from './product/userProductSlice'
import cartReducer from './cart/cartSlice'
import orderReducer from './order/orderSlice'
import wishListReducer from './Wishlist/wishlistSlice'


const store = configureStore({
    reducer:{
        auth: authReducer,
        profile:profileReducer,
        products: productReducer,
        userProducts: userProductReducer,
        cart: cartReducer,
        order: orderReducer,
        wishlist:wishListReducer,
    }
})

export default store;