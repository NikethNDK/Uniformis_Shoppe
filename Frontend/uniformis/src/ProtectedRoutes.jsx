
// import React, { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'

// const ProtectedRoute = ({ children }) => {
//     const user = localStorage.getItem('user')
//     const navigate = useNavigate()

//     useEffect(() => {
//         if (!user) {
//             navigate('/')  // Redirect to home if user is not logged in
//         }
//     }, [user, navigate])

//     return user ? children : null
// }

// export default ProtectedRoute
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from './components/ui/Loading';

// Protected route for regular users
export const UserProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, userType } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    // Redirect to login page and save the attempted URL for later
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated as admin, redirect to admin dashboard
  if (userType === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // User is authenticated as regular user
  return children;
};

// Protected route for admin users
export const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, userType } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    // Redirect to admin login page
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated as regular user, redirect to user homepage
  if (userType === 'user') {
    return <Navigate to="/user/home" replace />;
  }

  // User is authenticated as admin
  return children;
};

// Public route - only accessible when NOT authenticated
export const PublicRoute = ({ children, userRedirect = "/user/home", adminRedirect = "/admin/dashboard" }) => {
  const { isAuthenticated, isLoading, userType } = useSelector((state) => state.auth);

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    // Redirect based on user type
    if (userType === 'admin') {
      return <Navigate to={adminRedirect} replace />;
    } else {
      return <Navigate to={userRedirect} replace />;
    }
  }

  // Not authenticated, show the public route
  return children;
};