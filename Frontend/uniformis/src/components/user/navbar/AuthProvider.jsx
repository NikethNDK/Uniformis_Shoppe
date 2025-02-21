// import React, { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import clearAuthData, { setAuthData } from '../../../redux/auth/authSlice';
// import axiosInstance from '../../../axiosconfig';

// export default function AuthProvider({ children }) {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     // Try to fetch user profile - this will work if the cookies are valid
//     axiosInstance.get('/user-profile/')
//       .then(response => {
//         if (response.data?.user) {
//           dispatch(setAuthData({ user: response.data.user }));
//         }
//       })
//       .catch(() => {
//         dispatch(clearAuthData());
//       });
//   }, [dispatch]);

//   return children;
// }



import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute