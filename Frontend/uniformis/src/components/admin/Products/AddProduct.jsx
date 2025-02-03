import React, { useState, useEffect, useCallback } from "react";
import { productApi } from "../../../adminaxiosconfig";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "../../ui/modal";
import ImageCropper from "./ImageCropper";
import { Trash2 } from "lucide-react";
import Loading from "../../../components/ui/Loading";

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  });
  
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [croppedImages, setCroppedImages] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchSizes();
    fetchColors();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productApi.get("/categories/", {
        params: { active_only: true },
      });
      setCategories(response.data);
    } catch (error) {
      toast.error("Error fetching categories");
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await productApi.get("/size/");
      setSizes(response.data);
    } catch (error) {
      toast.error("Error fetching sizes");
    }
  };

  const fetchColors = async () => {
    try {
      const response = await productApi.get("/colors/");
      setColors(response.data);
    } catch (error) {
      toast.error("Error fetching colors");
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants]
    if (field === "stock_quantity" || field === "price") {
      value = Math.max(0, Number.parseInt(value))
    }
    newVariants[index][field] = value
    setVariants(newVariants)
  }

  const addVariant = () => {
    setVariants([...variants, { size: "", color: "", stock_quantity: "",price:"" }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // const handleImageUpload = useCallback((e) => {
  //   const files = Array.from(e.target.files);
  //   if (files.length === 0) return;
  //   if (croppedImages.length + files.length > 5) {
  //     toast.error("Maximum 5 images allowed");
  //     return;
  //   }
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     setCurrentImage(reader.result);
  //     setCropModalOpen(true);
  //   };
  //   reader.readAsDataURL(files[0]);
  // }, [croppedImages.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    console.log("Variants:", variants);
    console.log("Cropped Images:", croppedImages);

    if (croppedImages.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    if (variants.length === 0) {
      toast.error("Please add at least one variant");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.title);
    // formDataToSend.append("price", formData.price);
    formDataToSend.append("category_id", String(formData.category));
    formDataToSend.append("description", formData.description);

    // Format variants data
    const variantsData = variants.map(variant => ({
      size_id: Number.parseInt(variant.size),
      color_id: Number.parseInt(variant.color),
      stock_quantity: Number.parseInt(variant.stock_quantity),
      price: Number.parseFloat(variant.price).toFixed(2) 
    }));

    console.log("Formatted Variants Data:", variantsData);

    formDataToSend.append("variants_data", JSON.stringify(variantsData));

    croppedImages.forEach((image, index) => {
      formDataToSend.append("images", image, `image-${index}.jpg`);
    });

        // Log the final FormData (need to iterate because FormData is not directly loggable)
        console.log("Final Form data after iterating")
        for (let [key, value] of formDataToSend.entries()) {
          console.log(`${key}:`, value);
      }

    setLoading(true);
    try {
      const response = await productApi.post("/addproduct/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        toast.success("Product added successfully!");
        setTimeout(() => navigate("/admin/products"), 1500);
      }
    } catch (error) {
      console.error("Error Response:", error.response);
      console.error("Error Data:", error.response?.data);
      const errorMessage = error.response?.data?.error || 
                           Object.entries(error.response?.data || {})
                               .map(([key, value]) => `${key}: ${value}`)
                               .join(', ') ||
                           "Error adding product";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (croppedImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentImage(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(files[0]);
  }, [croppedImages.length]);

  const handleCropComplete = useCallback((croppedImage) => {
    setCroppedImages((prev) => [...prev, croppedImage]);
    setCropModalOpen(false);
    setCurrentImage(null);
  }, []);

  const handleRemoveImage = (index) => {
    setCroppedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="ml-64 p-8">
      <ToastContainer position="top-right" />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
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

              {/* <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div> */}

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
                <Button
                  type="button"
                  onClick={addVariant}
                  className="mb-4"
                >
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

              <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Images</label>
          <input
            type="file"
            className="w-full p-2 border rounded"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={croppedImages.length >= 5}
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum 5 images allowed. Images will be cropped to 800x800 pixels.
          </p>

          {croppedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-5 gap-4">
              {croppedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
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
              <Button
                type="submit"
                className="flex-1"
                disabled= {loading}>
               {loading ? "Adding Product..." : "Add Product"}
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
              setCroppedImages((prev) => [...prev, croppedImage]);
              setCropModalOpen(false);
            }}
            onCropCancel={() => setCropModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default AddProduct;