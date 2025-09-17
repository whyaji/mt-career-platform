import fs from 'fs';
import path from 'path';

// Function to generate asset manifest
function generateManifest() {
  const assetsDir = path.resolve('../public/assets');

  if (!fs.existsSync(assetsDir)) {
    console.error('Assets directory not found. Please run build first.');
    process.exit(1);
  }

  const manifest = {};

  // Find CSS file
  const cssFiles = fs
    .readdirSync(assetsDir)
    .filter((file) => file.startsWith('index-') && file.endsWith('.css'));
  if (cssFiles.length > 0) {
    manifest['index.css'] = cssFiles[0];
  }

  // Find JS file
  const jsFiles = fs
    .readdirSync(assetsDir)
    .filter((file) => file.startsWith('index-') && file.endsWith('.js'));
  if (jsFiles.length > 0) {
    manifest['index.js'] = jsFiles[0];
  }

  // Load existing manifest to preserve PWA data
  const manifestPath = path.resolve('../public/assets/manifest.json');

  // Write merged manifest file
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('Manifest generated:', manifest);
}

generateManifest();
