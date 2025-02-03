import React, { useState, useEffect } from "react"
import adminAxiosInstance from "../../../adminaxiosconfig"

const CustomerManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await adminAxiosInstance.get("/admin/dashboard/")
      setUsers(response.data.active_users)
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch users")
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId) => {
    try {
      await adminAxiosInstance.post("/admin/dashboard/", { user_id: userId })
      fetchUsers() // Refresh the user list
    } catch (err) {
      setError("Failed to update user status")
    }
  }

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/admin/deleteUser/${userId}/`)
        fetchUsers() // Refresh the user list
      } catch (err) {
        setError("Failed to delete user")
      }
    }
  }

  if (loading) return <div className="text-center mt-8">Loading...</div>
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>

  return (
    <div className="p-6 ml-[280px]">
      {" "}
      {/* Added left margin to account for sidebar */}
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{`${user.first_name} ${user.last_name}`}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${user.is_active ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`mr-2 px-3 py-1 rounded text-white ${user.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                  >
                    {user.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CustomerManagement

// import React, { useState, useEffect } from "react"
// import adminAxiosInstance from "../../../adminaxiosconfig"
// import Modal from "react-modal"

// // Initialize react-modal
// Modal.setAppElement("#root") // Replace '#root' with your app's root element ID

// const CustomerManagement = () => {
//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [modalIsOpen, setModalIsOpen] = useState(false)
//   const [userToDelete, setUserToDelete] = useState(null)

//   useEffect(() => {
//     fetchUsers()
//   }, [])

//   const fetchUsers = async () => {
//     try {
//       const response = await adminAxiosInstance.get("/admin/dashboard/")
//       setUsers(response.data.active_users)
//       setLoading(false)
//     } catch (err) {
//       setError("Failed to fetch users")
//       setLoading(false)
//     }
//   }

//   const toggleUserStatus = async (userId) => {
//     try {
//       await adminAxiosInstance.post("/admin/dashboard/", { user_id: userId })
//       fetchUsers() // Refresh the user list
//     } catch (err) {
//       setError("Failed to update user status")
//     }
//   }

//   const openDeleteModal = (user) => {
//     setUserToDelete(user)
//     setModalIsOpen(true)
//   }

//   const closeDeleteModal = () => {
//     setUserToDelete(null)
//     setModalIsOpen(false)
//   }

//   const confirmDelete = async () => {
//     if (userToDelete) {
//       try {
//         await adminAxiosInstance.delete(`/admin/deleteUser/${userToDelete.id}/`)
//         fetchUsers() // Refresh the user list
//         closeDeleteModal()
//       } catch (err) {
//         setError("Failed to delete user")
//       }
//     }
//   }

//   if (loading) return <div className="text-center mt-8">Loading...</div>
//   if (error) return <div className="text-center mt-8 text-red-500">{error}</div>

//   return (
//     <div className="p-6 ml-[280px]">
//       {" "}
//       {/* Added left margin to account for sidebar */}
//       <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="py-3 px-4 text-left">Name</th>
//               <th className="py-3 px-4 text-left">Email</th>
//               <th className="py-3 px-4 text-left">Status</th>
//               <th className="py-3 px-4 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((user) => (
//               <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
//                 <td className="py-3 px-4">{`${user.first_name} ${user.last_name}`}</td>
//                 <td className="py-3 px-4">{user.email}</td>
//                 <td className="py-3 px-4">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs ${user.is_active ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
//                   >
//                     {user.is_active ? "Active" : "Inactive"}
//                   </span>
//                 </td>
//                 <td className="py-3 px-4">
//                   <button
//                     onClick={() => toggleUserStatus(user.id)}
//                     className={`mr-2 px-3 py-1 rounded text-white ${user.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
//                   >
//                     {user.is_active ? "Disable" : "Enable"}
//                   </button>
//                   <button
//                     onClick={() => openDeleteModal(user)}
//                     className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <Modal
//         isOpen={modalIsOpen}
//         onRequestClose={closeDeleteModal}
//         contentLabel="Delete User Confirmation"
//         className="modal"
//         overlayClassName="overlay"
//       >
//         <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto mt-20">
//           <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
//           <p className="mb-6">
//             Are you sure you want to delete the user: {userToDelete?.first_name} {userToDelete?.last_name}?
//           </p>
//           <div className="flex justify-end space-x-4">
//             <button
//               onClick={closeDeleteModal}
//               className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
//             >
//               Cancel
//             </button>
//             <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
//               Delete
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   )
// }

// export default CustomerManagement

