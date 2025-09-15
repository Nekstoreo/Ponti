#!/usr/bin/env tsx

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import toIco from 'to-ico';

// Configuración de tamaños de favicon
interface FaviconConfig {
  size: number;
  name: string;
  width?: number;
  height?: number;
}

const faviconSizes: FaviconConfig[] = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 144, name: 'favicon-144x144.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

// Tamaños adicionales para Windows
const windowsSizes: FaviconConfig[] = [
  { size: 70, name: 'mstile-70x70.png' },
  { size: 144, name: 'mstile-144x144.png' },
  { size: 150, name: 'mstile-150x150.png' },
  { size: 310, name: 'mstile-310x150.png', width: 310, height: 150 },
  { size: 310, name: 'mstile-310x310.png' },
];

const allSizes = [...faviconSizes, ...windowsSizes];

async function generateFavicons() {
  const inputPath = path.join(process.cwd(), 'public', 'cat.svg');
  const outputDir = path.join(process.cwd(), 'public', 'favicons');

  try {
    // Crear directorio de salida si no existe
    await fs.mkdir(outputDir, { recursive: true });

    console.log('🎨 Generando favicons desde cat.svg...\n');

    // Leer el archivo SVG
    const svgBuffer = await fs.readFile(inputPath);

    // Generar cada tamaño
    for (const config of allSizes) {
      const { size, name, width, height } = config;
      const outputPath = path.join(outputDir, name);

      console.log(`Generando ${name} (${width || size}x${height || size})`);

      await sharp(svgBuffer)
        .resize(width || size, height || size, {
          fit: 'contain',
          background: 'transparent'
        })
        .png()
        .toFile(outputPath);
    }

    // Generar favicon.ico real
    console.log('Generando favicon.ico (formato ICO real)');
    const icoPath = path.join(process.cwd(), 'public', 'favicon.ico');
    
    // Generar diferentes tamaños para el ICO
    const icoSizes = [16, 24, 32, 48];
    const icoBuffers: Buffer[] = [];
    
    for (const size of icoSizes) {
      const buffer = await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: 'transparent'
        })
        .png()
        .toBuffer();
      icoBuffers.push(buffer);
    }
    
    // Crear archivo ICO con múltiples tamaños
    const icoBuffer = await toIco(icoBuffers);
    await fs.writeFile(icoPath, icoBuffer);

    // Actualizar manifest.json
    await updateManifest();

    console.log('\n✅ Favicons generados exitosamente!');
    console.log(`📁 Ubicación: ${outputDir}`);
    console.log('🔧 Manifest.json actualizado');

  } catch (error) {
    console.error('❌ Error generando favicons:', error);
    process.exit(1);
  }
}

async function updateManifest() {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  
  try {
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    // Actualizar iconos en el manifest
    manifest.icons = [
      {
        "src": "/favicons/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/favicons/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ];

    // Configurar el tema si no existe
    if (!manifest.name) manifest.name = "Ponti";
    if (!manifest.short_name) manifest.short_name = "Ponti";
    if (!manifest.theme_color) manifest.theme_color = "#000000";
    if (!manifest.background_color) manifest.background_color = "#ffffff";
    if (!manifest.display) manifest.display = "standalone";
    if (!manifest.start_url) manifest.start_url = "/";

    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  } catch (error) {
    console.warn('⚠️ No se pudo actualizar manifest.json:', error);
  }
}

// Ejecutar el script
if (require.main === module) {
  generateFavicons();
}

export default generateFavicons;
