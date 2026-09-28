const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const baseDir = path.join(process.cwd(), 'icons');

function createPNG(size) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  function crc32(buf) {
    let crc = 0xffffffff;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
    return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = size * 3;
  const raw = Buffer.alloc((1 + rowSize) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (1 + rowSize)] = 0; // filter byte
    for (let x = 0; x < size; x++) {
      const off = y * (1 + rowSize) + 1 + x * 3;
      raw[off]     = 0x25; // R  (#2563eb blue)
      raw[off + 1] = 0x63; // G
      raw[off + 2] = 0xeb; // B
    }
  }
  const compressed = zlib.deflateSync(raw);

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

[16, 32, 48, 128].forEach(s => {
  const filePath = path.join(baseDir, `icon${s}.png`);
  fs.writeFileSync(filePath, createPNG(s));
  console.log('Created', filePath);
});
