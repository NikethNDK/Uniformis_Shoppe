import React, { useState, useRef, useEffect } from 'react';

const Lens = ({ children }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const ZOOM_LEVEL = 2.5;

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (children?.props?.src) {
      const img = new Image();
      img.src = children.props.src;
      img.onload = () => {
        setImageSize({
          width: img.width,
          height: img.height
        });
      };
    }
  }, [children?.props?.src]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const boundedX = Math.max(0, Math.min(1, x));
    const boundedY = Math.max(0, Math.min(1, y));

    setZoomPosition({ x: boundedX, y: boundedY });
  };

  // If on mobile, just show the regular image without zoom
  if (isMobile) {
    return (
      <div className="w-full">
        {React.cloneElement(children, {
          className: "w-full h-[300px] sm:h-[400px] object-contain"
        })}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      {/* Main image container */}
      <div
        ref={containerRef}
        className="relative cursor-crosshair"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
      >
        {React.cloneElement(children, {
          className: "w-full h-[500px] object-contain"
        })}
        
        {/* Lens indicator */}
        {showZoom && (
          <div
            className="absolute border-2 border-blue-500 rounded-full pointer-events-none"
            style={{
              width: '100px',
              height: '100px',
              left: `${zoomPosition.x * 100}%`,
              top: `${zoomPosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* Zoomed view */}
      {showZoom && (
        <div 
          className="fixed bg-white shadow-xl z-50 border border-gray-200 overflow-hidden rounded-lg"
          style={{
            width: '500px',
            height: '500px',
            top: '120px', // Positioned below the header
            right: '80px', // Slight offset from the right edge
            transition: 'all 0.3s ease',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundImage: `url(${children.props.src})`,
              backgroundPosition: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
              backgroundSize: `${ZOOM_LEVEL * 100}%`,
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Lens;