// import { useState } from "react"

// const FilterComponent = ({ onFilter }) => {
//   const [minPrice, setMinPrice] = useState("")
//   const [maxPrice, setMaxPrice] = useState("")

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     onFilter({ 
//       minPrice: minPrice ? Number(minPrice) : null,
//       maxPrice: maxPrice ? Number(maxPrice) : null
//     })
//   }

//   const handleReset = () => {
//     setMinPrice("")
//     setMaxPrice("")
//     onFilter({})
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6">
//       <h2 className="text-xl font-semibold text-gray-900 mb-6">Filters</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="space-y-6">
//           <div>
//             <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
//               Minimum Price
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
//               <input
//                 type="number"
//                 id="minPrice"
//                 value={minPrice}
//                 onChange={(e) => setMinPrice(e.target.value)}
//                 // placeholder="0"
//                 className="pl-8 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//               />
//             </div>
//           </div>

//           <div>
//             <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
//               Maximum Price
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
//               <input
//                 type="number"
//                 id="maxPrice"
//                 value={maxPrice}
//                 onChange={(e) => setMaxPrice(e.target.value)}
                
//                 className="pl-8 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//               />
//             </div>
//           </div>

//           <div className="flex flex-col gap-3">
//             <button
//               type="submit"
//               className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
//             >
//               Apply Filters
//             </button>
//             <button
//               type="button"
//               onClick={handleReset}
//               className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
//             >
//               Reset Filters
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default FilterComponent

import { useState, useEffect } from "react";

const FilterComponent = ({ onFilter }) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]); // Default range
  
  // This is for the slider's left and right thumbs
  const [leftThumbPosition, setLeftThumbPosition] = useState(0);
  const [rightThumbPosition, setRightThumbPosition] = useState(100);

  // Update the numeric inputs when slider changes
  useEffect(() => {
    setMinPrice(priceRange[0].toString());
    setMaxPrice(priceRange[1].toString());
  }, [priceRange]);

  // Update slider positions when inputs change directly
  useEffect(() => {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : 10000;
    
    // Calculate percentage positions for the slider thumbs
    const leftPos = ((min - 0) / (10000 - 0)) * 100;
    const rightPos = ((max - 0) / (10000 - 0)) * 100;
    
    setLeftThumbPosition(Math.max(0, Math.min(rightPos, leftPos)));
    setRightThumbPosition(Math.min(100, Math.max(leftPos, rightPos)));
  }, [minPrice, maxPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null
    });
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setPriceRange([0, 10000]);
    setLeftThumbPosition(0);
    setRightThumbPosition(100);
    onFilter({});
  };

  const handleSliderChange = (e, isMin) => {
    const value = Number(e.target.value);
    const min = parseInt(e.target.min);
    const max = parseInt(e.target.max);
    
    // Calculate percentage position for styles
    const percentage = ((value - min) / (max - min)) * 100;
    
    if (isMin) {
      const newMin = Math.min(value, priceRange[1] - 500); // Ensure min doesn't exceed max - 500
      setPriceRange([newMin, priceRange[1]]);
      setLeftThumbPosition(percentage);
    } else {
      const newMax = Math.max(value, priceRange[0] + 500); // Ensure max is at least min + 500
      setPriceRange([priceRange[0], newMax]);
      setRightThumbPosition(percentage);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Price Range</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="relative pt-6 pb-8">
            {/* Range slider track background */}
            <div className="absolute h-2 w-full bg-gray-200 rounded-full"></div>
            
            {/* Active range track */}
            <div 
              className="absolute h-2 bg-indigo-500 rounded-full" 
              style={{
                left: `${leftThumbPosition}%`,
                right: `${100 - rightThumbPosition}%`
              }}
            ></div>
            
            {/* Min thumb */}
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[0]}
              onChange={(e) => handleSliderChange(e, true)}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto"
              style={{
                '--thumb-size': '18px',
                '--thumb-color': 'white', 
                '--thumb-border': '2px solid #4F46E5',
                '--thumb-shadow': '0 2px 4px rgba(0,0,0,0.1)',
                'WebkitAppearance': 'none'
              }}
            />
            
            {/* Max thumb */}
            <input
              type="range"
              min="0"
              max="10000"
              step="100" 
              value={priceRange[1]}
              onChange={(e) => handleSliderChange(e, false)}
              className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto"
              style={{
                '--thumb-size': '18px',
                '--thumb-color': 'white',
                '--thumb-border': '2px solid #4F46E5',
                '--thumb-shadow': '0 2px 4px rgba(0,0,0,0.1)',
                'WebkitAppearance': 'none'
              }}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="w-5/12">
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  id="minPrice"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    if (e.target.value && Number(e.target.value) <= Number(maxPrice || 10000)) {
                      setPriceRange([Number(e.target.value), priceRange[1]]);
                    }
                  }}
                  className="pl-8 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
            
            <div className="w-2 h-1 bg-gray-300"></div>
            
            <div className="w-5/12">
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  id="maxPrice"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    if (e.target.value && Number(e.target.value) >= Number(minPrice || 0)) {
                      setPriceRange([priceRange[0], Number(e.target.value)]);
                    }
                  }}
                  className="pl-8 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FilterComponent;