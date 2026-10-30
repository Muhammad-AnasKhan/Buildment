// Run on macOS: node desktop/scripts/sync-brand.mjs (frontend dependencies installed).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdirSync, copyFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const desktop = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const web = resolve(desktop, '../frontend');
const sharp = createRequire(join(web, 'package.json'))('sharp');
const source = join(web, 'public/logo.svg');
const assets = join(desktop, 'assets');
mkdirSync(assets, { recursive: true });
mkdirSync(join(desktop, 'src/assets'), { recursive: true });
copyFileSync(source, join(desktop, 'src/assets/edorax.svg'));
await sharp(source).resize(1024, 1024).png().toFile(join(assets, 'edorax.png'));
// macOS Dock artwork needs an inset; edge-to-edge artwork looks oversized.
async function macIcon(size) {
  const artworkSize = Math.round(size * 0.8);
  const inset = Math.floor((size - artworkSize) / 2);
  const artwork = await sharp(source).resize(artworkSize, artworkSize).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: '#00000000' } })
    .composite([{ input: artwork, left: inset, top: inset }]).png().toBuffer();
}
writeFileSync(join(assets, 'edorax-dock.png'), await macIcon(1024));
const temp = mkdtempSync(join(tmpdir(), 'edorax-icons-'));
try {
  const set = join(temp, 'Edorax.iconset');
  mkdirSync(set);
  for (const size of [16, 32, 128, 256, 512]) {
    for (const scale of [1, 2]) {
      writeFileSync(join(set, `icon_${size}x${size}${scale === 2 ? '@2x' : ''}.png`), await macIcon(size * scale));
    }
  }
  execFileSync('iconutil', ['-c', 'icns', set, '-o', join(assets, 'edorax.icns')]);
  const png = await sharp(source).resize(256, 256).png().toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
  writeFileSync(join(assets, 'edorax.ico'), Buffer.concat([header, png]));
} finally { rmSync(temp, { recursive: true, force: true }); }
