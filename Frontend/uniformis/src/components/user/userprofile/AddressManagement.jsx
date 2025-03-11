// import { useState, useEffect } from "react"
// import { toast } from "react-toastify"
// import axiosInstance from "../../../axiosconfig"

// const AddressManagement = () => {
//   const [addresses, setAddresses] = useState([])
//   const [showForm, setShowForm] = useState(false)
//   const [isEditing, setIsEditing] = useState(false)
//   const [editId, setEditId] = useState(null)
//   const [formData, setFormData] = useState({
//     name: "",
//     house_no: "",
//     city: "",
//     state: "",
//     pin_code: "",
//     address_type: "home",
//     landmark: "",
//     mobile_number: "",
//     alternate_number: "",
//   })

//   // Fetch addresses on component mount
//   useEffect(() => {
//     fetchAddresses()
//   }, [])

//   const fetchAddresses = async () => {
//     try {
//       const response = await axiosInstance.get("/addresses/")
//       setAddresses(response.data)
//     } catch (error) {
//       toast.error("Failed to fetch addresses")
//     }
//   }

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const validateForm = () => {
//     console.log('vali',formData)
//     if (!formData.name) {
//       toast.error("Name is required")
//       return false
//     }
//     if (!formData.house_no) {
//       toast.error("House/Flat No is required")
//       return false
//     }
//     if (!formData.city) {
//       toast.error("City is required")
//       return false
//     }
//     if (!formData.state) {
//       toast.error("State is required")
//       return false
//     }
//     if (!formData.pin_code || !/^\d{6}$/.test(formData.pin_code)) {
//       toast.error("PIN code must be 6 digits")
//       return false
//     }
//     if (!formData.mobile_number || !/^\d{10}$/.test(formData.mobile_number)) {
//       toast.error("Mobile number must be 10 digits")
//       return false
//     }
//     if (formData.alternate_number && !/^\d{10}$/.test(formData.alternate_number)) {
//       toast.error("Alternate number must be 10 digits")
//       return false
//     }
//     return true
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     console.log(formData)
//     // if (!validateForm()) return 
//     console.log('validateForm')
//     try {
//       if (isEditing) {
//         await axiosInstance.put(`/addresses/${editId}/`, formData)
//         toast.success("Address updated successfully")
//       } else {
//         await axiosInstance.post("/addresses/", formData)
//         toast.success("Address added successfully")
//       }

//       fetchAddresses()
//       resetForm()
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Something went wrong")
//     }
//   }

//   const handleEdit = (address) => {
//     setFormData({
//       name: address.name,
//       house_no: address.house_no,
//       city: address.city,
//       state: address.state,
//       pin_code: address.pin_code,
//       address_type: address.address_type,
//       landmark: address.landmark || "",
//       mobile_number: address.mobile_number,
//       alternate_number: address.alternate_number || "",
//     })
//     setEditId(address.id)
//     setIsEditing(true)
//     setShowForm(true)
//   }

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this address?")) {
//       try {
//         await axiosInstance.delete(`/addresses/${id}/`)
//         toast.success("Address deleted successfully")
//         fetchAddresses()
//       } catch (error) {
//         toast.error("Failed to delete address")
//       }
//     }
//   }

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       house_no: "",
//       city: "",
//       state: "",
//       pin_code: "",
//       address_type: "home",
//       landmark: "",
//       mobile_number: "",
//       alternate_number: "",
//     })
//     setIsEditing(false)
//     setEditId(null)
//     setShowForm(false)
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Manage Addresses</h1>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
//         >
//           {showForm ? "Close Form" : "Add New Address"}
//         </button>
//       </div>

//       {showForm && (
//         <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//           <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Address" : "Add New Address"}</h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">House/Flat No</label>
//                 <input
//                   type="text"
//                   name="house_no"
//                   value={formData.house_no}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">City</label>
//                 <input
//                   type="text"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">State</label>
//                 <input
//                   type="text"
//                   name="state"
//                   value={formData.state}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">PIN Code</label>
//                 <input
//                   type="text"
//                   name="pin_code"
//                   value={formData.pin_code}
//                   onChange={handleInputChange}
//                   maxLength={6}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Address Type</label>
//                 <div className="mt-2 space-x-4">
//                   <label className="inline-flex items-center">
//                     <input
//                       type="radio"
//                       name="address_type"
//                       value="home"
//                       checked={formData.address_type === "home"}
//                       onChange={handleInputChange}
//                       className="form-radio text-primary"
//                     />
//                     <span className="ml-2">Home</span>
//                   </label>
//                   <label className="inline-flex items-center">
//                     <input
//                       type="radio"
//                       name="address_type"
//                       value="work"
//                       checked={formData.address_type === "work"}
//                       onChange={handleInputChange}
//                       className="form-radio text-primary"
//                     />
//                     <span className="ml-2">Work</span>
//                   </label>
//                 </div>
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700">Landmark (Optional)</label>
//                 <input
//                   type="text"
//                   name="landmark"
//                   value={formData.landmark}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
//                 <input
//                   type="text"
//                   name="mobile_number"
//                   value={formData.mobile_number}
//                   onChange={handleInputChange}
//                   maxLength={10}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Alternate Number (Optional)</label>
//                 <input
//                   type="text"
//                   name="alternate_number"
//                   value={formData.alternate_number}
//                   onChange={handleInputChange}
//                   maxLength={10}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end gap-4">
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
//                 {isEditing ? "Update Address" : "Add Address"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {addresses.map((address) => (
//           <div key={address.id} className="bg-white p-4 rounded-lg shadow-md">
//             <div className="flex justify-between items-start mb-2">
//               <div>
//                 <h3 className="font-semibold">{address.name}</h3>
//                 <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100">
//                   {address.address_type.charAt(0).toUpperCase() + address.address_type.slice(1)}
//                 </span>
//               </div>
//               <div className="flex gap-2">
//                 <button onClick={() => handleEdit(address)} className="text-blue-600 hover:text-blue-800">
//                   Edit
//                 </button>
//                 <button onClick={() => handleDelete(address.id)} className="text-red-600 hover:text-red-800">
//                   Delete
//                 </button>
//               </div>
//             </div>
//             <div className="space-y-1 text-sm">
//               <p>{address.house_no}</p>
//               <p>{address.landmark}</p>
//               <p>{`${address.city}, ${address.state} - ${address.pin_code}`}</p>
//               <p>Mobile: {address.mobile_number}</p>
//               {address.alternate_number && <p>Alt. Mobile: {address.alternate_number}</p>}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default AddressManagement


import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import axiosInstance from "../../../axiosconfig"

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    house_no: "",
    city: "",
    state: "",
    pin_code: "",
    address_type: "home",
    landmark: "",
    mobile_number: "",
    alternate_number: "",
  })
  const [errors, setErrors] = useState({
    name: "",
    house_no: "",
    city: "",
    state: "",
    pin_code: "",
    mobile_number: "",
    alternate_number: "",
  })

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get("/addresses/")
      setAddresses(response.data)
    } catch (error) {
      toast.error("Failed to fetch addresses")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = () => {
    console.log('vali', formData)
    let newErrors = {}
    let isValid = true

    if (!formData.name) {
      newErrors.name = "Name is required"
      isValid = false
    }
    
    if (!formData.house_no) {
      newErrors.house_no = "House/Flat No is required"
      isValid = false
    }
    
    if (!formData.city) {
      newErrors.city = "City is required"
      isValid = false
    }
    
    if (!formData.state) {
      newErrors.state = "State is required"
      isValid = false
    }
    
    if (!formData.pin_code) {
      newErrors.pin_code = "PIN code is required"
      isValid = false
    } else if (!/^\d{6}$/.test(formData.pin_code)) {
      newErrors.pin_code = "PIN code must be 6 digits"
      isValid = false
    }
    
    if (!formData.mobile_number) {
      newErrors.mobile_number = "Mobile number is required"
      isValid = false
    } else if (!/^\d{10}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = "Mobile number must be 10 digits"
      isValid = false
    }
    
    if (formData.alternate_number && !/^\d{10}$/.test(formData.alternate_number)) {
      newErrors.alternate_number = "Alternate number must be 10 digits"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return 
    
    try {
      if (isEditing) {
        await axiosInstance.put(`/addresses/${editId}/`, formData)
        toast.success("Address updated successfully")
      } else {
        await axiosInstance.post("/addresses/", formData)
        toast.success("Address added successfully")
      }

      fetchAddresses()
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  }

  const handleEdit = (address) => {
    setFormData({
      name: address.name,
      house_no: address.house_no,
      city: address.city,
      state: address.state,
      pin_code: address.pin_code,
      address_type: address.address_type,
      landmark: address.landmark || "",
      mobile_number: address.mobile_number,
      alternate_number: address.alternate_number || "",
    })
    setEditId(address.id)
    setIsEditing(true)
    setShowForm(true)
    // Clear any previous errors
    setErrors({
      name: "",
      house_no: "",
      city: "",
      state: "",
      pin_code: "",
      mobile_number: "",
      alternate_number: "",
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await axiosInstance.delete(`/addresses/${id}/`)
        toast.success("Address deleted successfully")
        fetchAddresses()
      } catch (error) {
        toast.error("Failed to delete address")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      house_no: "",
      city: "",
      state: "",
      pin_code: "",
      address_type: "home",
      landmark: "",
      mobile_number: "",
      alternate_number: "",
    })
    setIsEditing(false)
    setEditId(null)
    setShowForm(false)
    setErrors({
      name: "",
      house_no: "",
      city: "",
      state: "",
      pin_code: "",
      mobile_number: "",
      alternate_number: "",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Addresses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          {showForm ? "Close Form" : "Add New Address"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Address" : "Add New Address"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">House/Flat No</label>
                <input
                  type="text"
                  name="house_no"
                  value={formData.house_no}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border ${errors.house_no ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.house_no && <p className="text-red-500 text-xs mt-1">{errors.house_no}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border ${errors.city ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border ${errors.state ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                <input
                  type="text"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleInputChange}
                  maxLength={6}
                  className={`mt-1 block w-full rounded-md border ${errors.pin_code ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.pin_code && <p className="text-red-500 text-xs mt-1">{errors.pin_code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Type</label>
                <div className="mt-2 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="address_type"
                      value="home"
                      checked={formData.address_type === "home"}
                      onChange={handleInputChange}
                      className="form-radio text-primary"
                    />
                    <span className="ml-2">Home</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="address_type"
                      value="work"
                      checked={formData.address_type === "work"}
                      onChange={handleInputChange}
                      className="form-radio text-primary"
                    />
                    <span className="ml-2">Work</span>
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  maxLength={10}
                  className={`mt-1 block w-full rounded-md border ${errors.mobile_number ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.mobile_number && <p className="text-red-500 text-xs mt-1">{errors.mobile_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Alternate Number (Optional)</label>
                <input
                  type="text"
                  name="alternate_number"
                  value={formData.alternate_number}
                  onChange={handleInputChange}
                  maxLength={10}
                  className={`mt-1 block w-full rounded-md border ${errors.alternate_number ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.alternate_number && <p className="text-red-500 text-xs mt-1">{errors.alternate_number}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                {isEditing ? "Update Address" : "Add Address"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div key={address.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{address.name}</h3>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100">
                  {address.address_type.charAt(0).toUpperCase() + address.address_type.slice(1)}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(address)} className="text-blue-600 hover:text-blue-800">
                  Edit
                </button>
                <button onClick={() => handleDelete(address.id)} className="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p>{address.house_no}</p>
              <p>{address.landmark}</p>
              <p>{`${address.city}, ${address.state} - ${address.pin_code}`}</p>
              <p>Mobile: {address.mobile_number}</p>
              {address.alternate_number && <p>Alt. Mobile: {address.alternate_number}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AddressManagement