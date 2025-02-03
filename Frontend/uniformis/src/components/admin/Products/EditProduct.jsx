import { useState, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { fetchProduct, updateProduct } from "../../../redux/product/productSlice"
import { productApi } from "../../../adminaxiosconfig"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Modal } from "../../ui/modal"
import ImageCropper from "./ImageCropper"
import { Trash2 } from "lucide-react"
import Loading from "../../../components/ui/Loading"

const EditProduct = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentProduct } = useSelector((state) => state.products)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  })

  const [categories, setCategories] = useState([])
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [croppedImages, setCroppedImages] = useState([])
  const [currentImages, setCurrentImages] = useState([])

  useEffect(() => {
    dispatch(fetchProduct(id))
    fetchCategories()
    fetchSizes()
    fetchColors()
  }, [id, dispatch])

  useEffect(() => {
    if (currentProduct) {
      setFormData({
        title: currentProduct.name,
        category: currentProduct.category.id,
        description: currentProduct.description,
      })
      setCurrentImages(currentProduct.images || [])

      const productVariants =
        currentProduct.variants?.map((variant) => ({
          size: variant.size.id,
          color: variant.color.id,
          stock_quantity: variant.stock_quantity,
          price: variant.price,
        })) || []
      setVariants(productVariants)
    }
  }, [currentProduct])

  const fetchCategories = async () => {
    try {
      const response = await productApi.get("/categories/", {
        params: { active_only: true },
      })
      setCategories(response.data)
    } catch (error) {
      toast.error("Error fetching categories")
    }
  }

  const fetchSizes = async () => {
    try {
      const response = await productApi.get("/size/")
      setSizes(response.data)
    } catch (error) {
      toast.error("Error fetching sizes")
    }
  }

  const fetchColors = async () => {
    try {
      const response = await productApi.get("/colors/")
      setColors(response.data)
    } catch (error) {
      toast.error("Error fetching colors")
    }
  }

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants]
    if (field === "stock_quantity" || field === "price") {
      value = Math.max(0, Number(value) || 0)
    }
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    }
    setVariants(newVariants)
  }

  const addVariant = () => {
    setVariants([...variants, { size: "", color: "", stock_quantity: "", price: "" }])
  }

  const removeVariant = (index) => {
    if (variants.length === 1) {
      toast.error("At least one variant is required")
      return
    }
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleImageUpload = useCallback(
    (e) => {
      const files = Array.from(e.target.files)
      if (files.length === 0) return
      if (currentImages.length + croppedImages.length + files.length > 5) {
        toast.error("Maximum 5 images allowed")
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setCurrentImage(reader.result)
        setCropModalOpen(true)
      }
      reader.readAsDataURL(files[0])
    },
    [croppedImages.length, currentImages.length],
  )

  const handleImageDelete = async (imageId) => {
    try {
      if (currentImages.length + croppedImages.length <= 1) {
        toast.error("At least one image is required")
        return
      }
      await productApi.delete(`/items/${id}/delete_image/`, { data: { image_id: imageId } })
      setCurrentImages(currentImages.filter((img) => img.id !== imageId))
      toast.success("Image deleted successfully")
    } catch (error) {
      toast.error("Error deleting image")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (currentImages.length + croppedImages.length === 0) {
      toast.error("Please add at least one image")
      return
    }

    if (variants.length === 0) {
      toast.error("Please add at least one variant")
      return
    }

    if (variants.some((v) => !v.size || !v.color || v.stock_quantity < 0 || v.price < 0)) {
      toast.error("Please fill all variant details correctly")
      return
    }

    const formDataToSend = new FormData()
    formDataToSend.append("name", formData.title)
    formDataToSend.append("category_id", formData.category)
    formDataToSend.append("description", formData.description)

    // Format variants data
    const variantsData = variants.map((variant) => ({
      size_id: Number.parseInt(variant.size),
      color_id: Number.parseInt(variant.color),
      stock_quantity: Number.parseInt(variant.stock_quantity),
      price: Number.parseFloat(variant.price).toFixed(2),
    }))
    formDataToSend.append("variants_data", JSON.stringify(variantsData))

    croppedImages.forEach((image, index) => {
      formDataToSend.append("images", image, `image-${index}.jpg`)
    })

    setLoading(true)
    try {
      await dispatch(updateProduct({ id, data: formDataToSend })).unwrap()
      toast.success("Product updated successfully!")
      setTimeout(() => navigate("/admin/products"), 1500)
    } catch (error) {
      console.error("Error updating product:", error)
      const errorMessage = error.response?.data?.error || "Error updating product"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!currentProduct) {
    return <Loading />
  }

  return (
    <div className="ml-64 p-8 sm:p-6 md:p-8 ">
      <ToastContainer position="top-right" />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Product Variants</label>
                  <Button type="button" onClick={addVariant} className="mb-4">
                    Add Variant
                  </Button>

                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div key={index} className="flex gap-4 items-center p-4 border rounded bg-gray-50">
                        <select
                          className="flex-1 p-2 border rounded"
                          value={variant.size}
                          onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                          required
                        >
                          <option value="">Select Size</option>
                          {sizes.map((size) => (
                            <option key={size.id} value={size.id}>
                              {size.name}
                            </option>
                          ))}
                        </select>

                        <select
                          className="flex-1 p-2 border rounded"
                          value={variant.color}
                          onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                          required
                        >
                          <option value="">Select Color</option>
                          {colors.map((color) => (
                            <option key={color.id} value={color.id}>
                              {color.name}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          className="flex-1 p-2 border rounded"
                          value={variant.stock_quantity}
                          onChange={(e) => handleVariantChange(index, "stock_quantity", e.target.value)}
                          min="0"
                          placeholder="Stock"
                          required
                        />
                        <input
                          type="number"
                          className="flex-1 p-2 border rounded"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="Price"
                          required
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeVariant(index)}
                          className="p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Current Images</label>
                  <div className="grid grid-cols-5 gap-4">
                    {currentImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.image || "/placeholder.svg"}
                          alt="Product"
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageDelete(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Add New Images</label>
                  <input
                    type="file"
                    className="w-full p-2 border rounded"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={currentImages.length + croppedImages.length >= 5}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum 5 images allowed. Images will be cropped to 800x800 pixels.
                  </p>

                  {croppedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-5 gap-4">
                      {croppedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCroppedImages(croppedImages.filter((_, i) => i !== index))
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Updating Product..." : "Update Product"}
                </Button>

                <Link to="/admin/products">
                  <Button variant="destructive" className="flex-1">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={cropModalOpen} onClose={() => setCropModalOpen(false)}>
        {currentImage && (
          <ImageCropper
            image={currentImage}
            onCropComplete={(croppedImage) => {
              setCroppedImages((prev) => [...prev, croppedImage])
              setCropModalOpen(false)
              setCurrentImage(null)
            }}
            onCropCancel={() => {
              setCropModalOpen(false)
              setCurrentImage(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default EditProduct

