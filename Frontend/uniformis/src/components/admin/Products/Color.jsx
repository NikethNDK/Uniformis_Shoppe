import React, { useState, useEffect } from "react"
import { productApi } from "../../../adminaxiosconfig"
import { FaTrash, FaPlus, FaEdit, FaTimes } from "react-icons/fa"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const ColorManagement = () => {
  const [colors, setColors] = useState([])
  const [newColor, setNewColor] = useState({ name: "", hex_code: "#000000" })
  const [editingColor, setEditingColor] = useState(null)

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    try {
      const response = await productApi.get("/colors/")
      const sortedColors = response.data.sort((a, b) => a.id - b.id)
      setColors(sortedColors)
    } catch (error) {
      console.error("Failed to fetch colors: ", error)
      toast.error("Failed to fetch colors")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingColor) {
        if (
          newColor.name.trim() === editingColor.name &&
          newColor.hex_code === editingColor.hex_code
        ) {
          toast.error("No changes made to the color")
          return
        }
        if (
          colors.some(
            (col) =>
              col.name.toLowerCase() === newColor.name.toLowerCase() &&
              col.id !== editingColor.id
          )
        ) {
          toast.error("A color with this name already exists")
          return
        }
        const response = await productApi.put(`/colors/${editingColor.id}/`, {
          name: newColor.name,
          hex_code: newColor.hex_code,
        })
        setColors(colors.map((col) => (col.id === editingColor.id ? response.data : col)))
        setEditingColor(null)
        toast.success("Color updated successfully")
      } else {
        if (colors.some((col) => col.name.toLowerCase() === newColor.name.toLowerCase())) {
          toast.error("A color with this name already exists")
          return
        }
        const response = await productApi.post("/colors/", newColor)
        setColors([...colors, response.data])
        toast.success("Color added successfully")
      }
      setNewColor({ name: "", hex_code: "#000000" })
    } catch (error) {
      console.error("Failed to add/edit color", error)
      toast.error("Failed to add/edit color")
    }
  }

  const handleDelete = async (colorId) => {
    try {
      await productApi.delete(`/colors/${colorId}/`)
      setColors(colors.filter((col) => col.id !== colorId))
      toast.success("Color deleted successfully")
    } catch (error) {
      console.error("Failed to delete color", error)
      toast.error("Failed to delete color")
    }
  }

  const handleEdit = (color) => {
    setEditingColor(color)
    setNewColor({ name: color.name, hex_code: color.hex_code })
  }

  const handleCancel = () => {
    setEditingColor(null)
    setNewColor({ name: "", hex_code: "#000000" })
  }

  return (
    <div className="ml-[280px] p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Color Management</h1>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hex Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {colors.map((color) => (
                  <tr key={color.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {color.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: color.hex_code }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {color.hex_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleEdit(color)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(color.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newColor.name}
                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                placeholder="Enter color name"
                className="flex-grow border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="color"
                value={newColor.hex_code}
                onChange={(e) => setNewColor({ ...newColor, hex_code: e.target.value })}
                className="w-20 h-10 p-1 border rounded-md"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {editingColor ? (
                  <>
                    <FaEdit className="inline mr-2" /> Update Color
                  </>
                ) : (
                  <>
                    <FaPlus className="inline mr-2" /> Add Color
                  </>
                )}
              </button>
              {editingColor && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <FaTimes className="inline mr-2" /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ColorManagement