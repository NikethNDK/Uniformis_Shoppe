import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../../axiosconfig";
import { setAuthData } from "../../../redux/auth/authSlice";
import "./Login.css";
import logo from "../../../assets/logo.png";
import Loading from "../../ui/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OTPVerificationModal from "../OTPVerificationModal/OTPVerificationModal";
import { fetchUserProfile } from "../../../redux/profile/profileSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("Attempting login with:", { email, password });
      const response = await axiosInstance.post("/login/", { email, password });
      console.log("Login response:", response.data);
      console.log('user deatils response.data.user',response.data.user)

      const { type, data, message, details } = response.data;
     

      if (type === "VERIFICATION_REQUIRED") {
        console.log("Verification required, user_id:", details.user_id);
        
        setUserId(details.user_id);
        setShowOTPModal(true);
        toast.info("Please verify your email to continue");
      } 

      else if (type === "SUCCESS") {
        localStorage.setItem("user",JSON.stringify(data.user))
        localStorage.setItem("isAuthenticated",true)

        dispatch(setAuthData({
            user:data.user,
            isAuthenticated:true
        }));

        dispatch(fetchUserProfile());
        // toast.success("Login successful!");
        navigate("/user/home");
      }
    } catch (error) {
      console.log("Login error:", error);
      const errorData = error?.response?.data?.message;
      console.log("errorData ", errorData);
      let errorMessage = "An error occurred during login";

      switch (errorData?.type) {
        case "VALIDATION_ERROR":
          errorMessage = errorData || "Please check your credentials";
          break;
        case "AUTH_ERROR":
          errorMessage = errorData || "Invalid credentials";
          break;
        case "FORBIDDEN":
          errorMessage = errorData || "Your account has been blocked";
          break;
        default:
          errorMessage = errorData || "An unexpected error occurred";
      }
      setError(errorMessage); // Set the error message
      toast.error(errorData);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load the Google Identity Services script
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          // client_id:import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_id:
            "447562974245-n3dkhp35abet7aqdvfqv8flgkd39nai0.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          ux_mode: "popup", // Use popup instead of redirect
          context: "signin",
          itp_support: true,
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large", width: "100%", type: "standard" }
        );
      };
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      // Remove the script tag when component unmounts
      const script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    console.log("Modal state changed:", { showOTPModal, userId });
  }, [showOTPModal, userId]);


  const handleCredentialResponse = async (response) => {
  try {
    setLoading(true);
    console.log("Google response received:", response.credential.substring(0, 20) + "...");
    
    const backendResponse = await axiosInstance.post("/google_login/", {
      credential: response.credential,
    });
    
    console.log("Backend response:", backendResponse.data);

    if (backendResponse.data.type === "SUCCESS") {
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(backendResponse.data.data.user));
      localStorage.setItem("isAuthenticated", "true");
      
      // Update Redux state
      dispatch(
        setAuthData({
          user: backendResponse.data.data.user,
          isAuthenticated: true,
        })
      );
      
      // Fetch user profile
      dispatch(fetchUserProfile());
      
      toast.success("Login successful!");
      
      // Add a small delay before navigation
      setTimeout(() => {
        navigate("/user/home");
      }, 500);
    } else {
      const errorMessage = backendResponse.data.message || "Authentication failed";
      console.error("Error in response:", errorMessage, backendResponse.data);
      toast.error(errorMessage);
      setError(errorMessage);
    }
  } catch (error) {
    console.error("Error authenticating with Google:", error);
    
    // Detailed error logging
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
      
      const errorDetails = error.response.data.details?.error || 
                          error.response.data.message || 
                          `Server error (${error.response.status})`;
      toast.error(`Google login failed: ${errorDetails}`);
      setError(errorDetails);
    } else if (error.request) {
      console.error("Error request:", error.request);
      toast.error("No response received from server. Please try again later.");
      setError("No response received from server");
    } else {
      console.error("Error message:", error.message);
      toast.error(`Error: ${error.message}`);
      setError(error.message);
    }
  } finally {
    setLoading(false);
  }
};

  const handleOTPSuccess = (data) => {
    // Use dispatch instead of manually setting localStorage
    dispatch(setAuthData(data));
    dispatch(fetchUserProfile());
    setShowOTPModal(false);
    toast.success("Email verified successfully!");
    navigate("/user/home");
  };

  const handleOTPCancel = () => {
    setShowOTPModal(false);
    setUserId(null);
    toast.info("Email verification cancelled");
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

          {error && (
            <div
              className="error-message"
              style={{
                color: "#dc3545",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
                padding: "10px",
                marginTop: "15px",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

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
                Don't have an account?{" "}
                <Link to="/signup" className="signup">
                  Sign Up
                </Link>
              </p>
            </div>

            <div className="text-center mt-4">
              <div id="googleSignInDiv"></div>
            </div>
           
          </form>
        </div>
      </div>
      
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
