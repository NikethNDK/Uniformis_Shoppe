import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, Search } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { clearAuthData } from "../../../redux/auth/authSlice";
import { clearProfile } from "../../../redux/profile/profileSlice";
import { fetchProducts } from "../../../redux/product/userProductSlice";
import logo from "../../../assets/logo.png";
import { fetchCart } from "../../../redux/cart/cartSlice";
import { fetchWishlist } from "../../../redux/Wishlist/wishlistSlice";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  const user  = localStorage.getItem('user');
  const isAuthenticated= localStorage.getItem('isAuthenticated');
  // const { isAuthenticated, user } = useSelector((state) => state.auth);


  const { data: profile } = useSelector((state) => state.profile.basicProfile);
  const { itemCount } = useSelector((state) => state.cart);
  const { categories } = useSelector((state) => state.userProducts);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  console.log("To check the authetication after refresh in the navbar is Authenticted",isAuthenticated)
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCart());  
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(clearAuthData());
    dispatch(clearProfile());
    localStorage.clear()
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/user/homepage" className="flex items-center space-x-2">
            <img src={logo || "/placeholder.svg"} alt="Uniformis Shoppe" className="h-12 w-auto" />
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
              to="/user/wishlist"
              className="inline-flex items-center justify-center rounded-md h-10 w-10 text-sm font-medium hover:bg-accent hover:text-accent-foreground relative"
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                >
                  {wishlistItems.length}
                </Badge>
              )}
            </Link>

            <Link
              to="/user/add-to-cart"
              className="inline-flex items-center justify-center rounded-md h-10 w-10 text-sm font-medium hover:bg-accent hover:text-accent-foreground relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                >
                  {itemCount}
                </Badge>
              )}
            </Link>

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
                    </button>
                  </Link>
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

        <nav className="flex items-center justify-center gap-6 pb-4">
          <Link to="/user/home" className="text-sm font-medium transition-colors hover:text-primary no-underline">
            Home
          </Link>
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/user/category/${category.id}`}
              className="text-sm font-medium transition-colors hover:text-primary no-underline"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}