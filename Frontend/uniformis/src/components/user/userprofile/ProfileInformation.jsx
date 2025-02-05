import { useState,useEffect } from "react"
import { useSelector,useDispatch } from "react-redux"
import { Calendar } from "lucide-react"
import {toast,ToastContainer} from "react-toastify"
import { updateUserProfileDetails,fetchUserProfileDetails } from "../../../redux/profile/profileSlice"


export default function ProfileInformation() {
  const dispatch=useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { data:profile,isLoading, error } = useSelector((state) => state.profile)
  
 
  const [formData, setFormData] = useState({
    first_name:"",
    last_name: "",
    email:"",
    phone_number:"",
    date_of_birth:"", 
  })
  const [errors, setErrors] = useState({})


  useEffect(() => {
    dispatch(fetchUserProfileDetails())
  }, [dispatch])


  useEffect(() => {
    if (user && profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        date_of_birth: profile.date_of_birth || "",
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
    // Clear the error for this field when the user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }))
  }


  const validateForm = () => {
    const newErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required"
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone_number.trim()) newErrors.phone_number = "Phone number is required"
    else if (!/^\d{10}$/.test(formData.phone_number)) newErrors.phone_number = "Phone number must be 10 digits"
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        await dispatch(updateUserProfileDetails(formData)).unwrap()
        toast.success("Profile updated successfully")
      } catch (err) {
        toast.error(err.message || "Failed to update profile")
      }
    } else {
      toast.error("Please correct the errors in the form")
    }
  }

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Your Details</h1>
          <p className="text-gray-500 mb-6">Personal Information</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.first_name ? "border-red-500" : ""
                  }`}
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.last_name ? "border-red-500" : ""
                  }`}
                />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>

              <div className="relative">
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.date_of_birth ? "border-red-500" : ""
                    }`}
                  />
                  
                </div>
                {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.phone_number ? "border-red-500" : ""
                  }`}
                />
                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
           
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

