import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Plus, X, ChevronRight, Columns2, RefreshCw, Zap } from 'lucide-react';

const root = path.resolve(import.meta.dirname, '../../../..');
const iconDir = path.join(root, 'src/assets/relay-icons');
const output = path.join(root, 'design/archive/relay5-concepts/original-icons/relay-interaction-icon-comparison.svg');
const vectorMaster = path.join(root, 'design/archive/relay5-concepts/original-icons/relay-interaction-icons-revised-source.svg');
const rows = [
  { file: 'start-session', label: 'Start terminal session', place: 'New tab · tab strip', lucide: Plus },
  { file: 'close-session', label: 'Close session', place: 'Session / dialog close', lucide: X },
  { file: 'navigate-next', label: 'Next / breadcrumb', place: 'Workbench navigation', lucide: ChevronRight },
  { file: 'split-terminal', label: 'Split terminal panes', place: 'Split terminal control', lucide: Columns2 },
  { file: 'refresh-processes', label: 'Refresh processes', place: 'Processes refresh button', lucide: RefreshCw },
  { file: 'command-prompt', label: 'Run command', place: 'Saved action category', lucide: Zap },
];
const colors = {
  board: '#f3f6f8', ink: '#172635', muted: '#607484', line: '#d6dfe6',
  light: '#eaf0f5', lightInk: '#243441', lightMuted: '#526978',
  dark: '#1c2835', darkInk: '#e0e8ef', darkMuted: '#a7b6c4',
  accent: '#356d9b', darkAccent: '#93b8dd',
};
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function lucideGlyph(Icon, color) {
  const markup = renderToStaticMarkup(React.createElement(Icon, {
    size: 24, strokeWidth: 1.7, color,
    strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  }));
  return markup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replaceAll('currentColor', color);
}

function productionGlyph(svg, color) {
  const afterTitle = svg.slice(svg.indexOf('</title>') + '</title>'.length);
  const nested = afterTitle.slice(0, afterTitle.lastIndexOf('</svg>'));
  if (!nested.startsWith('<svg')) throw new Error('Expected the production 24px viewBox asset to contain the VectorCraft path group.');
  return nested.replace(/stroke="(?:#8fa7ba|currentColor)"/g, `stroke="${color}"`).replace(/ data-name="[^"]*"/g, '');
}

function text(x, y, value, size = 13, color = colors.muted, weight = 400, extra = '') {
  return `<text x="${x}" y="${y}" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${esc(value)}</text>`;
}
function useGlyph(body, x, y, size, color) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
function customGlyph(body, x, y, size, color) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" style="color:${color}">${body}</svg>`;
}

const assets = new Map();
for (const row of rows) assets.set(row.file, await readFile(path.join(iconDir, `${row.file}.svg`), 'utf8'));

const W = 1680, H = 1280;
const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`];
out.push(`<rect width="${W}" height="${H}" fill="${colors.board}"/>`);
out.push(`<rect width="${W}" height="206" fill="#142230"/>`);
out.push(text(48, 52, 'RELAY 5  /  SWITCHLINE', 12, '#a7b6c4', 650, 'letter-spacing="2"'));
out.push(text(48, 105, 'Interaction icon review', 32, '#f3f6f8', 650, 'letter-spacing="-.7"'));
out.push(text(48, 143, 'Six function-first replacements · actual 24 px production geometry · reviewed at 16, 20 and 24 px', 15, '#b9c8d4', 400));
out.push(text(48, 178, 'ORIGINAL LUCIDE  /  CURRENT RELAY ASSET  /  HARBOR + PORCELAIN CONTRAST', 11, '#91a5b5', 600, 'letter-spacing="1.1"'));

const xFunction = 48, xLucide = 365, xLight = 564, xDark = 1120;
out.push(text(xFunction, 244, 'FUNCTION  /  PLACEMENT', 11, colors.muted, 650, 'letter-spacing=".9"'));
out.push(text(xLucide, 244, 'LUCIDE · ORIGINAL', 11, colors.muted, 650, 'letter-spacing=".9"'));
out.push(text(xLight, 244, 'RELAY · PORCELAIN LIGHT', 11, colors.muted, 650, 'letter-spacing=".9"'));
out.push(text(xDark, 244, 'RELAY · HARBOR DARK', 11, colors.muted, 650, 'letter-spacing=".9"'));
out.push(`<path d="M48 260 H1632" stroke="${colors.line}"/>`);

const rowTop = 270, rowH = 134;
for (let i = 0; i < rows.length; i++) {
  const row = rows[i], y = rowTop + i * rowH;
  const bg = i % 2 ? '#f7f9fa' : '#ffffff';
  out.push(`<rect x="48" y="${y}" width="1584" height="124" rx="10" fill="${bg}" stroke="${colors.line}"/>`);
  out.push(text(xFunction + 14, y + 46, row.label, 16, colors.ink, 650));
  out.push(text(xFunction + 14, y + 74, row.place, 12, colors.muted));
  out.push(text(xFunction + 14, y + 100, '24 px master · 2 px round stroke', 10, '#7d8e9b', 500));

  const lucide = lucideGlyph(row.lucide, colors.lightMuted);
  out.push(`<rect x="${xLucide + 34}" y="${y + 25}" width="68" height="68" rx="9" fill="${colors.light}"/>`);
  out.push(useGlyph(lucide, xLucide + 56, y + 47, 24, colors.lightMuted));
  out.push(text(xLucide + 112, y + 55, 'Lucide', 12, colors.ink, 600));
  out.push(text(xLucide + 112, y + 76, '24 px · stroke 1.7', 10, colors.muted));

  const bodyLight = productionGlyph(assets.get(row.file), colors.lightMuted);
  const bodyDark = productionGlyph(assets.get(row.file), colors.darkMuted);
  const sizes = [16, 20, 24];
  for (let s = 0; s < sizes.length; s++) {
    const size = sizes[s];
    const bx = xLight + s * 164;
    out.push(`<rect x="${bx}" y="${y + 17}" width="148" height="90" rx="8" fill="${colors.light}"/>`);
    out.push(customGlyph(bodyLight, bx + 74 - size / 2, y + 35, size, colors.lightMuted));
    out.push(text(bx + 74, y + 84, `${size} px`, 11, colors.lightInk, 600, 'text-anchor="middle"'));
    const dx = xDark + s * 164;
    out.push(`<rect x="${dx}" y="${y + 17}" width="148" height="90" rx="8" fill="${colors.dark}"/>`);
    out.push(customGlyph(bodyDark, dx + 74 - size / 2, y + 35, size, colors.darkMuted));
    out.push(text(dx + 74, y + 84, `${size} px`, 11, colors.darkInk, 600, 'text-anchor="middle"'));
  }
  out.push(`<path d="M48 ${y + 132} H1632" stroke="${colors.line}"/>`);
}

const statesY = rowTop + rows.length * rowH + 18;
out.push(text(48, statesY, 'CONTROL STATES', 11, colors.muted, 650, 'letter-spacing=".9"'));
out.push(text(48, statesY + 22, 'Same production mask; the existing control tokens supply state color and disabled opacity.', 12, colors.ink, 400));
const stateSets = [
  { label: 'NORMAL', color: colors.lightMuted, fill: '#ffffff', opacity: 1 },
  { label: 'HOVER', color: colors.lightInk, fill: '#ffffff', opacity: 1 },
  { label: 'SELECTED', color: colors.accent, fill: '#ffffff', opacity: 1 },
  { label: 'DISABLED', color: colors.lightMuted, fill: '#ffffff', opacity: .35 },
  { label: 'HARBOR NORMAL', color: colors.darkMuted, fill: colors.dark, opacity: 1 },
  { label: 'HARBOR SELECTED', color: colors.darkAccent, fill: '#27313d', opacity: 1 },
];
const splitBody = productionGlyph(assets.get('split-terminal'), 'currentColor');
for (let i = 0; i < stateSets.length; i++) {
  const item = stateSets[i], x = 48 + i * 264;
  out.push(`<rect x="${x}" y="${statesY + 34}" width="244" height="54" rx="8" fill="${item.fill}" stroke="${colors.line}"/>`);
  out.push(`<svg x="${x + 14}" y="${statesY + 49}" width="24" height="24" viewBox="0 0 24 24" style="color:${item.color};opacity:${item.opacity}">${splitBody}</svg>`);
  out.push(text(x + 52, statesY + 66, item.label, 10, colors.muted, 650, 'letter-spacing=".6"'));
}
out.push(text(48, H - 24, 'VectorCraft artwork → fixed 24 px production viewBox → FigCraft-imported specimen. Stock symbols rendered from the installed lucide-react package.', 11, '#748694', 400));
out.push('</svg>');

await writeFile(output, `${out.join('\n')}\n`, 'utf8');
console.log(output);

const MW = 1056, MH = 546, tileW = 326, tileH = 178, gapX = 18, gapY = 18;
const master = [`<svg xmlns="http://www.w3.org/2000/svg" width="${MW}" height="${MH}" viewBox="0 0 ${MW} ${MH}">`];
master.push(`<rect width="${MW}" height="${MH}" fill="#f3f6f8"/>`, `<rect width="${MW}" height="100" fill="#142230"/>`);
master.push(text(30, 36, 'RELAY 5  /  INTERACTION GLYPHS', 11, '#a7b6c4', 650, 'letter-spacing="1.7"'));
master.push(text(30, 73, 'Editable 24 px master artwork', 24, '#f3f6f8', 650));
for (let i = 0; i < rows.length; i++) {
  const row = rows[i], col = i % 3, line = Math.floor(i / 3);
  const x = 30 + col * (tileW + gapX), y = 116 + line * (tileH + gapY);
  const body = productionGlyph(assets.get(row.file), '#8fa7ba');
  master.push(`<rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" rx="12" fill="#ffffff" stroke="#d6dfe6"/>`);
  master.push(`<svg x="${x + 18}" y="${y + 18}" width="72" height="72" viewBox="0 0 24 24" fill="none">${body}</svg>`);
  master.push(text(x + 108, y + 46, row.label, 16, colors.ink, 650));
  master.push(text(x + 108, y + 72, row.place, 12, colors.muted, 400));
  master.push(text(x + 108, y + 101, '24 × 24 canvas  /  2 px round stroke', 10, '#7d8e9b', 500));
  master.push(text(x + 18, y + 151, `VECTORCRAFT PATH   ·   ${row.file.toUpperCase()}`, 9, '#7d8e9b', 600, 'letter-spacing=".5"'));
}
master.push('</svg>');
await writeFile(vectorMaster, `${master.join('\n')}\n`, 'utf8');
console.log(vectorMaster);
