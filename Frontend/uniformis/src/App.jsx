import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./components/user/login/Login"
import Signup from "./components/user/signup/Signup.jsx"
import AdminLayout from "./pages/admin/AdminLayout.jsx"
import AdminLogin from "./components/admin/AdminLogin"
import AdminDashboard from "./components/admin/Dashboard/AdminDashboard.jsx"
import ProductList from "./components/admin/Products/ProductList.jsx"
import AddProduct from "./components/admin/Products/AddProduct.jsx"
import UserProfile from "./components/user/navbar/UserProfile.jsx"
import CreateUserPage from "./components/admin/CreateUserPage.jsx"
import AdminRedirect from "./components/defaultadmin/defaultadmin.jsx"
import AdminEditUser from "./components/admin/AdminEditUser.jsx"
import SizeManagement from "./components/admin/Products/Size.jsx";
import CategoryManagement from "./components/admin/Products/Category.jsx";
import EditProduct from "./components/admin/Products/EditProduct.jsx";
import CustomerManagement from "./components/admin/CustomerManagement/CustomerManagement.jsx";
import UserLayout from "./pages/user/UserLayout.jsx";
import ProductDisplay from "./components/user/productCard/ProductDisplay.jsx";
import ProductDetail from "./components/user/productCard/ProductDetail.jsx";
import ColorManagement from "./components/admin/Products/Color.jsx";
import ProfileInformation from "./components/user/userprofile/ProfileInformation.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';
import AddressManagement from "./components/user/userprofile/AddressManagement.jsx";
import CartPage from "./components/user/order/Cart.jsx";
import CheckoutPage from "./components/user/order/CheckOut.jsx";
import TrackOrder from "./components/user/order/TrackOrder.jsx";
import AdminOrderManagement from "./components/admin/OrderManagement/OrderManagement.jsx";
import HomePage from "./pages/user/Home.jsx";
function App() {
  return (
    <>
    <ToastContainer />
    <BrowserRouter>
      <Routes>
        {/* Admin routes  */}
        <Route path="/admin" element={<AdminLayout/>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="customerManagement" element={<CustomerManagement/>}/>
          <Route path="size" element={<SizeManagement/>}/>
          <Route path='category' element={<CategoryManagement/>}/>
          <Route path='color' element={<ColorManagement/>}/>
          <Route path='ordermanagement' element={<AdminOrderManagement/>}/>
        </Route>
        <Route path="/admin/editUser" element={<AdminEditUser />} />
        
        <Route path="/admin/create-user" element={<CreateUserPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* User routes */}
        <Route path='/user' element={<UserLayout/>}>
          <Route path="homepage" element={<ProductDisplay />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="profile-information" element={<ProfileInformation />}/>
          <Route path="address" element={<AddressManagement />} />
          <Route path='add-to-cart' element={<CartPage/>}/>
          <Route path='checkout' element={<CheckoutPage/>}/>
          <Route path='trackorder' element={<TrackOrder/>}/>
          <Route path="home" element={<HomePage />} />
        </Route>

        <Route path="/user-profile" element={<UserProfile />} />
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        
        <Route path="/defaultadmin" element={<AdminRedirect />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;