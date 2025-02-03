import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import adminAxiosInstance from '../../adminaxiosconfig';
import './AdminEditUser.css';

const AdminEditUser = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting]=useState(false)
    const { user } = location.state || {};
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        phone_number: user?.phone_number || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         await adminAxiosInstance.put(`/admin/updateUser/${user.id}/`, formData);
    //         navigate('/admin/dashboard');
    //     } catch (error) {
    //         console.error('Failed to update user:', error);
    //     }
    // };
    

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     try {
  //         const response = await adminAxiosInstance.put(`/admin/updateUser/${user.id}/`, formData);
  //         if (response.status === 200) {
  //             // Optional: Show success message
  //             alert('User updated successfully');
  //             navigate('/admin/dashboard');
  //         }
  //     } catch (error) {
  //         console.error('Failed to update user:', error);
  //         // Show error message to user
  //         alert(error.response?.data?.message || 'Failed to update user');
  //     }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.username || !formData.email || !formData.phone_number) {
        alert('Please fill in all fields');
        return;
    }

    setIsSubmitting(true);
    try {
        // Fixed: Added backticks for template literal
        const response = await adminAxiosInstance.put(`/admin/updateUser/${user.id}/`, formData);
        if (response.status === 200) {
            alert('User updated successfully');
            navigate('/admin/dashboard');
        }
    } catch (error) {
        console.error('Failed to update user:', error);
        alert(error.response?.data?.message || 'Failed to update user');
    } finally {
        setIsSubmitting(false);
    }
};
  

    const handleBack = () => {
        navigate('/admin/dashboard');
    };

    if (!user) {
        return <div>No user data found</div>;
    }

    return (
        <div className="admin-edit-container">
            <div className="admin-edit-box">
                <h2>Edit User</h2>
                <p>Edit details for {user.first_name} {user.last_name}</p>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="button-group">
                        {/* <button type="button" onClick={handleBack} className="back-btn">
                            Back
                        </button>
                        <button type="submit" className="save-btn">
                            Save Changes
                        </button> */}
                        <button 
            type="submit" 
            className="save-btn" 
            disabled={isSubmitting}
        >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEditUser;
