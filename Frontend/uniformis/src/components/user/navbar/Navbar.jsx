import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ShoppingCart, Heart, User, Search } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { clearAuthData, setAuthData } from "../../../redux/auth/authSlice"
import { clearProfile } from "../../../redux/profile/profileSlice"
import logo from "../../../assets/logo.png"

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { data: profile } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))
    if (token && user) {
      dispatch(setAuthData({ user, token }))
    }
  }, [dispatch])

  const handleLogout = () => {
    dispatch(clearAuthData())
    dispatch(clearProfile())
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/user/homepage" className="flex items-center">
            <img src={logo || "/placeholder.svg"} alt="Uniformis Shoppe" className="h-10" />
          </Link>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/wishlist" className="hover:text-primary">
              <Heart className="h-6 w-6" />
            </Link>
            <Link to="/cart" className="hover:text-primary">
              <ShoppingCart className="h-6 w-6" />
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="relative group">
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
                  </button>
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

        <nav className="flex items-center gap-8 py-4">
          <Link to="/about" className="hover:text-primary">
            About
          </Link>
          <Link to="/school-uniform" className="hover:text-primary">
            School Uniform
          </Link>
          <Link to="/hospital-uniform" className="hover:text-primary">
            Hospital Uniform
          </Link>
          <Link to="/industrial-uniform" className="hover:text-primary">
            Industrial Uniform
          </Link>
          <Link to="/corporate-uniform" className="hover:text-primary">
            Corporate Uniform
          </Link>
          <Link to="/offers" className="hover:text-primary">
            Offers
          </Link>
        </nav>
      </div>
    </header>
  )
}

