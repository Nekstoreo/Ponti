"use client";

import { usePathname } from "next/navigation";

export interface PageNavigationConfig {
  showPageHeader: boolean;
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
}

export function usePageNavigation(): PageNavigationConfig {
  const pathname = usePathname();

  // Si pathname es null, mostrar configuración por defecto
  if (!pathname) {
    return {
      showPageHeader: true,
      title: "Ponti",
      showBackButton: true,
    };
  }

  // Páginas principales accesibles desde la barra inferior - NO necesitan PageHeader
  const mainPages = ["/", "/horario", "/mapa", "/mas"];

  // Verificar si es una página principal (coincidencia exacta)
  const isMainPage = mainPages.includes(pathname);

  // Si es una página principal, no mostrar PageHeader
  if (isMainPage) {
    return {
      showPageHeader: false,
    };
  }

  // Configuración específica por página
  const pageConfigs: Record<string, PageNavigationConfig> = {
    "/login": {
      showPageHeader: false, // El login maneja su propia navegación
    },
    "/bienestar": {
      showPageHeader: true,
  title: "Centro de Apoyo y Bienestar",
      showBackButton: true,
      backTo: "/mas",
    },
    "/bienestar/mood-tracker": {
      showPageHeader: true,
      title: "Rastreador de Ánimo",
      showBackButton: true,
      backTo: "/bienestar",
    },
    "/calificaciones": {
      showPageHeader: true,
      title: "Calificaciones",
      showBackButton: true,
      backTo: "/mas",
    },
    "/noticias": {
      showPageHeader: true,
      title: "Noticias y Anuncios",
      showBackButton: true,
      backTo: "/mas",
    },
    "/perfil": {
      showPageHeader: true,
      title: "Perfil de Usuario",
      showBackButton: true,
      backTo: "/mas",
    },
    "/servicios": {
      showPageHeader: true,
      title: "Directorio de Servicios",
      showBackButton: true,
      backTo: "/mas",
    },
    "/notificaciones": {
      showPageHeader: true,
      title: "Notificaciones",
      showBackButton: true,
      backTo: "/mas",
    },
    "/configuracion-offline": {
      showPageHeader: true,
      title: "Configuración Offline",
      showBackButton: true,
      backTo: "/mas",
    },
  };

  // Verificar rutas dinámicas
  if (pathname.startsWith("/calificaciones/")) {
    return {
      showPageHeader: true,
      title: "Detalle de Calificación",
      showBackButton: true,
      backTo: "/calificaciones",
    };
  }

  if (pathname.startsWith("/noticias/")) {
    return {
      showPageHeader: true,
      title: "Detalle de Noticia",
      showBackButton: true,
      backTo: "/noticias",
    };
  }

  if (pathname.startsWith("/servicios/")) {
    return {
      showPageHeader: true,
      title: "Detalle de Servicio",
      showBackButton: true,
      backTo: "/servicios",
    };
  }

  if (pathname.startsWith("/horario/compartir")) {
    return {
      showPageHeader: true,
      title: "Compartir Horario",
      showBackButton: true,
      backTo: "/horario",
    };
  }

  // Configuración por defecto para páginas no configuradas
  return pageConfigs[pathname] || {
    showPageHeader: true,
    title: "Ponti",
    showBackButton: true,
  };
}
