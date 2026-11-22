// ../public/images/* (first build assets) -> public/img/*.webp: monochrome like the mockup, a few widths each.
import sharp from 'sharp';
import { mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, '..', 'public', 'images');
const out = join(root, 'public', 'img');
mkdirSync(join(out, 'partners'), { recursive: true });

const jobs = [
  // [source, name, widths, grayscale, extract?]
  ['hero.png', 'hero-1', [960, 1440], true],
  ['hero_consulting.jpg', 'hero-2', [960, 1376], true],
  ['retro_typewriter.jpg', 'hero-3', [960, 1200], true],
  ['retro_typewriter.jpg', 'desk', [700, 1200], true],
  ['advantages.png', 'planner', [438], true],
  ['client.png', 'client-1', [396], true],
  ['client_alexey.jpg', 'client-2', [480, 800], true],
  ['feedback_woman.jpg', 'client-3', [480, 800], true, { left: 0, top: 80, width: 896, height: 896 }],
  ['feedback.png', 'contact', [803], true],
  ['hero_consulting.jpg', 'bg-dark', [1280], true],
];

for (const [file, name, widths, gray, crop] of jobs) {
  for (const w of widths) {
    let p = sharp(join(src, file));
    if (crop) p = p.extract(crop);
    if (gray) p = p.grayscale();
    const dest = join(out, widths.length > 1 && w !== widths[widths.length - 1] ? `${name}-${w}.webp` : `${name}.webp`);
    await p.resize({ width: w, withoutEnlargement: true }).webp({ quality: name === 'bg-dark' ? 55 : 78 }).toFile(dest);
    console.log(dest.replace(root, ''));
  }
}
for (const f of readdirSync(join(src, 'partners'))) copyFileSync(join(src, 'partners', f), join(out, 'partners', f));
// the logo is a vector exported from Figma (public/img/logo.svg), not copied from the first build
