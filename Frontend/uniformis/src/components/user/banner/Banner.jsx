// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// const Banner = () => {
//   const [banners, setBanners] = useState([]);
//   const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchBanners();
//   }, []);

//   useEffect(() => {
//     if (banners.length > 0) {
//       const timer = setInterval(() => {
//         setCurrentBannerIndex((prevIndex) => 
//           (prevIndex + 1) % banners.length
//         );
//       }, 3000);

//       return () => clearInterval(timer);
//     }
//   }, [banners.length]);

//   const fetchBanners = async () => {
//     try {
//       const response = await fetch('/api/banners/active');
//       if (!response.ok) throw new Error('Failed to fetch banners');
//       const data = await response.json();
//       setBanners(data);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   const nextBanner = () => {
//     setCurrentBannerIndex((prevIndex) => 
//       (prevIndex + 1) % banners.length
//     );
//   };

//   const prevBanner = () => {
//     setCurrentBannerIndex((prevIndex) => 
//       prevIndex === 0 ? banners.length - 1 : prevIndex - 1
//     );
//   };

//   if (loading) return <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />;
//   if (error) return null;
//   if (banners.length === 0) return null;

//   return (
//     <div className="relative w-full h-64 md:h-96 mb-8 overflow-hidden rounded-lg">
//       <div className="absolute inset-0">
//         <img 
//           src={banners[currentBannerIndex]?.imageUrl} 
//           alt={banners[currentBannerIndex]?.name || 'Banner'} 
//           className="w-full h-full object-cover"
//         />
//       </div>
      
//       {banners.length > 1 && (
//         <>
//           <button 
//             onClick={prevBanner}
//             className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
//           >
//             <ChevronLeft className="w-6 h-6" />
//           </button>
//           <button 
//             onClick={nextBanner}
//             className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
//           >
//             <ChevronRight className="w-6 h-6" />
//           </button>

//           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
//             {banners.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setCurrentBannerIndex(index)}
//                 className={`w-2 h-2 rounded-full ${
//                   index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
//                 }`}
//               />
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Banner;

import React, { useState, useEffect } from "react";

const BannerCarousel = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const activeBanners = banners.filter(
    (banner) =>
      banner.status === "active" &&
      new Date(banner.startDate) <= new Date() &&
      new Date(banner.endDate) >= new Date()
  );

  if (activeBanners.length === 0) return null;

  return (
    <div className="relative w-full min-h-[400px] overflow-hidden">
      {activeBanners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute w-full h-full transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={banner.image || "/placeholder.svg"}
            alt={banner.name}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {activeBanners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;