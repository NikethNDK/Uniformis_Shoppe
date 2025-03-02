import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation } from "react-router-dom"
import { User, Package, MapPin, Wallet, Camera } from "lucide-react"
import { fetchUserProfile,updateUserProfile  } from "../../../redux/profile/profileSlice"
import { useEffect } from "react"
import { toast } from "react-toastify" 

const UserSidebar = ({ onImageSelect }) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const user  = localStorage.getItem('user')
  const { data: profile } = useSelector((state) => state.profile.basicProfile)

  const menuItems = [
    { icon: User, label: "Profile Information", path: "/user/profile-information" },
    { icon: Package, label: "My Orders", path: "/user/trackorder" },
    { icon: MapPin, label: "Manage Addresses", path: "/user/address" },
    { icon: Wallet, label: "Wallet", path: "/user/wallet" },
  ]
useEffect(() => {
    dispatch(fetchUserProfile())
  }, [dispatch])
  
  const handleImageChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        try {
          await dispatch(updateUserProfile({ profilePicture: file })).unwrap()
          toast.success("Profile picture updated successfully")
        } catch (error) {
          console.error("Error updating profile picture:", error)
          
          toast.error("Failed to update profile picture. Please try again.")
        }
      } else {
        toast.error("Please upload a JPEG image.")
      }
    }
  }

  if (!user) {
    return null // Don't render the sidebar if there's no user data
  }

  return (
    <div className="w-94 min-h-[calc(100vh-4rem)] bg-blend-color-dodge shadow-sm border-r">
      <div className="flex flex-col items-center p-8 border-b">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 relative">
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-full h-full p-6 text-gray-400" />
          )}
          <label
            htmlFor="profile-picture"
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <input
              type="file"
              id="profile-picture"
              className="hidden"
              accept="image/jpeg,image/jpg"
              onChange={handleImageChange}
            />
          </label>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          {user.first_name} {user.last_name}
        </h2>
      </div>

      <nav className="p-5">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-1 py-2 rounded-md transition-colors no-underline ${
                    isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default UserSidebar

