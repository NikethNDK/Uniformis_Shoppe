import React,{useState,useEffect} from "react";
import axios from "axios";
import axiosInstance from "../../../axiosconfig";
import { productApi } from "../../../axiosconfig";


const UserDashboard =()=>{

    const [products,setProducts]=useState([]);
    const [searchTerm, setSearchTerm]=useState("");
    
    useEffect(()=>{
    fetchProducts();
  },[]);

  const fetchProducts = async ()=>{
    try{
        const response = await productApi.get("/items/");
        setProducts(response.data);
    }
    catch (error){
    console.error("Error fetching the products: ",error)
   }

}
}
