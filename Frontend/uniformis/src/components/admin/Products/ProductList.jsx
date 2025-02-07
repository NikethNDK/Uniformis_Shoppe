// import React, { useEffect,useState} from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchProducts, updateProductStatus, deleteProduct } from '../../../redux/product/productSlice';
// import { Link } from 'react-router-dom';
// import { toast, ToastContainer } from 'react-toastify';
// import { FaSearch } from "react-icons/fa"
// import 'react-toastify/dist/ReactToastify.css';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// const ProductList = () => {
//   const dispatch = useDispatch();
//   const { items: products, status, error, totalPages, currentPage } = useSelector((state) => state.products)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [updatingId, setUpdatingId] = useState(null);
  
//   useEffect(() => {
//     dispatch(fetchProducts({ page: 1, search: searchTerm }))
//   }, [dispatch, searchTerm])

//   const handleStatusChange = async (id, isActive) => {
//     try {
//       setUpdatingId(id);
//       const result = await dispatch(updateProductStatus({ id, is_active: !isActive })).unwrap()
//       toast.success(`Product ${!isActive ? "enabled" : "disabled"} successfully`)
//     } catch (error) {
//       console.error('Error updating product status:', error);
//       toast.error("Error updating product status")
//     }finally {
//       setUpdatingId(null);
//     }
//   }

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to permanently delete this product?')) {
//       try {
//         await dispatch(deleteProduct(id)).unwrap();
//         toast.success('Product deleted successfully');
//       } catch (error) {
//         toast.error('Error deleting product');
//       }
//     }
//   };

//   const handlePageChange = (page) => {
//     dispatch(fetchProducts({ page, search: searchTerm }))
//   }

//   const handleSearch = (e) => {
//     e.preventDefault()
//     dispatch(fetchProducts({ page: 1, search: searchTerm }))
//   }


//   if (status === 'loading') {
//     return <div>Loading...</div>;
//   }

//   if (status === 'failed') {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className="ml-64 p-8">
//       <ToastContainer position="top-right" />
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Products</h1>
//         <Link to="/admin/products/add" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//           Add New Product
//         </Link>
//       </div>
//       <form onSubmit={handleSearch} className="mb-4">
//         <div className="flex items-center border rounded-md p-2">
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="flex-grow outline-none"
//           />
//           <button type="submit" className="ml-2">
//             <FaSearch className="text-gray-500" />
//           </button>
//         </div>
//       </form>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white">
//           <thead>
//             <tr>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                 Image
//               </th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                 Item Name
//               </th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                 Category
//               </th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                 Variants (Size/Color/Stock/Price)
//               </th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                 Action
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {Array.isArray(products) && products.length > 0 ? (
//               products.map((product) => (
//                 <tr key={product.id}>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <img
//                       src={product.images[0]?.image || "/placeholder.svg"}
//                       alt={product.name}
//                       className="h-10 w-10 rounded-full object-cover"
//                     />
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{product.category.name}</td>
//                   <td className="px-6 py-4">
//                     {product.variants.map((variant) => (
//                       <div key={variant.id} className="mb-2 text-sm flex items-center gap-3">
//                         <span className="font-medium px-2 py-1 bg-gray-100 rounded">{variant.size.name}</span>
//                         <div className="relative">
//                           <span
//                             className="w-6 h-6 rounded-full border-2 border-gray-300 inline-block"
//                             style={{ backgroundColor: variant.color.hex_code }}
//                             title={variant.color.name}
//                           />
//                         </div>
//                         <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded">
//                           {variant.stock_quantity} units
//                         </span>
//                         <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded">₹{variant.price}</span>
//                       </div>
//                     ))}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs ${
//                         product.is_active
//                           ? "bg-green-100 text-green-800 border border-green-300"
//                           : "bg-red-100 text-red-800 border border-red-300"
//                       }`}
//                     >
//                       {product.is_active ? "Enabled" : "Disabled"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center space-x-4">
//                       <button
//                         onClick={() => handleStatusChange(product.id, product.is_active)}
//                         disabled={updatingId === product.id}
//                         className={`px-3 py-1 rounded-md text-white transition-colors ${
//                           product.is_active ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"
//                         }`}
//                       >
//                         {updatingId === product.id 
//                          ? "Updating..." 
//                         : (product.is_active ? "Disable" : "Enable")}
//                         {/* {product.is_active ? "Disable" : "Enable"} */}
//                       </button>
//                       <Link
//                         to={`/admin/products/edit/${product.id}`}
//                         className="text-blue-500 hover:text-blue-700 transition-colors"
//                       >
//                         <PencilIcon className="h-5 w-5" />
//                       </Link>
//                       <button
//                         onClick={() => handleDelete(product.id)}
//                         className="text-red-500 hover:text-red-700 transition-colors"
//                       >
//                         <TrashIcon className="h-5 w-5" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
//                   No products found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       <div className="mt-4 flex justify-center">
//         {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//           <button
//             key={page}
//             onClick={() => handlePageChange(page)}
//             className={`mx-1 px-3 py-1 rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200"}`}
//           >
//             {page}
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default ProductList;

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts, updateProductStatus, deleteProduct } from "../../../redux/product/productSlice"
import { Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import { FaSearch } from "react-icons/fa"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import "react-toastify/dist/ReactToastify.css"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/components/ui/accordion"
import { Badge } from "@/components/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/components/ui/table"

const ProductList = () => {
  const dispatch = useDispatch()
  const { items: products, status, error, totalPages, currentPage } = useSelector((state) => state.products)
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, search: searchTerm }))
  }, [dispatch, searchTerm])

  const handleStatusChange = async (id, isActive) => {
    try {
      setUpdatingId(id)
      const result = await dispatch(updateProductStatus({ id, is_active: !isActive })).unwrap()
      toast.success(`Product ${!isActive ? "enabled" : "disabled"} successfully`)
    } catch (error) {
      console.error("Error updating product status:", error)
      toast.error("Error updating product status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this product?")) {
      try {
        await dispatch(deleteProduct(id)).unwrap()
        toast.success("Product deleted successfully")
      } catch (error) {
        toast.error("Error deleting product")
      }
    }
  }

  const handlePageChange = (page) => {
    dispatch(fetchProducts({ page, search: searchTerm }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(fetchProducts({ page: 1, search: searchTerm }))
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "failed") {
    return <div>Error: {error}</div>
  }

  const groupVariantsBySize = (variants) => {
    return variants.reduce((acc, variant) => {
      if (!acc[variant.size.name]) {
        acc[variant.size.name] = {
          size: variant.size.name,
          variants: [],
          totalStock: 0,
          minPrice: Number.POSITIVE_INFINITY,
          maxPrice: Number.NEGATIVE_INFINITY,
        }
      }
      acc[variant.size.name].variants.push(variant)
      acc[variant.size.name].totalStock += variant.stock_quantity
      acc[variant.size.name].minPrice = Math.min(acc[variant.size.name].minPrice, variant.price)
      acc[variant.size.name].maxPrice = Math.max(acc[variant.size.name].maxPrice, variant.price)
      return acc
    }, {})
  }

  const renderVariants = (variants) => {
    const groupedVariants = groupVariantsBySize(variants)

    return (
      <Accordion type="single" collapsible className="w-full">
        {Object.values(groupedVariants).map((sizeGroup) => (
          <AccordionItem value={sizeGroup.size} key={sizeGroup.size}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-4 w-full">
                <Badge variant="outline" className="text-sm font-semibold">
                  {sizeGroup.size}
                </Badge>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>{sizeGroup.totalStock} units</span>
                  <span>•</span>
                  <span>
                    ₹{sizeGroup.minPrice}
                    {sizeGroup.maxPrice > sizeGroup.minPrice && ` - ₹${sizeGroup.maxPrice}`}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizeGroup.variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: variant.color.hex_code }}
                        />
                        {variant.color.name}
                      </TableCell>
                      <TableCell>{variant.stock_quantity} units</TableCell>
                      <TableCell>₹{variant.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
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
                Variants
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
              products.map((product,index) => (
                <>
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
                  <td className="px-6 py-4">{renderVariants(product.variants)}</td>
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
                        {updatingId === product.id ? "Updating..." : product.is_active ? "Disable" : "Enable"}
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
                {index < products.length - 1 && (
        <tr>
          <td colSpan="6" className="border-b border-gray-400"></td>
        </tr>
      )}
                </>
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
        <hr />
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

export default ProductList


