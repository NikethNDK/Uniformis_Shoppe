// import React, {useState} from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate, Link } from "react-router-dom";
// import { setAuthData } from "../../redux/auth/authSlice";
// import adminAxiosInstance from "../../adminaxiosconfig";
// import './AdminLogin.css'
// const AdminLogin = () => {
//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const handleAdminLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await adminAxiosInstance.post('/admin/token/', {email, password});
//             localStorage.setItem('adminToken', response.data.admin_token);
//             localStorage.setItem('adminData', JSON.stringify(response.data));
//             dispatch(setAuthData(response.data));
//             navigate('/admin/dashboard');
//         } catch (error) {
//             console.error('Admin login failed:', error) 
//         }
//     };

//     return (
//       <div className="admin-login-container">
//         <div className="admin-login-box">
//           <h2>Admin Panel</h2>
         
//           <form onSubmit={handleAdminLogin} className="admin-login-form">
//             <div className="input-group">
//               <input 
//                 type="email" 
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Email"
//                 required
//               />
//             </div>
    
//             <div className="input-group">
//               <input 
//                 type="password" 
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Password"
//                 required
//               />
//             </div>
    
//             <button type="submit" className="login-button">
//               Login to Dashboard
//             </button>
//           </form>
    
//           <div className="login-links">
//             <p>Not an admin? <Link to="/login">Switch to User Login</Link></p>
//           </div>
//         </div>
//       </div>
//     );
    
// }

// export default AdminLogin;
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setAuthData } from "../../redux/auth/authSlice";
import adminAxiosInstance from "../../adminaxiosconfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/logo.png'

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First, get the CSRF token
      await adminAxiosInstance.get('/admin/csrf/');
      
      // Then make the login request
      const response = await adminAxiosInstance.post('/admin/token/', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.admin_token) {
        localStorage.setItem('adminToken', response.data.admin_token);
        localStorage.setItem('adminData', JSON.stringify(response.data));
        dispatch(setAuthData(response.data));
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      const errorMessage = error.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <div className="flex w-full max-w-4xl bg-black rounded-lg shadow-2xl overflow-hidden">
        {/* Logo Section */}
        <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center p-12">
          <img
            src={logo}
            alt="Company Logo"
            className="max-w-full h-auto"
          />
        </div>

        {/* Login Form Section */}
        <div className="w-full md:w-1/2 bg-black p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-400 mb-2">Admin Panel</h2>
            <p className="text-gray-500">Welcome back! Please login to continue.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:border-gray-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:border-gray-500"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 mt-4 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-gray-500 hover:text-gray-400 text-sm"
            >
              Not an admin? Switch to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;