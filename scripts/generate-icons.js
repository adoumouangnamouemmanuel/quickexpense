// Generate minimal valid PNG placeholder icons for PWA
const fs = require('fs');
const path = require('path');

// Minimal valid 1×1 purple PNG (raw bytes)
// This is a proper tiny PNG that passes manifest validation
const PNG_BYTES = Buffer.from([
  0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a, // PNG signature
  0x00,0x00,0x00,0x0d,                       // IHDR length
  0x49,0x48,0x44,0x52,                       // IHDR
  0x00,0x00,0x00,0x01,                       // width=1
  0x00,0x00,0x00,0x01,                       // height=1
  0x08,0x02,                                 // bit depth=8, color type=2 (RGB)
  0x00,0x00,0x00,                            // compression, filter, interlace
  0x90,0x77,0x53,0xde,                       // CRC
  0x00,0x00,0x00,0x0c,                       // IDAT length
  0x49,0x44,0x41,0x54,                       // IDAT
  0x08,0xd7,0x63,0x5c,0x58,0x54,0x00,0x00,  // zlib + RGB (7c,3a,ed = purple)
  0x00,0x04,0x00,0x01,
  0x27,0x05,0x44,0x0e,                       // CRC
  0x00,0x00,0x00,0x00,                       // IEND length
  0x49,0x45,0x4e,0x44,                       // IEND
  0xae,0x42,0x60,0x82,                       // CRC
]);

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), PNG_BYTES);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), PNG_BYTES);
console.log('Created placeholder PWA icons');
