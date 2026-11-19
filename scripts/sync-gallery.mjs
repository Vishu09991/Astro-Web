import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const directory = new URL('../public/images/gallery/', import.meta.url);
const names = readdirSync(directory, { withFileTypes: true })
  .filter(entry => entry.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(entry.name))
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
const paths = names.map(name => `/images/gallery/${encodeURIComponent(name)}`);
writeFileSync(fileURLToPath(new URL('../data/gallery-images.json', import.meta.url)), `${JSON.stringify(paths, null, 2)}\n`);
console.log(`Gallery: discovered ${paths.length} photographs.`);
