import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChartBar, 
  FaBox, 
  FaShoppingCart, 
  FaUser, 
  FaTag, 
  FaRuler, 
  FaBell, 
  FaEnvelope, 
  FaStar, 
  FaTicketAlt,
  FaImage,
  FaThLarge,
  FaPalette
} from 'react-icons/fa';
import './Sidebar.css';
import logo from '../../../assets/logo.png';

function Sidebar() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    {
      section: "Main",
      items: [
        { path: "/admin/dashboard", icon: FaChartBar, label: "Dashboard" },
        { path: "/admin/products", icon: FaBox, label: "Products" },
        { path: "/admin/ordermanagement", icon: FaShoppingCart, label: "Orders" },
        { path: "/admin/customerManagement", icon: FaUser, label: "Customers" },
        { path: "/admin/size", icon: FaRuler, label: "Size" },
        { path: "/admin/category", icon: FaThLarge, label: "Category" },
        { path: "/admin/color", icon: FaPalette, label: "Colors" }
      ]
    },
    {
      section: "Management",
      items: [
        { path: "/admin/offermanagement", icon: FaTag, label: "Offers" },
        { path: "/notification", icon: FaBell, label: "Notification" },
        { path: "/contact", icon: FaEnvelope, label: "Contact Us" },
        { path: "/reviews", icon: FaStar, label: "Reviews" }
      ]
    },
    {
      section: "Configuration",
      items: [
        { path: "/admin/salesreport", icon: FaChartBar, label: "Sales Report" },
        { path: "/admin/couponmangement", icon: FaTicketAlt, label: "Coupon" },
        { path: "/banner", icon: FaImage, label: "Banner management" },
        
      ]
    }
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="Uniformis Shoppe" className="logo-img-side" />
      </div>
      <nav>
        {navigationItems.map((section, index) => (
          <div key={index} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            <ul>
              {section.items.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={isActive(item.path) ? 'active' : ''}
                  >
                    <item.icon />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;


