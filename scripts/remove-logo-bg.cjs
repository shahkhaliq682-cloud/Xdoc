const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const inputPath = path.join(__dirname, '../public/logo.png');
const outputPath = path.join(__dirname, '../public/logo.png');

console.log('Reading JPEG bytes from pseudo-png path:', inputPath);

try {
  const jpegBuffer = fs.readFileSync(inputPath);
  console.log('Successfully read file bytes. Decoding as JPEG...');
  
  const rawImageData = jpeg.decode(jpegBuffer, { useTString: false });
  const width = rawImageData.width;
  const height = rawImageData.height;
  const data = rawImageData.data; // Flat RGBA buffer
  
  console.log(`JPEG decoded successfully. Width: ${width}, Height: ${height}. Total bytes: ${data.length}`);
  
  // Flood fill to mark background pixels
  const visited = new Uint8Array(width * height);
  const isBackground = new Uint8Array(width * height);
  const queue = [];
  
  function push(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    
    const rIdx = idx * 4;
    const r = data[rIdx];
    const g = data[rIdx + 1];
    const b = data[rIdx + 2];
    
    // Check if color is very close to white (allow a loose threshold to be safe with JPEG compression artifacts)
    if (r > 205 && g > 205 && b > 205) {
      isBackground[idx] = 1;
      queue.push([x, y]);
    }
  }
  
  console.log('Seeding flood-fill from borders...');
  // Seed BFS with outer borders to traverse only external backgrounds
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  
  // BFS traversal
  let backgroundCount = 0;
  while (queue.length > 0) {
    const [currX, currY] = queue.shift();
    backgroundCount++;
    
    const neighbors = [
      [currX + 1, currY],
      [currX - 1, currY],
      [currX, currY + 1],
      [currX, currY - 1]
    ];
    
    for (const [nx, ny] of neighbors) {
      push(nx, ny);
    }
  }
  
  console.log(`Flood-fill completed. Found ${backgroundCount} background pixels.`);
  
  // Apply alpha reconstruction to the identified background area
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const rIdx = idx * 4;
      
      if (isBackground[idx]) {
        const r = data[rIdx];
        const g = data[rIdx + 1];
        const b = data[rIdx + 2];
        
        const minVal = Math.min(r, g, b);
        
        // If it's pure white, or extremely close (JPEG artifacts), make it fully transparent
        if (minVal >= 250) {
          data[rIdx] = 0;
          data[rIdx + 1] = 0;
          data[rIdx + 2] = 0;
          data[rIdx + 3] = 0;
        } else {
          // Unmultiply back relative to solid white background
          const a = 1.0 - (minVal / 255.0);
          if (a > 0.01) {
            data[rIdx] = Math.max(0, Math.min(255, Math.round((r - (1.0 - a) * 255) / a)));
            data[rIdx + 1] = Math.max(0, Math.min(255, Math.round((g - (1.0 - a) * 255) / a)));
            data[rIdx + 2] = Math.max(0, Math.min(255, Math.round((b - (1.0 - a) * 255) / a)));
            data[rIdx + 3] = Math.max(0, Math.min(255, Math.round(a * 255)));
          } else {
            data[rIdx + 3] = 0;
          }
        }
      }
    }
  }
  
  // Package modified RGBA data into a standard transparent PNG
  console.log('Encoding to PNG and writing to:', outputPath);
  const png = new PNG({ width, height });
  png.data = data;
  
  png.pack()
    .pipe(fs.createWriteStream(outputPath))
    .on('finish', () => {
      console.log('SUCCESS: Created fully transparent, pixel-perfect PNG at', outputPath);
    })
    .on('error', (err) => {
      console.error('CRITICAL: Error during PNG write:', err);
    });
} catch (error) {
  console.error('CRITICAL: Failed to process background logo conversion:', error);
}
