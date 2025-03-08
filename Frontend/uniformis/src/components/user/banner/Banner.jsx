import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";

const BannerCarousel = ({ banners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeBanners = banners.filter(banner => banner.status === "active");
  
  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeBanners.length]);
  
  // Navigation handlers
  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? activeBanners.length - 1 : prevIndex - 1
    );
  };
  
  // If no active banners, display nothing or a placeholder
  if (activeBanners.length === 0) {
    return null;
  }
  
  return (
    <div className="relative w-full h-64 overflow-hidden rounded-lg">
      {/* Banner Images */}
      <div 
        className="w-full h-full flex transition-transform duration-500 ease-in-out"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${activeBanners.length * 100}%` 
        }}
      >
        {activeBanners.map((banner) => (
          <div 
            key={banner.id} 
            className="relative w-full h-full flex-shrink-0"
          >
            <img
              src={banner.image}
              alt={banner.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
              <h3 className="font-bold">{banner.name}</h3>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Controls - only show if multiple banners */}
      {activeBanners.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon"
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          {/* Dots indicator */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-gray-400"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;