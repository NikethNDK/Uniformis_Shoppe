import React from 'react';
import Sidebar from '../../components/admin/Sidebar/Sidebar';
import './AdminLayout'
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="dashboard-container">
      <Sidebar /> 
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;