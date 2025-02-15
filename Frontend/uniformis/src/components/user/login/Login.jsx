import React, { useState,useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../../axiosconfig';
import { setAuthData } from '../../../redux/auth/authSlice';
import './Login.css';
import logo from '../../../assets/logo.png';
import Loading from '../../ui/Loading'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OTPVerificationModal from '../OTPVerificationModal/OTPVerificationModal';
import { fetchUserProfile } from "../../../redux/profile/profileSlice"


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        console.log('Attempting login with:', { email, password });
        const response = await axiosInstance.post('/login/', { email, password });
        console.log('Login response:', response.data);
        
        const { type, data, message, details } = response.data;
        
        if (type === 'VERIFICATION_REQUIRED') {
            console.log('Verification required, user_id:', details.user_id);
            setUserId(details.user_id);
            setShowOTPModal(true);
            toast.info('Please verify your email to continue');
        } else if (type === 'SUCCESS') {
            // Use dispatch instead of manually setting localStorage
            dispatch(setAuthData(data));
            dispatch(fetchUserProfile())
            toast.success('Login successful!');
            navigate('/user/homepage');
        }
    } catch (error) {
        console.error('Login error:', error.response?.data);
        const errorData = error.response?.data;
        let errorMessage = 'An error occurred during login';
        
        switch (errorData?.type) {
            case 'VALIDATION_ERROR':
                errorMessage = errorData.message || 'Please check your credentials';
                break;
            case 'AUTH_ERROR':
                errorMessage = errorData.message || 'Invalid credentials';
                break;
            case 'FORBIDDEN':
                errorMessage = errorData.message || 'Your account has been blocked';
                break;
            default:
                errorMessage = errorData?.message || 'An unexpected error occurred';
        }
        toast.error(errorMessage);
    } finally {
        setLoading(false);
    }
};


  useEffect(() => {
    // Load the Google Identity Services script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id:'447562974245-n3dkhp35abet7aqdvfqv8flgkd39nai0.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          ux_mode: 'popup',  // Use popup instead of redirect
            context: 'signin',
            itp_support: true
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: 'outline', size: 'large', width: '100%', type: 'standard' }
        );
      };
    };


    loadGoogleScript();

        // Cleanup
        return () => {
          // Remove the script tag when component unmounts
          const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
          if (script) {
            document.body.removeChild(script);
          }
        };
      }, []);


      useEffect(() => {
        console.log('Modal state changed:', { showOTPModal, userId });
      }, [showOTPModal, userId]);

    //   const handleCredentialResponse = async (response) => {
    //     try {
    //       const backendResponse = await axiosInstance.post('/google_login/', {
    //         credential: response.credential // Send the credential token to your backend
    //       });
    //       dispatch(setAuthData(backendResponse.data));
    //       dispatch(fetchUserProfile())
    //       setError('');
    //       navigate('/user/homepage');
    //     } catch (error) {
    //       console.error('Error authenticating with backend:', error);
          
    //     }
    //   };
    const handleCredentialResponse = async (response) => {
        try {
            const backendResponse = await axiosInstance.post('/google_login/', {
                credential: response.credential
            });
            
            if (backendResponse.data.type === 'SUCCESS') {
                dispatch(setAuthData(backendResponse.data.data));
                dispatch(fetchUserProfile());
                toast.success('Login successful!');
                navigate('/user/homepage');
            } else {
                toast.error(backendResponse.data.message);
            }
        } catch (error) {
            console.error('Error authenticating with Google:', error);
            toast.error(error.response?.data?.message || 'Failed to authenticate with Google');
        }
    };
    

      const handleOTPSuccess = (data) => {
        // Use dispatch instead of manually setting localStorage
        dispatch(setAuthData(data));
        dispatch(fetchUserProfile())
        setShowOTPModal(false);
        toast.success('Email verified successfully!');
        navigate('/user/homepage');
    };

    const handleOTPCancel = () => {
        setShowOTPModal(false);
        setUserId(null);
        toast.info('Email verification cancelled');
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="login-container">
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
            <div className="login-content">
                <div className="logo-section">
                    <img src={logo} alt="Logo" className="logo-img" />
                </div>

                <div className="form-section">
                    <h2>Welcome Back!</h2>
                    <p>Log in to your account</p>

                    {/* {error && (
                        <div className="error-message" style={{
                            color: '#dc3545',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '4px',
                            padding: '10px',
                            marginBottom: '15px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )} */}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                            />
                        </div>

                        <button type="submit" className="login-button1">
                            Login
                        </button>

                        <div className="form-actions">
                            <Link to="/forgot-password" className="forgot-password">
                                Forgot Password?
                            </Link>
                        </div>

                        <div className="signup-link">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/signup" className="signup">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                        {/* <GoogleLogin onSuccess={responseMessage} onError={errorMessage} /> */}
                          {/* Google Sign-In Button */}
        <div className="text-center mt-4">
          <div id="googleSignInDiv"></div>
        </div>
                        {/* <button type="button" className="google-login">
                            <img src={googleLogo} alt="Google Logo" className="google-logo" />
                            <span>Sign in with Google</span>
                        </button> */}
                    </form>
                </div>
            </div>
            {/* {showOTPModal && (
                <OTPVerificationModal
                    userId={userId}
                    onSuccess={(data) => {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('refresh_token', data.refresh_token);
                        dispatch(setAuthData(data));
                        toast.success('Email verified successfully!');
                        navigate('/user/homepage');
                    }}
                    onCancel={() => {
                        setShowOTPModal(false);
                        toast.info('Email verification cancelled');
                    }}
                />
            )} */}
            {showOTPModal && (
                <OTPVerificationModal
                    userId={userId}
                    onSuccess={handleOTPSuccess}
                    onCancel={handleOTPCancel}
                />
            )}
        </div>
    );
};

export default Login;