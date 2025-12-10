const fs = require('fs');
const path = require('path');

// Copy index.html to 404.html for SPA routing on Render
const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');
const notFoundPath = path.join(buildDir, '404.html');

try {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✅ Successfully created 404.html for SPA routing');
} catch (error) {
  console.error('❌ Error creating 404.html:', error.message);
  process.exit(1);
}
