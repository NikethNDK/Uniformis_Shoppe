import React, { useEffect,useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, updateProductStatus, deleteProduct } from '../../../redux/product/productSlice';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { FaSearch } from "react-icons/fa"
import 'react-toastify/dist/ReactToastify.css';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ProductList = () => {
  const dispatch = useDispatch();
  const { items: products, status, error, totalPages, currentPage } = useSelector((state) => state.products)
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingId, setUpdatingId] = useState(null);
  
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, search: searchTerm }))
  }, [dispatch, searchTerm])

  const handleStatusChange = async (id, isActive) => {
    try {
      setUpdatingId(id);
      const result = await dispatch(updateProductStatus({ id, is_active: !isActive })).unwrap()
      toast.success(`Product ${!isActive ? "enabled" : "disabled"} successfully`)
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error("Error updating product status")
    }finally {
      setUpdatingId(null);
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Error deleting product');
      }
    }
  };

  const handlePageChange = (page) => {
    dispatch(fetchProducts({ page, search: searchTerm }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(fetchProducts({ page: 1, search: searchTerm }))
  }


  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="ml-64 p-8">
      <ToastContainer position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/add" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Product
        </Link>
      </div>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex items-center border rounded-md p-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow outline-none"
          />
          <button type="submit" className="ml-2">
            <FaSearch className="text-gray-500" />
          </button>
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Variants (Size/Color/Stock/Price)
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={product.images[0]?.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.category.name}</td>
                  <td className="px-6 py-4">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="mb-2 text-sm flex items-center gap-3">
                        <span className="font-medium px-2 py-1 bg-gray-100 rounded">{variant.size.name}</span>
                        <div className="relative">
                          <span
                            className="w-6 h-6 rounded-full border-2 border-gray-300 inline-block"
                            style={{ backgroundColor: variant.color.hex_code }}
                            title={variant.color.name}
                          />
                        </div>
                        <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {variant.stock_quantity} units
                        </span>
                        <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded">₹{variant.price}</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        product.is_active
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {product.is_active ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleStatusChange(product.id, product.is_active)}
                        disabled={updatingId === product.id}
                        className={`px-3 py-1 rounded-md text-white transition-colors ${
                          product.is_active ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {updatingId === product.id 
                         ? "Updating..." 
                        : (product.is_active ? "Disable" : "Enable")}
                        {/* {product.is_active ? "Disable" : "Enable"} */}
                      </button>
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`mx-1 px-3 py-1 rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductList;



 {/* <tbody>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={product.images[0]?.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{product.price}</td>
                  <td className="px-6 py-4">
                    {product.variants.map(variant => (
                      <div 
                        key={variant.id} 
                        className="mb-1 text-sm flex items-center gap-2"
                      >
                        <span className="font-medium">{variant.size.name}</span>
                        <span 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: variant.color.hex_code }}
                          title={variant.color.name}
                        />
                        <span className="text-gray-600">
                          ({variant.stock_quantity} units)
                        </span>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.is_active ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                      }`}
                    >
                      {product.is_active ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleStatusChange(product.id, product.is_active)}
                        className={`px-2 py-1 rounded ${
                          product.is_active ? "bg-yellow-500 text-white" : "bg-blue-500 text-white"
                        }`}
                      >
                        {product.is_active ? "Disable" : "Enable"}
                      </button>
                      <Link to={`/admin/products/edit/${product.id}`}>
                        <PencilIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
                      </Link>
                      <button onClick={() => handleDelete(product.id)}>
                        <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center">
                  No products found
                </td>
              </tr>
            )}
          </tbody> */}

