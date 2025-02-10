// import { useState, useEffect } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { ShoppingCart, Heart, User, Search } from "lucide-react"
// import { useSelector, useDispatch } from "react-redux"
// import { clearAuthData, setAuthData } from "../../../redux/auth/authSlice"
// import { clearProfile } from "../../../redux/profile/profileSlice"
// import logo from "../../../assets/logo.png"
// import { fetchUserProfile  } from "../../../redux/profile/profileSlice"
// import { fetchCart } from "../../../redux/cart/cartSlice"

// export default function Navbar() {
//   const [searchQuery, setSearchQuery] = useState("")
//   const { isAuthenticated, user } = useSelector((state) => state.auth)
//   const { data: profile } = useSelector((state) => state.profile.basicProfile)
//   const { itemCount } = useSelector((state) => state.cart)
//   const dispatch = useDispatch()
//   const navigate = useNavigate()

//   useEffect(() => {
//     const token = localStorage.getItem("token")
//     const user = JSON.parse(localStorage.getItem("user"))
//     if (token && user) {
//       dispatch(setAuthData({ user, token }))
//     }
//   }, [dispatch])

//   useEffect(() => {
//     if (isAuthenticated) {
//       dispatch(fetchUserProfile())
//       dispatch(fetchCart())
//     }
//   }, [dispatch, isAuthenticated])

//   const handleLogout = () => {
//     dispatch(clearAuthData())
//     dispatch(clearProfile())
//     navigate('/login')
//     localStorage.removeItem("token")
//     localStorage.removeItem("user")
    
//   }

//   return (
//     <header className="w-full bg-white shadow-sm">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           <Link to="/user/homepage" className="flex items-center">
//             <img src={logo || "/placeholder.svg"} alt="Uniformis Shoppe" className="h-10" />
//           </Link>

//           <div className="flex-1 max-w-xl mx-8">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search"
//                 className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               <button className="absolute right-3 top-1/2 -translate-y-1/2">
//                 <Search className="h-5 w-5 text-gray-400" />
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center gap-6">
//             <Link to="/wishlist" className="hover:text-primary">
//               <Heart className="h-6 w-6" />
//             </Link>
//             <Link to="/user/add-to-cart" className="hover:text-primary relative">
//               <ShoppingCart className="h-6 w-6" />
//               {itemCount > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                 {itemCount}
//               </span>
//             )}
//             </Link>
//             {isAuthenticated ? (
//               <div className="flex items-center gap-4">
//                 <div className="relative group">
//                 <Link to={`/user/profile-information`}>
//                   <button className="flex items-center gap-2">
                    
//                     {profile?.profile_picture ? (
//                       <img
//                         src={profile.profile_picture || "/placeholder.svg"}
//                         alt={user?.username}
//                         className="h-8 w-8 rounded-full"
//                       />
//                     ) : (
//                       <User className="h-6 w-6" />
//                     )}
//                     <span>{user?.username}</span>
//                   </button></Link>
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible">
//                     <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
//                       Profile
//                     </Link>
//                     <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
//                       Orders
//                     </Link>
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
//                 >
//                   Logout
//                 </button>
//               </div>
//             ) : (
//               <Link to="/login" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
//                 Login
//               </Link>
//             )}
//           </div>
//         </div>

//         <nav className="flex items-center gap-8 py-4">
//           <Link to="/about" className="hover:text-primary">
//             About
//           </Link>
//           <Link to="/school-uniform" className="hover:text-primary">
//             School Uniform
//           </Link>
//           <Link to="/hospital-uniform" className="hover:text-primary">
//             Hospital Uniform
//           </Link>
//           <Link to="/industrial-uniform" className="hover:text-primary">
//             Industrial Uniform
//           </Link>
//           <Link to="/corporate-uniform" className="hover:text-primary">
//             Corporate Uniform
//           </Link>
//           <Link to="/offers" className="hover:text-primary">
//             Offers
//           </Link>
//         </nav>
//       </div>
//     </header>
//   )
// }

// New update

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Heart, User, Search } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { clearAuthData } from "../../../redux/auth/authSlice"
import { clearProfile } from "../../../redux/profile/profileSlice"
import { fetchProducts, fetchMoreProducts } from "../../../redux/product/userProductSlice"
import logo from "../../../assets/logo.png"
import { fetchCart } from "../../../redux/cart/cartSlice"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { data: profile } = useSelector((state) => state.profile.basicProfile)
  const { itemCount } = useSelector((state) => state.cart)
  const { categories } = useSelector((state) => state.userProducts)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCart())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(clearAuthData())
    dispatch(clearProfile())
    navigate("/login")
  }

  // const { products, categories, loading, error, nextPage } = useSelector((state) => state.userProducts)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/user/homepage" className="flex items-center space-x-2">
            <img src={logo || "/placeholder.svg"} alt="Uniformis Shoppe" className="h-12 w-auto" />
            {/* <span className="text-xl font-bold">Uniformis</span> */}
          </Link>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/wishlist"
              className="inline-flex items-center justify-center rounded-md h-10 w-10 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              to="/user/add-to-cart"
              className="inline-flex items-center justify-center rounded-md h-10 w-10 text-sm font-medium hover:bg-accent hover:text-accent-foreground relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                >
                  {itemCount}
                </Badge>
              )}
            </Link>


              
{/* 
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10">
                    {profile?.profile_picture ? (
                      <img
                        src={profile.profile_picture || "/placeholder.svg"}
                        alt={user?.username}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.username && <p className="font-medium">{user.username}</p>}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/user/profile-information">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/user/trackorder">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/user/address">Addresses</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            )} */}



{isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="relative group">
                <Link to={`/user/profile-information`}>
                  <button className="flex items-center gap-2">
                    
                    {profile?.profile_picture ? (
                      <img
                        src={profile.profile_picture || "/placeholder.svg"}
                        alt={user?.username}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    <span>{user?.username}</span>
                  </button></Link>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
                      Orders
                    </Link>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Login
              </Link>
            )}
        





          </div>
        </div>

        <nav className="flex items-center gap-6 pb-4">
          <Link to="/user/home" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

