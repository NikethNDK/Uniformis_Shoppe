import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useSelector((state) => state.auth);

  // Determine the redirect path based on authentication status
  const getRedirectPath = () => {
    if (!isAuthenticated) {
      return '/login';
    }
    return userType === 'admin' ? '/admin/dashboard' : '/user/home';
  };

  const handleRedirect = () => {
    navigate(getRedirectPath());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-5 sm:p-10">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-indigo-600">404</h1>
            <div className="mt-5 mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Page Not Found</h2>
              <p className="mt-2 text-gray-600">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
            
            <div className="w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mb-8"></div>
            
            <button
              onClick={handleRedirect}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isAuthenticated ? 'Return to Homepage' : 'Go to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;