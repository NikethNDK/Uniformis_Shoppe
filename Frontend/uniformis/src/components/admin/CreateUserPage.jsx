import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAxiosInstance from '../../adminaxiosconfig';
import './CreateUserPage.css'; 

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!userData.first_name.trim()) {
      tempErrors.first_name = "First name is required";
    } else if (userData.first_name.includes('.')) {
      tempErrors.first_name = "First name cannot contain a dot (.)";
    }
    if (!userData.last_name.trim()) {
      tempErrors.last_name = "Last name is required";
    } else if (userData.last_name.includes('.')) {
      tempErrors.last_name = "Last name cannot contain a dot (.)";
    }
    if (!userData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      tempErrors.email = "Email is invalid";
    }
    if (!userData.username.trim()) {
      tempErrors.username = "Username is required";
    } else if (!/^[a-zA-Z]+$/.test(userData.username)) {  
    tempErrors.username = "Username can only contain letters (no numbers or special characters)";
    }
    if (!userData.phone_number.trim()) {
      tempErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(userData.phone_number)) {
      tempErrors.phone_number = "Phone number is invalid";
    }
    if (!userData.password) {
      tempErrors.password = "Password is required";
    } else if (userData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}/.test(userData.password)) {
      tempErrors.password = "Password must contain at least one uppercase letter, one special character, one digit, and one lowercase letter";
    }
    if (userData.password !== userData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await adminAxiosInstance.post('/admin/create-user/', {
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          email: userData.email,
          phone_number: userData.phone_number,
          password: userData.password,
        });
        navigate('/admin/dashboard'); 
      } catch (error) {
        console.error('Failed to create user:', error);
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard'); 
  };

  return (
    <div className="create-user-page">
      <h2 className="create-user-title">Create New User</h2>
      <form className="create-user-form" onSubmit={handleSubmit}>
        <input 
          className="create-user-input"
          name="first_name"
          value={userData.first_name}
          onChange={handleChange}
          placeholder="First Name"
          required
        />
        {errors.first_name && <span className="error">{errors.first_name}</span>}
        <input 
          className="create-user-input"
          name="last_name"
          value={userData.last_name}
          onChange={handleChange}
          placeholder="Last Name"
          required
        />
        {errors.last_name && <span className="error">{errors.last_name}</span>}
        <input 
          className="create-user-input"
          name="username"
          value={userData.username}
          onChange={handleChange}
          placeholder="Username"
          required
        />
        {errors.username && <span className="error">{errors.username}</span>}
        <input 
          className="create-user-input"
          name="email"
          value={userData.email}
          onChange={handleChange}
          placeholder="Email"
          required 
          type="email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
        <input 
          className="create-user-input"
          name="phone_number"
          value={userData.phone_number}
          onChange={handleChange}
          placeholder="Phone Number"
          required
        />
        {errors.phone_number && <span className="error">{errors.phone_number}</span>}
        <input 
          className="create-user-input"
          name="password"
          value={userData.password}
          onChange={handleChange}
          placeholder="Password"
          required 
          type="password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
        <input 
          className="create-user-input"
          name="confirmPassword"
          value={userData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required 
          type="password"
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        <div className="create-user-button-group">
          <button className="create-user-submit" type="submit">Create User</button>
          <button className="create-user-cancel" type="button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;