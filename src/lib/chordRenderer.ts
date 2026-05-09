const STRINGS = 6;
const FRETS = 4;
const SS = 14; // string spacing
const FS = 18; // fret spacing
const GL = 18; // grid left
const GT = 40; // grid top
const DR = 5;  // dot radius
const W = GL + SS * (STRINGS - 1) + 22;
const H = GT + FS * FRETS + 16;

export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
  midi: number[];
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderChordSVG(name: string, pos: ChordPosition): string {
  const parts: string[] = [];

  // Chord name
  parts.push(`<text x="${W / 2}" y="13" text-anchor="middle" font-size="11" font-weight="bold" font-family="sans-serif" fill="currentColor">${esc(name)}</text>`);

  // Nut (thick) or fret marker
  const nutW = pos.baseFret === 1 ? 4 : 1.5;
  parts.push(`<line x1="${GL}" y1="${GT}" x2="${GL + SS * (STRINGS - 1)}" y2="${GT}" stroke="currentColor" stroke-width="${nutW}" stroke-linecap="round"/>`);

  if (pos.baseFret > 1) {
    parts.push(`<text x="${GL + SS * (STRINGS - 1) + 5}" y="${GT + FS * 0.65}" font-size="9" font-family="sans-serif" fill="currentColor" fill-opacity="0.7">${pos.baseFret}fr</text>`);
  }

  // Fret lines
  for (let f = 1; f <= FRETS; f++) {
    const y = GT + f * FS;
    parts.push(`<line x1="${GL}" y1="${y}" x2="${GL + SS * (STRINGS - 1)}" y2="${y}" stroke="currentColor" stroke-opacity="0.35" stroke-width="1"/>`);
  }

  // String lines
  for (let s = 0; s < STRINGS; s++) {
    const x = GL + s * SS;
    parts.push(`<line x1="${x}" y1="${GT}" x2="${x}" y2="${GT + FS * FRETS}" stroke="currentColor" stroke-opacity="0.55" stroke-width="1"/>`);
  }

  // Open / muted markers above nut
  for (let s = 0; s < STRINGS; s++) {
    const x = GL + s * SS;
    const fret = pos.frets[s];
    if (fret === -1) {
      parts.push(`<text x="${x}" y="${GT - 6}" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.55">×</text>`);
    } else if (fret === 0) {
      parts.push(`<circle cx="${x}" cy="${GT - 9}" r="4" fill="none" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.5"/>`);
    }
  }

  // Barres (fret values are 1-indexed relative to diagram top)
  for (const barre of pos.barres) {
    const row = barre - 1;
    const y = GT + row * FS + FS / 2;
    const barreStrings = pos.frets
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => f === barre);
    if (barreStrings.length >= 2) {
      const x1 = GL + (barreStrings[0]?.i ?? 0) * SS;
      const x2 = GL + (barreStrings[barreStrings.length - 1]?.i ?? STRINGS - 1) * SS;
      parts.push(`<rect x="${x1 - DR}" y="${y - DR}" width="${x2 - x1 + DR * 2}" height="${DR * 2}" rx="${DR}" fill="currentColor"/>`);
    }
  }

  // Finger dots (fret values are 1-indexed relative to diagram top)
  for (let s = 0; s < STRINGS; s++) {
    const fret = pos.frets[s];
    if (fret > 0 && !pos.barres.includes(fret)) {
      const row = fret - 1;
      const x = GL + s * SS;
      const y = GT + row * FS + FS / 2;
      parts.push(`<circle cx="${x}" cy="${y}" r="${DR}" fill="currentColor"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Diagrama de ${esc(name)}">${parts.join('')}</svg>`;
}
