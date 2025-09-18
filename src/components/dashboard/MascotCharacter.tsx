"use client";

import { motion, useAnimation } from "framer-motion";
import { useState } from "react";

/**
 * MascotCharacter
 * Una ilustración SVG simple que actúa como placeholder del futuro avatar interactivo.
 * Interacciones:
 *  - Hover: flota ligeramente y hace un pequeño scale.
 *  - Click: guiña un ojo y produce un rebote.
 *  - Idle: animación looping de respiración / flotación.
 * Futuras extensiones (ideas):
 *  - Sistema de estados (feliz, cansado, estudiando) basado en horario o progreso académico.
 *  - Mini tareas gamificadas (alimentar, personalizar accesorios).
 *  - Expresiones reactivas a eventos (nuevo anuncio, próxima clase en < X minutos).
 *  - Integrar almacenamiento de "estado emocional" en zustand + persist.
 *  - Micro misiones diarias ("revisa tus anuncios", "organiza tu horario").
 *  - Uso de Lottie o Canvas para animaciones más avanzadas.
 */
export function MascotCharacter() {
  const controls = useAnimation();
  const [wink, setWink] = useState(false);

  async function handleClick() {
    setWink(true);
    // Pequeña animación de rebote
    controls.start({
      y: [0, -10, 0],
      rotate: [0, -3, 3, 0],
      transition: { duration: 0.6, ease: "easeInOut" }
    });
    setTimeout(() => setWink(false), 600);
  }

  return (
    <motion.div
      className="relative select-none cursor-pointer"
      initial={{ y: 0, scale: 1 }}
      animate={controls}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      <motion.div
        aria-label="Ponti Avatar" role="img"
        className="relative flex items-center justify-center"
      >
        {/* Body mejorado con más profundidad */}
        <motion.svg
          width="96" height="96" viewBox="0 0 80 80"
          className="drop-shadow-lg"
          animate={{ y: [0, 3, 0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <motion.path
            d="M40 10c12 0 24 8 27 20 3 11-4 27-10 32s-11 6-17 6-11-1-17-6-13-21-10-32C16 18 28 10 40 10z"
            fill="url(#grad)"
          />
          <defs>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          {/* Eyes (simétricos). Ojo derecho realiza el guiño */}
          <motion.circle cx="30" cy="38" r={3} fill="#1e1e2e" />
          {wink ? (
            <motion.line
              x1="49" y1="38" x2="53" y2="38"
              stroke="#1e1e2e" strokeWidth={2} strokeLinecap="round"
              initial={{ scaleX: 0.2, opacity: 0.8 }}
              animate={{ scaleX: [0.2, 1, 0.6], opacity: [0.8, 1, 0.9] }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          ) : (
            <motion.circle cx="51" cy="38" r={3} fill="#1e1e2e" />
          )}
          {/* Mouth */}
          <path d="M32 50c3 4 13 4 16 0" stroke="#1e1e2e" strokeWidth={2} strokeLinecap="round" fill="none" />
        </motion.svg>
        {/* Glow mejorado con más capas */}
        <div className="absolute inset-0 -z-10 blur-2xl opacity-50 bg-[radial-gradient(circle_at_50%_55%,rgba(139,92,246,0.7),rgba(236,72,153,0.4),transparent_70%)]" />
        <div className="absolute inset-0 -z-20 blur-3xl opacity-30 bg-[radial-gradient(circle_at_50%_55%,rgba(99,102,241,0.5),transparent_70%)]" />
      </motion.div>
      {/* Badge mejorado */}
      <motion.div
        className="absolute -right-2 -bottom-2 text-[10px] px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg"
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent font-semibold">
          Beta
        </span>
      </motion.div>
    </motion.div>
  );
}
