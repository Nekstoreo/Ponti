"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => {
        onFinish();
      }, 500); // Tiempo para que termine la animación de salida
    }, 2000); // Mostrar splash por 2 segundos

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-primary"
      initial={{ opacity: 1 }}
      animate={{ opacity: showSplash ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut"
        }}
        className="relative w-32 h-32 flex items-center justify-center"
      >
        <div className="text-4xl font-bold text-white">Ponti</div>
      </motion.div>
      
      <motion.h1 
        className="mt-6 text-xl font-medium text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Tu compañero universitario
      </motion.h1>
    </motion.div>
  );
}
