// Business logo -> public/img/logo.svg (all vector: lettering converted to outlines from Inter).
// Horizontal lockup: a heavy "PSB" wordmark, a thin vertical divider, and a two-line descriptor
// "BUSINESS / CONSULTING" in a light weight. Single ink colour, made to sit on the yellow column.
import opentype from 'opentype.js';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const font = (fam, w) => opentype.loadSync(join(root, 'node_modules', '@fontsource', fam, 'files', `${fam}-latin-${w}-normal.woff`));
const heavy = font('inter', 700);
const light = font('inter', 400);

const INK = '#0f0f0e';
const r2 = (n) => Math.round(n * 100) / 100;

/** Outline a line of text starting at x with extra letter spacing (em fraction). */
function line(f, str, size, tracking, x, baseline) {
  const track = size * tracking;
  const glyphs = f.stringToGlyphs(str);
  const parts = [];
  glyphs.forEach((g, i) => {
    parts.push(g.getPath(x, baseline, size).toPathData(2));
    x += (g.advanceWidth * size) / f.unitsPerEm + (i < glyphs.length - 1 ? track : 0);
  });
  return { d: parts.filter(Boolean).join(''), end: x };
}

const H = 80, PAD = 2;
// ---- PSB: cap height of Inter ≈ .727em, baseline so the caps sit centred in the 80-unit box
const psbSize = 58, capPSB = psbSize * 0.727;
const psbBase = r2(H / 2 + capPSB / 2);
const psb = line(heavy, 'PSB', psbSize, 0.02, PAD, psbBase);

// ---- divider
const gap = 17;
const divX = r2(psb.end + gap);
const divider = `<rect x="${divX}" y="${r2(H / 2 - 27)}" width="2.2" height="54" fill="${INK}"/>`;

// ---- descriptor: two lines, caps centred on the same axis as PSB
const tSize = 17.5, capT = tSize * 0.727, lead = 9.5;              // gap between the two cap rows
const top = H / 2 - (capT * 2 + lead) / 2;
const tx = divX + 2.2 + gap;
const l1 = line(light, 'BUSINESS', tSize, 0.1, tx, r2(top + capT));
const l2 = line(light, 'CONSULTING', tSize, 0.1, tx, r2(top + capT * 2 + lead));

const W = Math.ceil(Math.max(l1.end, l2.end) + PAD);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" role="img" aria-label="PSB Business Consulting">
<path d="${psb.d}" fill="${INK}"/>
${divider}
<path d="${l1.d}${l2.d}" fill="${INK}"/>
</svg>
`;
writeFileSync(join(root, 'public', 'img', 'logo.svg'), svg);
console.log(`public/img/logo.svg  ${svg.length} bytes  viewBox ${W}x${H}`);
