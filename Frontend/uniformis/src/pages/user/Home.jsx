// import React from 'react'
// import Navbar from '../../components/user/navbar/Navbar'
// import Footer from '../../components/user/footer/Footer'


// const Home = () => {
//   return (
//     <>
//     <Navbar/>
//     <Footer/>
//     </>
//   )
// }

// export default Home
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts } from "../../redux/product/productSlice"
import Navbar from "../../components/user/navbar/Navbar"
import Footer from "../../components/user/footer/Footer"
import ProductDisplay from "../../components/user/productCard/ProductDisplay"
export default function Home() {
  const dispatch = useDispatch()
  const { items, bestSellers, isLoading } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchProducts())
    
  }, [dispatch])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ProductDisplay/>
      <Footer />
    </div>
  )
}

