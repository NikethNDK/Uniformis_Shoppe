// import React,{useState} from 'react';
// import Navbar from "../../components/user/navbar/Navbar"
// import Footer from "../../components/user/footer/Footer"
// import { Outlet, useLocation } from 'react-router-dom';
// import UserSidebar from '../../components/user/userprofile/UserSidebar';
// import ImageCropper from './ProfileImageCropper';

// const UserLayout = () => {
//   const location = useLocation();
//   const [showImageCropper, setShowImageCropper] = useState(false)
//   const [selectedImage, setSelectedImage] = useState(null)

//   // routes where the user sidebar should be shown
//   const sidebarRoutes = ["/user/profile-information"];

//   // Check if the current route is in sidebarRoutes
//   const showSidebar = sidebarRoutes.includes(location.pathname);

//   const handleImageCropComplete = (croppedImage) => {
//     // Handle the cropped image (e.g., update profile picture)
//     setShowImageCropper(false)
//   }
//   return (
//     <div className="min-h-screen flex flex-col">
//     <Navbar />
//     <div className="flex flex-1">
//         {showSidebar && <UserSidebar />} {/* Sidebar appears only for specific routes */}
//         <main className="flex-1">
//           <Outlet />
//         </main>
//       </div>
//     <Footer />
//     {showImageCropper && (
//         <ImageCropper
//           image={selectedImage}
//           onCropComplete={handleImageCropComplete}
//           onCancel={() => setShowImageCropper(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default UserLayout;

import { useEffect, useState } from "react";
import Navbar from "../../components/user/navbar/Navbar";
import Footer from "../../components/user/footer/Footer";
import { Outlet, useLocation } from "react-router-dom";
import UserSidebar from "../../components/user/userprofile/UserSidebar";
import ImageCropper from "./ProfileImageCropper";

const UserLayout = () => {
  const location = useLocation();
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // routes where the user sidebar should be shown
  const sidebarRoutes = [
    "/user/profile-information",
    "/user/address",
    "/user/trackorder",
    "/user/wallet",
  ];

  const showSidebar = sidebarRoutes.includes(location.pathname);

  useEffect(() => {
    console.log("Sidebar should show:", sidebarRoutes.includes(location.pathname));
  }, [location.pathname]);

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setShowImageCropper(true);
  };

  const handleImageCropComplete = (croppedImage) => {
    console.log("Cropped image:", croppedImage);
    setShowImageCropper(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <UserSidebar onImageSelect={handleImageSelect} />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
      {showImageCropper && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleImageCropComplete}
          onCancel={() => setShowImageCropper(false)}
        />
      )}
    </div>
  );
};

export default UserLayout;
