import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationManager } from "@/components/notifications/NotificationManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ponti - Tu Compañero de Carrera Digital",
  description: "Aplicación universitaria integral para estudiantes - Horarios, Calificaciones, Mapa Campus, Bienestar y más",
  keywords: ["universidad", "estudiantes", "horarios", "calificaciones", "campus", "bienestar", "educacion"],
  authors: [{ name: "Ponti Team" }],
  creator: "Ponti",
  publisher: "Ponti",
  robots: "index, follow",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  colorScheme: "light",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ponti",
  },
  openGraph: {
    type: "website",
    siteName: "Ponti",
    title: "Ponti - Tu Compañero de Carrera Digital",
    description: "Aplicación universitaria integral para estudiantes",
    locale: "es_ES",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Ponti",
    "apple-mobile-web-app-title": "Ponti",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#3b82f6",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <NotificationManager />
      </body>
    </html>
  );
}
