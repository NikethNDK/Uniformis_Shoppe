import React from "react";
import { motion } from "framer-motion";
import logo from '../../assets/logo.png';
const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <motion.img
        src={logo} // Ensure correct path
        alt="Loading..."
        className="w-48 h-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0, 1, 1, 0], 
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default Loading;
