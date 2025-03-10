import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {authApi} from '../../../axiosconfig';
import { setAuthData } from '../../../redux/auth/authSlice'; 
import './Signup.css';
import OTPVerificationModal from '../OTPVerificationModal/OTPVerificationModal';
import Loading from "../../ui/Loading";

const Signup = () => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validate = () => {
    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)?$/; 

    const hasSameCharacters = (name) => {
      return name.split("").every((char) => char === name[0]);
};

    let tempErrors = {};
  if (!formData.firstName.trim()) {
  tempErrors.firstName = "First name is required";
} else if (formData.firstName.includes(".")) {
  tempErrors.firstName = "First name cannot contain a dot (.)";
} else if (!nameRegex.test(formData.firstName)) {
  tempErrors.firstName = "First name can only contain letters and a single space";
} else if (hasSameCharacters(formData.firstName.replace(/\s/g, ""))) {
  tempErrors.firstName = "First name cannot have all identical characters";
}

if (!formData.lastName.trim()) {
  tempErrors.lastName = "Last name is required";
} else if (formData.lastName.includes(".")) {
  tempErrors.lastName = "Last name cannot contain a dot (.)";
} else if (!nameRegex.test(formData.lastName)) {
  tempErrors.lastName = "Last name can only contain letters and a single space";
// } else if (hasSameCharacters(formData.lastName.replace(/\s/g, ""))) {
//   tempErrors.lastName = "Last name cannot have all identical characters";
} 

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is invalid";
    }

    if (!formData.username.trim()) {
      tempErrors.username = "Username is required";
    } else if (!/^[a-zA-Z]+$/.test(formData.username)) {  
    tempErrors.username = "Username can only contain letters (no numbers or special characters)";
    }

    if (!formData.phoneNumber.trim()) {
      tempErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      tempErrors.phoneNumber = "Phone number is invalid";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}/.test(formData.password)) {
      tempErrors.password = "Password must contain at least one uppercase letter, one special character, one digit, and one lowercase letter";
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        setLoading(true)
        const response = await authApi.post('/signup/', {
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          phone_number: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
        });
        setUserId(response.data.user_id);
        setShowOTPModal(true);
        
      }
      catch (error) {
        if (error.response) {
          console.error('Signup failed:', error.response.data);
          setErrors(prev => ({
            ...prev,
            submit: error.response.data.detail || 'Signup failed. Please try again.'
          }));
        } else {
          console.error('Signup failed:', error.message);
          setErrors(prev => ({
            ...prev,
            submit: 'Network error. Please try again.'
          }));
        }
        setLoading(false);
      }
    }
  };

  return (
    <div className="signup-container">
    {loading ? (
      <Loading /> // Show the Loading component when loading is true
    ) : (
      <div className="signup-box">
        <h2>Create Account</h2>
        <p>Please fill in the details to register</p>

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-row">
            <div className="input-group">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
              {errors.firstName && <span className="error">{errors.firstName}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="input-group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              required
            />
            {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          {errors.submit && <div className="error general-error">{errors.submit}</div>}

          <button type="submit" className="signup-button" disabled={loading}>
            Create Account
          </button>
        </form>

        <div className="login-link">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    )}
    {showOTPModal && (
      <OTPVerificationModal
        userId={userId}
        onSuccess={(data) => {
          // localStorage.setItem('token', data.token);
          // localStorage.setItem('refresh_token', data.refresh_token);
          // dispatch(setAuthData(data));
          navigate('/login');
        }}
        onCancel={() => {
          setShowOTPModal(false);
          setLoading(false); // Make sure to set loading to false when canceling
          navigate('/login');
        }}
      />
    )}
  </div>
);
};

export default Signup;