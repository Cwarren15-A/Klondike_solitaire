import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Buffer } from 'node:buffer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ICONS_DIR = join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!existsSync(ICONS_DIR)) {
  mkdirSync(ICONS_DIR, { recursive: true });
}

// Generate icons from a base image
async function generateIcons() {
  try {
    // Create a simple card icon as base
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#1e5128"/>
        <text x="256" y="256" font-family="Arial" font-size="200" fill="white" text-anchor="middle" dominant-baseline="middle">♠</text>
      </svg>
    `;

    // Generate favicon
    await sharp(Buffer.from(svg))
      .resize(32, 32)
      .png()
      .toFile(join(ICONS_DIR, 'favicon.png'));

    // Generate PWA icons
    await sharp(Buffer.from(svg))
      .resize(192, 192)
      .png()
      .toFile(join(ICONS_DIR, 'icon-192.png'));

    await sharp(Buffer.from(svg))
      .resize(512, 512)
      .png()
      .toFile(join(ICONS_DIR, 'icon-512.png'));

    // Generate new game icon
    await sharp(Buffer.from(svg))
      .resize(192, 192)
      .png()
      .toFile(join(ICONS_DIR, 'new-game.png'));

    console.log('✅ Icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons(); 