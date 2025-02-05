import { useState, useEffect, useMemo } from "react"
import adminAxiosInstance from "../../../adminaxiosconfig"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ChevronsUpDownIcon as ChevronUpDown, ChevronUp, ChevronDown } from "lucide-react"

const CustomerManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await adminAxiosInstance.get("/admin/dashboard/")
      setUsers(response.data.active_users)
      setLoading(false)
    } catch (err) {
      toast.error("Failed to fetch users")
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId) => {
    try {
      await adminAxiosInstance.post("/admin/dashboard/", { user_id: userId })
      fetchUsers() // Refresh the user list
      toast.success("User status updated successfully")
    } catch (err) {
      toast.error("Failed to update user status")
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedUsers = useMemo(() => {
    if (!sortField) return users

    return [...users].sort((a, b) => {
      if (sortField === "name") {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
        return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortField === "status") {
        return sortDirection === "asc" ? a.is_active - b.is_active : b.is_active - a.is_active
      }
      return 0
    })
  }, [users, sortField, sortDirection])

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUpDown className="inline w-4 h-4" />
    return sortDirection === "asc" ? (
      <ChevronUp className="inline w-4 h-4" />
    ) : (
      <ChevronDown className="inline w-4 h-4" />
    )
  }

  if (loading) return <div className="text-center mt-8">Loading...</div>

  return (
    <div className="p-4 sm:p-6 ml-0 sm:ml-[280px]">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort("name")}>
                Name <SortIcon field="name" />
              </th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort("status")}>
                Status <SortIcon field="status" />
              </th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{`${user.first_name} ${user.last_name}`}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.is_active ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`w-20 px-3 py-1 rounded text-white ${
                      user.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {user.is_active ? "Disable" : "Enable"}
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

