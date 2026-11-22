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

// ---- vertical lockup for the narrow (phone) header: PSB on top, a thin rule, then BUSINESS / CONSULTING
// set to exactly the width of PSB, so the tile stays narrow and the descriptor stays legible.
{
  const P = 4, size = 64, cap = size * 0.727;
  const top = P + cap;                                            // PSB baseline
  const w = line(heavy, 'PSB', size, 0.02, 0, 0).end;             // measure first
  const psbV = line(heavy, 'PSB', size, 0.02, P, r2(top));
  const ruleY = r2(top + 11);
  // descriptor: size so that "CONSULTING" (with its tracking) spans the PSB width
  const tr = 0.06, unit = line(light, 'CONSULTING', 10, tr, 0, 0).end / 10;
  const dSize = r2(w / unit), dCap = dSize * 0.727, gapV = dSize * 0.55;
  const b1 = r2(ruleY + 2 + 9 + dCap), b2 = r2(b1 + gapV + dCap);
  const busW = line(light, 'BUSINESS', dSize, tr, 0, 0).end;
  const busTr = tr + (w - busW) / (dSize * 7);                    // spread BUSINESS to the same width
  const d1 = line(light, 'BUSINESS', dSize, busTr, P, b1);
  const d2 = line(light, 'CONSULTING', dSize, tr, P, b2);
  const WV = Math.ceil(w + 2 * P), HV = Math.ceil(b2 + P + 1);
  const svgV = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WV} ${HV}" fill="none" role="img" aria-label="PSB Business Consulting">
<path d="${psbV.d}" fill="${INK}"/>
<rect x="${P}" y="${ruleY}" width="${r2(w)}" height="2" fill="${INK}"/>
<path d="${d1.d}${d2.d}" fill="${INK}"/>
</svg>
`;
  writeFileSync(join(root, 'public', 'img', 'logo-v.svg'), svgV);
  console.log(`public/img/logo-v.svg  ${svgV.length} bytes  viewBox ${WV}x${HV}  descriptor ${dSize}`);
}
