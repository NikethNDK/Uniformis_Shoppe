// "use client"

// import { useState,useEffect } from "react"
// import { useDispatch,useSelector } from "react-redux"
// import { fetchProducts } from "../../redux/product/userProductSlice"

// const FilterComponent = ({ onFilter }) => {

//   const dispatch =useDispatch()
  
//   const [category, setCategory] = useState("")
//   const [minPrice, setMinPrice] = useState("")
//   const [maxPrice, setMaxPrice] = useState("")

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     onFilter({ category, minPrice: Number(minPrice), maxPrice: Number(maxPrice) })
//   }

//   return (
//     <div className="bg-white p-4 rounded-lg shadow">
//       <h2 className="text-xl font-semibold mb-4">Filter Products</h2>
//       <form onSubmit={handleSubmit}>



        {/* <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
          </select>
        </div> */}



        
//         <div className="mb-4">
//           <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
//             Min Price
//           </label>
//           <input
//             type="number"
//             id="minPrice"
//             value={minPrice}
//             onChange={(e) => setMinPrice(e.target.value)}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
//             Max Price
//           </label>
//           <input
//             type="number"
//             id="maxPrice"
//             value={maxPrice}
//             onChange={(e) => setMaxPrice(e.target.value)}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
//         >
//           Apply Filters
//         </button>
//       </form>
//     </div>
//   )
// }

// export default FilterComponent


import { useState } from "react"

const FilterComponent = ({ onFilter }) => {
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onFilter({ 
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null
    })
  }

  const handleReset = () => {
    setMinPrice("")
    setMaxPrice("")
    onFilter({})
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Filters</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                id="minPrice"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                // placeholder="0"
                className="pl-8 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                id="maxPrice"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                
                className="pl-8 w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default FilterComponent
