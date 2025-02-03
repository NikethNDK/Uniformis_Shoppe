import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [newBanner, setNewBanner] = useState({
    name: '',
    startingDate: '',
    endingDate: '',
    status: 'active',
    image: null
  });

  useEffect(() => {
    fetchBanners();
  }, [page, filterStatus, searchQuery]);

  const fetchBanners = async () => {
    try {
      const response = await fetch(
        `/api/banners?page=${page}&status=${filterStatus}&search=${searchQuery}`
      );
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      setBanners(data.banners);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBanner({
        ...newBanner,
        image: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.keys(newBanner).forEach(key => {
      formData.append(key, newBanner[key]);
    });

    try {
      const response = await fetch('/api/banners', {
        method: selectedBanner ? 'PUT' : 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error(selectedBanner ? 'Failed to update banner' : 'Failed to add banner');
      
      await fetchBanners();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setNewBanner({
      name: '',
      startingDate: '',
      endingDate: '',
      status: 'active',
      image: null
    });
    setPreviewImage(null);
    setSelectedBanner(null);
  };

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setNewBanner({
      name: banner.name,
      startingDate: banner.startingDate,
      endingDate: banner.endingDate,
      status: banner.status,
      image: null
    });
    setPreviewImage(banner.imageUrl);
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const response = await fetch(`/api/banners/${bannerId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete banner');
        
        await fetchBanners();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="content">Loading...</div>;

  return (
    <div className="content bg-gray-50">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Banner Management</h1>
          <button 
            onClick={() => window.location.href = '/logout'}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Log out
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Banner List */}
        <div className="bg-white rounded-lg shadow">
          {banners.map((banner) => (
            <div 
              key={banner.id} 
              className="p-4 border-b last:border-b-0 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">{banner.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(banner.startingDate).toLocaleDateString()} - 
                    {new Date(banner.endingDate).toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    banner.status === 'active' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {banner.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(banner)}
                  className="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          
          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Banner Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {selectedBanner ? 'Edit Banner' : 'Add New Banner'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Banner Name"
              value={newBanner.name}
              onChange={(e) => setNewBanner({...newBanner, name: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="date"
              value={newBanner.startingDate}
              onChange={(e) => setNewBanner({...newBanner, startingDate: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="date"
              value={newBanner.endingDate}
              onChange={(e) => setNewBanner({...newBanner, endingDate: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <select
              value={newBanner.status}
              onChange={(e) => setNewBanner({...newBanner, status: e.target.value})}
              className="p-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="border-2 border-dashed rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="banner-image"
              required={!selectedBanner}
            />
            <label 
              htmlFor="banner-image" 
              className="cursor-pointer block text-center"
            >
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-h-40 mx-auto mb-2"
                />
              ) : (
                <div className="py-4 text-gray-500">
                  Click to upload image
                </div>
              )}
            </label>
          </div>
          
          <div className="flex space-x-2">
            <button 
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              {selectedBanner ? 'Update Banner' : 'Add Banner'}
            </button>
            {selectedBanner && (
              <button 
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-600 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default BannerManagement;