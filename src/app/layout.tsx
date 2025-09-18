import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import { StructuredData } from "@/components/seo/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    default: "Ponti - Tu Compañero de Carrera Digital",
    template: "%s | Ponti"
  },
  description: "Aplicación universitaria integral para estudiantes - Horarios, Calificaciones, Mapa Campus, Bienestar y más",
  keywords: [
    "universidad", "estudiantes", "horarios", "calificaciones", "campus", 
    "bienestar", "educacion", "app universitaria", "vida estudiantil",
    "gestión académica", "mapa campus", "calendario estudiantil"
  ],
  authors: [{ name: "Ponti Team", url: "https://ponti.app" }],
  creator: "Ponti",
  publisher: "Ponti",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ponti.app'), // Cambiar por tu dominio real
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ponti",
    startupImage: [
      {
        url: "/favicons/apple-touch-icon.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "Ponti",
    title: "Ponti - Tu Compañero de Carrera Digital",
    description: "Aplicación universitaria integral para estudiantes - Horarios, Calificaciones, Mapa Campus, Bienestar y más",
    locale: "es_ES",
    url: "https://ponti.app", // Cambiar por tu dominio real
    images: [
      {
        url: "/favicons/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Ponti - App Universitaria",
      },
      {
        url: "/favicons/android-chrome-192x192.png",
        width: 192,
        height: 192,
        alt: "Ponti - App Universitaria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ponti_app", // Cambiar por tu handle de Twitter
    creator: "@ponti_app",
    title: "Ponti - Tu Compañero de Carrera Digital",
    description: "Aplicación universitaria integral para estudiantes",
    images: ["/favicons/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Ponti",
    "apple-mobile-web-app-title": "Ponti",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-TileImage": "/favicons/mstile-144x144.png",
    "msapplication-square70x70logo": "/favicons/mstile-70x70.png",
    "msapplication-square150x150logo": "/favicons/mstile-150x150.png",
    "msapplication-wide310x150logo": "/favicons/mstile-310x150.png",
    "msapplication-square310x310logo": "/favicons/mstile-310x310.png",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <StructuredData type="WebApplication" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <NotificationManager />
      </body>
    </html>
  );
}
