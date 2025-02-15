// import React, { useState, useEffect } from 'react';
// import { Search, Filter, ChevronDown } from 'lucide-react';

// const BannerManagement = () => {
//   const [banners, setBanners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [selectedBanner, setSelectedBanner] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // Form state
//   const [newBanner, setNewBanner] = useState({
//     name: '',
//     startingDate: '',
//     endingDate: '',
//     status: 'active',
//     image: null
//   });

//   useEffect(() => {
//     fetchBanners();
//   }, [page, filterStatus, searchQuery]);

//   const fetchBanners = async () => {
//     try {
//       const response = await fetch(
//         `/api/banners?page=${page}&status=${filterStatus}&search=${searchQuery}`
//       );
//       if (!response.ok) throw new Error('Failed to fetch banners');
//       const data = await response.json();
//       setBanners(data.banners);
//       setTotalPages(data.totalPages);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setNewBanner({
//         ...newBanner,
//         image: file
//       });
      
//       // Create preview URL
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     const formData = new FormData();
//     Object.keys(newBanner).forEach(key => {
//       formData.append(key, newBanner[key]);
//     });

//     try {
//       const response = await fetch('/api/banners', {
//         method: selectedBanner ? 'PUT' : 'POST',
//         body: formData
//       });
      
//       if (!response.ok) throw new Error(selectedBanner ? 'Failed to update banner' : 'Failed to add banner');
      
//       await fetchBanners();
//       resetForm();
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const resetForm = () => {
//     setNewBanner({
//       name: '',
//       startingDate: '',
//       endingDate: '',
//       status: 'active',
//       image: null
//     });
//     setPreviewImage(null);
//     setSelectedBanner(null);
//   };

//   const handleEdit = (banner) => {
//     setSelectedBanner(banner);
//     setNewBanner({
//       name: banner.name,
//       startingDate: banner.startingDate,
//       endingDate: banner.endingDate,
//       status: banner.status,
//       image: null
//     });
//     setPreviewImage(banner.imageUrl);
//   };

//   const handleDelete = async (bannerId) => {
//     if (window.confirm('Are you sure you want to delete this banner?')) {
//       try {
//         const response = await fetch(`/api/banners/${bannerId}`, {
//           method: 'DELETE'
//         });
        
//         if (!response.ok) throw new Error('Failed to delete banner');
        
//         await fetchBanners();
//       } catch (err) {
//         setError(err.message);
//       }
//     }
//   };

//   if (loading) return <div className="content">Loading...</div>;

//   return (
//     <div className="content bg-gray-50">
//       <div className="mb-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Banner Management</h1>
//           <button 
//             onClick={() => window.location.href = '/logout'}
//             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//           >
//             Log out
//           </button>
//         </div>

//         {/* Search and Filter Bar */}
//         <div className="flex gap-4 mb-6">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search banners..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border rounded-lg"
//             />
//           </div>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="border rounded-lg px-4 py-2"
//           >
//             <option value="all">All Status</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>

//         {/* Banner List */}
//         <div className="bg-white rounded-lg shadow">
//           {banners.map((banner) => (
//             <div 
//               key={banner.id} 
//               className="p-4 border-b last:border-b-0 flex items-center justify-between"
//             >
//               <div className="flex items-center space-x-4">
//                 <img 
//                   src={banner.imageUrl} 
//                   alt={banner.name}
//                   className="w-16 h-16 object-cover rounded"
//                 />
//                 <div>
//                   <h3 className="font-medium">{banner.name}</h3>
//                   <p className="text-sm text-gray-500">
//                     {new Date(banner.startingDate).toLocaleDateString()} - 
//                     {new Date(banner.endingDate).toLocaleDateString()}
//                   </p>
//                   <span className={`inline-block px-2 py-1 rounded-full text-xs ${
//                     banner.status === 'active' 
//                       ? 'bg-green-100 text-green-600' 
//                       : 'bg-gray-100 text-gray-600'
//                   }`}>
//                     {banner.status}
//                   </span>
//                 </div>
//               </div>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handleEdit(banner)}
//                   className="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(banner.id)}
//                   className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
          
//           {/* Pagination */}
//           <div className="flex justify-between items-center p-4 border-t">
//             <span className="text-sm text-gray-500">
//               Page {page} of {totalPages}
//             </span>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Add/Edit Banner Form */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-xl font-semibold mb-4">
//           {selectedBanner ? 'Edit Banner' : 'Add New Banner'}
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input
//               type="text"
//               placeholder="Banner Name"
//               value={newBanner.name}
//               onChange={(e) => setNewBanner({...newBanner, name: e.target.value})}
//               className="p-2 border rounded"
//               required
//             />
//             <input
//               type="date"
//               value={newBanner.startingDate}
//               onChange={(e) => setNewBanner({...newBanner, startingDate: e.target.value})}
//               className="p-2 border rounded"
//               required
//             />
//             <input
//               type="date"
//               value={newBanner.endingDate}
//               onChange={(e) => setNewBanner({...newBanner, endingDate: e.target.value})}
//               className="p-2 border rounded"
//               required
//             />
//             <select
//               value={newBanner.status}
//               onChange={(e) => setNewBanner({...newBanner, status: e.target.value})}
//               className="p-2 border rounded"
//             >
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>
          
//           <div className="border-2 border-dashed rounded-lg p-4">
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageChange}
//               className="hidden"
//               id="banner-image"
//               required={!selectedBanner}
//             />
//             <label 
//               htmlFor="banner-image" 
//               className="cursor-pointer block text-center"
//             >
//               {previewImage ? (
//                 <img 
//                   src={previewImage} 
//                   alt="Preview" 
//                   className="max-h-40 mx-auto mb-2"
//                 />
//               ) : (
//                 <div className="py-4 text-gray-500">
//                   Click to upload image
//                 </div>
//               )}
//             </label>
//           </div>
          
//           <div className="flex space-x-2">
//             <button 
//               type="submit"
//               className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
//             >
//               {selectedBanner ? 'Update Banner' : 'Add Banner'}
//             </button>
//             {selectedBanner && (
//               <button 
//                 type="button"
//                 onClick={resetForm}
//                 className="flex-1 bg-gray-100 text-gray-600 py-2 rounded hover:bg-gray-200"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>
//       </div>

//       {error && (
//         <div className="mt-4 p-4 bg-red-100 text-red-600 rounded">
//           {error}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BannerManagement;


import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from 'lucide-react';

const BannerManagement = () => {
  const [banners, setBanners] = useState([
    {
      id: 1,
      name: "Banner for home page",
      startDate: new Date("2024/01/05"),
      endDate: new Date("2024/01/14"),
      image: "/placeholder.jpg",
      status: "active",
    },
  ]);

  const [newBanner, setNewBanner] = useState({
    name: "",
    startDate: null,
    endDate: null,
    image: null,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBanner((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addBanner = () => {
    if (newBanner.name && newBanner.startDate && newBanner.endDate && newBanner.image) {
      setBanners((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...newBanner,
          status: "active",
        },
      ]);
      setNewBanner({
        name: "",
        startDate: null,
        endDate: null,
        image: null,
      });
    }
  };

  const toggleStatus = (id) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id
          ? { ...banner, status: banner.status === "active" ? "disabled" : "active" }
          : banner
      )
    );
  };

  const deleteBanner = (id) => {
    setBanners((prev) => prev.filter((banner) => banner.id !== id));
  };

  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = Math.abs(end - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-6">Banner Management</h1>

      {/* Existing Banners List */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center justify-between py-2 border-b last:border-b-0"
          >
            <span className="w-1/4">{banner.name}</span>
            <span className="w-1/4">
              {format(banner.startDate, "MM/dd/yyyy")}
            </span>
            <span className="w-1/4">
              {format(banner.endDate, "MM/dd/yyyy")}
            </span>
            <span className="w-1/6">
              {calculateDaysLeft(banner.endDate)} Days Left
            </span>
            <span className="w-1/6">
              <Button
                variant={banner.status === "active" ? "destructive" : "secondary"}
                className="mr-2"
                onClick={() => toggleStatus(banner.id)}
              >
                {banner.status === "active" ? "Disable" : "Enable"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteBanner(banner.id)}
              >
                Delete
              </Button>
            </span>
          </div>
        ))}
      </div>

      {/* Add New Banner Form */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Add banner</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">Name</label>
            <Input
              value={newBanner.name}
              onChange={(e) =>
                setNewBanner((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block mb-2">Starting date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newBanner.startDate ? (
                    format(newBanner.startDate, "MM/dd/yyyy")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newBanner.startDate}
                  onSelect={(date) =>
                    setNewBanner((prev) => ({ ...prev, startDate: date }))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block mb-2">Ending date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newBanner.endDate ? (
                    format(newBanner.endDate, "MM/dd/yyyy")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={newBanner.endDate}
                  onSelect={(date) =>
                    setNewBanner((prev) => ({ ...prev, endDate: date }))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block mb-2">Upload image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <div className="col-span-3">
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={addBanner}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;