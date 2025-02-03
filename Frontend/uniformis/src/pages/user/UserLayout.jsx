import React from 'react';
import Navbar from "../../components/user/navbar/Navbar"
import Footer from "../../components/user/footer/Footer"
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
    <Navbar />
        <main>
            <Outlet />
        </main>
    <Footer />
    </div>
  );
};

export default UserLayout;