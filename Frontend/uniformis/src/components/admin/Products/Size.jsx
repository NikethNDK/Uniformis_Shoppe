// import React, { useState, useEffect } from 'react';
// import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
// import { productApi } from "../../../adminaxiosconfig";
// import { ToastContainer, toast } from 'react-toastify';

// const ProductVariants = () => {
//   const [sizes, setSizes] = useState([]);
//   const [newSize, setNewSize] = useState('');
//   const [editingSize, setEditingSize] = useState(null);

//   useEffect(() => {
//     fetchSizes();
//   }, []);

//   const fetchSizes = async () => {
//     try {
//       const response = await productApi.get('/product-variants/');
//       setSizes(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch sizes');
//     }
//   };

//   const handleEdit = (size) => {
//     setEditingSize(size);
//     setNewSize(size.variant);
//   };

//   const handleDelete = async (sizeId) => {
//     try {
//       await productApi.delete(`/product-variants/${sizeId}/`);
//       toast.success('Size deleted successfully');
//       fetchSizes();
//     } catch (error) {
//       toast.error('Failed to delete size');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingSize) {
//         await productApi.put(`/product-variants/${editingSize.id}/`, { variant: newSize });
//         toast.success('Size updated successfully');
//       } else {
//         await productApi.post('/product-variants/', { variant: newSize });
//         toast.success('Size added successfully');
//       }
//       setNewSize('');
//       setEditingSize(null);
//       fetchSizes();
//     } catch (error) {
//       toast.error('Failed to save size');
//     }
//   };

//   return (
//     <div className="ml-64 px-6 bg-gray-100 min-h-screen py-6">
//       <ToastContainer />
      
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow mb-6 p-6">
//         <h1 className="text-2xl font-bold text-gray-800">Size Management</h1>
//       </div>

//       {/* Sizes Table */}
//       <div className="bg-white rounded-lg shadow mb-6">
//         <div className="p-6">
//           <h2 className="text-xl font-bold mb-4">Available Sizes</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead>
//                 <tr>
//                   <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
//                   <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {sizes.map((size) => (
//                   <tr key={size.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{size.variant}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => handleEdit(size)}
//                         className="text-blue-600 hover:text-blue-900 mr-4"
//                       >
//                         <FaEdit className="inline-block" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(size.id)}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         <FaTrash className="inline-block" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Add/Edit Form */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="p-6">
//           <h2 className="text-xl font-bold mb-4">
//             {editingSize ? 'Edit Size' : 'Add New Size'}
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
//               <input
//                 type="text"
//                 value={newSize}
//                 onChange={(e) => setNewSize(e.target.value)}
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter size (e.g., S, M, L, XL)"
//                 required
//               />
//             </div>
//             <div className="flex justify-end mt-4">
//               {editingSize && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setEditingSize(null);
//                     setNewSize('');
//                   }}
//                   className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
//                 >
//                   Cancel
//                 </button>
//               )}
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
//               >
//                 <FaPlus /> {editingSize ? 'Update Size' : 'Add Size'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductVariants;
import React, { useState, useEffect } from 'react';
import { productApi } from '../../../adminaxiosconfig';
import { FaTrash, FaPlus } from 'react-icons/fa';

const SizeManagement = () => {
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState('');

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    try {
      const response = await productApi.get('/size/');
      setSizes(response.data);
    } catch (error) {
      console.error('Failed to fetch sizes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productApi.post('/size/', { name: newSize });
      setNewSize('');
      fetchSizes();
    } catch (error) {
      console.error('Failed to add size:', error);
    }
  };

  const handleDelete = async (sizeId) => {
    try {
      await productApi.delete(`/size/${sizeId}/`);
      fetchSizes();
    } catch (error) {
      console.error('Failed to delete size:', error);
    }
  };

  return (
    <div className="ml-[280px] p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Size Management</h1>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sizes.map((size) => (
                  <tr key={size.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {size.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDelete(size.id)}
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

          <form onSubmit={handleSubmit} className="mt-6 flex items-center">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Enter new size"
              className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FaPlus className="inline mr-2" /> Add Size
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SizeManagement;

