import { Metadata } from 'next';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

const defaultConfig = {
  title: 'Ponti - Tu Compañero de Carrera Digital',
  description: 'Aplicación universitaria integral para estudiantes - Horarios, Calificaciones, Mapa Campus, Bienestar y más',
  keywords: [
    'universidad', 'estudiantes', 'horarios', 'calificaciones', 'campus', 
    'bienestar', 'educacion', 'app universitaria', 'vida estudiantil'
  ],
  image: '/favicons/android-chrome-512x512.png',
  type: 'website' as const,
  baseUrl: 'https://ponti.app', // Cambiar por tu dominio real
};

function generateMetadata(config: SEOConfig): Metadata {
  const {
    title = defaultConfig.title,
    description = defaultConfig.description,
    keywords = defaultConfig.keywords,
    image = defaultConfig.image,
    url,
    type = defaultConfig.type,
    noIndex = false,
  } = config;

  const fullTitle = title === defaultConfig.title ? title : `${title} | Ponti`;
  const fullUrl = url ? `${defaultConfig.baseUrl}${url}` : defaultConfig.baseUrl;
  const fullImage = image.startsWith('http') ? image : `${defaultConfig.baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical: url || '/',
    },
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: fullTitle,
      description,
      type,
      url: fullUrl,
      siteName: 'Ponti',
      locale: 'es_ES',
      images: [
        {
          url: fullImage,
          width: 512,
          height: 512,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ponti_app', // Cambiar por tu handle de Twitter
      creator: '@ponti_app',
      title: fullTitle,
      description,
      images: [fullImage],
    },
  };
}

// Metadatos predefinidos para páginas comunes
export const pageMetadata = {
  home: generateMetadata({
    title: 'Ponti - Tu Compañero de Carrera Digital',
    description: 'Aplicación universitaria integral para estudiantes. Gestiona horarios, consulta calificaciones, navega el campus y cuida tu bienestar estudiantil.',
    url: '/',
  }),
  
  horario: generateMetadata({
    title: 'Horario de Clases',
    description: 'Consulta y gestiona tu horario de clases universitario. Organiza tu tiempo académico de manera eficiente.',
    keywords: ['horario', 'clases', 'calendario', 'agenda', 'horario universitario'],
    url: '/horario',
  }),

  calificaciones: generateMetadata({
    title: 'Calificaciones y Notas',
    description: 'Consulta tus calificaciones, notas parciales y rendimiento académico en tiempo real.',
    keywords: ['calificaciones', 'notas', 'rendimiento', 'académico', 'parciales'],
    url: '/calificaciones',
  }),

  mapa: generateMetadata({
    title: 'Mapa del Campus',
    description: 'Navega por el campus universitario con nuestro mapa interactivo. Encuentra aulas, laboratorios y servicios.',
    keywords: ['mapa', 'campus', 'navegación', 'ubicación', 'aulas', 'laboratorios'],
    url: '/mapa',
  }),

  bienestar: generateMetadata({
    title: 'Centro de Bienestar',
    description: 'Cuida tu bienestar mental y físico. Registra tu estado de ánimo y accede a recursos de apoyo estudiantil.',
    keywords: ['bienestar', 'salud mental', 'estado de ánimo', 'apoyo estudiantil'],
    url: '/bienestar',
  }),

  anuncios: generateMetadata({
    title: 'Anuncios y Comunicados',
    description: 'Mantente informado con los últimos anuncios, comunicados y noticias de tu universidad.',
    keywords: ['anuncios', 'comunicados', 'noticias', 'información', 'universidad'],
    url: '/anuncios',
  }),

  onboarding: generateMetadata({
    title: 'Configuración Inicial',
    description: 'Configura tu perfil y personaliza tu experiencia en Ponti.',
    url: '/onboarding',
    noIndex: true, // No indexar páginas de configuración
  }),
};

// Función para generar JSON-LD estructurado
export function generateJsonLd(type: 'Organization' | 'WebApplication' | 'MobileApplication') {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    name: 'Ponti',
    description: 'Aplicación universitaria integral para estudiantes',
    url: defaultConfig.baseUrl,
    logo: `${defaultConfig.baseUrl}/favicons/android-chrome-512x512.png`,
  };

  switch (type) {
    case 'Organization':
      return {
        ...baseSchema,
        '@type': 'Organization',
        sameAs: [
          // Agregar redes sociales cuando estén disponibles
          // 'https://twitter.com/ponti_app',
          // 'https://facebook.com/ponti_app',
        ],
      };

    case 'WebApplication':
      return {
        ...baseSchema,
        '@type': 'WebApplication',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      };

    case 'MobileApplication':
      return {
        ...baseSchema,
        '@type': 'MobileApplication',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Android, iOS',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      };

    default:
      return baseSchema;
  }
}
