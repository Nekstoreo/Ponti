"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import { useAuthStore } from "@/store/authStore";
import { BookOpen, Map, Bell, Calendar, Heart } from "lucide-react";

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: <BookOpen className="w-12 h-12 text-primary" />,
    title: "Todo tu campus en un solo lugar",
    description: "Accede a tu horario, mapa y toda la información que necesitas fácilmente."
  },
  {
    icon: <Calendar className="w-12 h-12 text-primary" />,
    title: "Organiza tu día académico",
    description: "Visualiza tus clases, exámenes y entrega de trabajos en un solo lugar."
  },
  {
    icon: <Bell className="w-12 h-12 text-primary" />,
    title: "Mantente al día con anuncios",
    description: "Recibe notificaciones importantes sobre tus clases y eventos del campus."
  },
  {
    icon: <Heart className="w-12 h-12 text-primary" />,
    title: "Cuida tu bienestar emocional",
    description: "Accede a recursos de salud mental, herramientas de autorregulación y apoyo psicológico profesional."
  },
  {
    icon: <Map className="w-12 h-12 text-primary" />,
    title: "Navega por tu universidad",
    description: "Encuentra fácilmente las aulas y lugares importantes del campus."
  }
];

export default function OnboardingCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  // Configurar gestos de deslizamiento
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeSlide < slides.length - 1) {
        setActiveSlide(activeSlide + 1);
      }
    },
    onSwipedRight: () => {
      if (activeSlide > 0) {
        setActiveSlide(activeSlide - 1);
      }
    },
    trackMouse: false
  });

  // Efecto para hacer scroll al slide activo
  useEffect(() => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: activeSlide * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [activeSlide]);

  const finishOnboarding = () => {
    completeOnboarding();
    // Después del onboarding, redirigimos al dashboard
    router.replace('/');
  };

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Carrusel */}
      <div 
        ref={carouselRef}
        className="flex-1 flex overflow-hidden" 
        {...handlers.ref}
      >
        {slides.map((slide, index) => (
          <div 
            key={index}
            className="min-w-full flex flex-col items-center justify-center px-6"
          >
            <div className="flex flex-col items-center justify-center gap-8 max-w-xs text-center">
              {activeSlide === index && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  {slide.icon}
                </motion.div>
              )}
              
              {activeSlide === index && (
                <motion.div 
                  className="space-y-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h2 className="text-xl font-bold">{slide.title}</h2>
                  <p className="text-sm text-muted-foreground">{slide.description}</p>
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores de slides */}
      <div className="flex justify-center gap-2 py-8">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`h-2 rounded-full transition-all ${
              activeSlide === index ? "w-6 bg-primary" : "w-2 bg-primary/30"
            }`}
            whileTap={{ scale: 0.9 }}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Botón de acción */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={activeSlide === slides.length - 1 ? 'final' : 'next'}
        >
          {activeSlide === slides.length - 1 ? (
            <motion.button
              onClick={finishOnboarding}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Comenzar a usar Ponti
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setActiveSlide(activeSlide + 1)}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Siguiente
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
