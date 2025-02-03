import React,{useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setAuthData,clearAuthData } from '../../redux/auth/authSlice';
import logo from '../../assets/logo.png'; 
import './Home.css';
import { fetchUserProfile } from '../../redux/profile/profileSlice';

function Home() {
  const user = useSelector((state) => state.auth.user);
  const { data: profile, isLoading, error } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
      dispatch(fetchUserProfile());
    }, [dispatch]);

  useEffect(() => {
    if (!user) {
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        dispatch(setAuthData({ user: parsedUserData }));
      } else {
        navigate('/login');
      }
    }
  }, [dispatch, navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch(clearAuthData());
    navigate('/login');
  };

  // Home.jsx
return (
  <div className="home-container">
  <nav className="navbar navbar-expand-lg">
    <div className="container-fluid nav-content">
      {/* Logo Section */}
      <Link to="/" className="navbar-brand">
        <img src={logo} alt="Logo" className="logo-img" />
      </Link>

      {/* Navbar Menu (collapsed on small screens) */}
      <div className="navbar-collapse">
        <div className="navbar-menu ms-auto d-flex align-items-center">
          {/* Profile Section */}
          <Link to="/user-profile" className="navbar-item d-flex align-items-center">
            <div className="profile-picture">
              {isLoading ? (
                <div className="loading-indicator">Loading...</div>
              ) : profile && profile.profile_picture ? (
                <img className="profile-img img-fluid" src={profile.profile_picture} alt="Profile" />
              ) : (
                <div className="profile-initial">{user?.first_name[0]}</div>
              )}
            </div>
          </Link>

          {/* Logout Button */}
          <button onClick={handleLogout} className="navbar-item logout-btn btn btn-link">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
    {/* <main className="main-content">
      <div className="welcome-section">
        <h1><br/>Welcome back, {user ? user.first_name : 'Guest'}!</h1>
        
      </div>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <i className="fas fa-user-edit"></i>
          <h3>Profile Management</h3>
          <p>Update your personal information and profile picture</p>
          <Link to="/user-profile" className="card-link">Edit Profile</Link>
        </div>
      </div>
    </main> */}
  </div>
);
}

export default Home;