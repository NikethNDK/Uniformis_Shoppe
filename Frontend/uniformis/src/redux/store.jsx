import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import profileReducer from './profile/profileSlice'
import productReducer from './product/productSlice'
import userProductReducer from './product/userProductSlice'
const store = configureStore({
    reducer:{
        auth: authReducer,
        profile:profileReducer,
        products: productReducer,
        userProducts: userProductReducer
    }
})

export default store;