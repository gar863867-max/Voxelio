import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(root, '1.html');
const gamedataPath = path.join(root, '..', 'gamedata.js');
const bundlePath = path.join(root, 'quantum-bundle.js');

let html = fs.readFileSync(htmlPath, 'utf8');
let gd = fs.readFileSync(gamedataPath, 'utf8');
const cut = gd.indexOf('games.sort');
if (cut > 0) gd = gd.slice(0, cut);
gd = gd.replace('const games', 'window.games', 1).trim() + '\n';

const bundle = fs.existsSync(bundlePath) ? fs.readFileSync(bundlePath, 'utf8') : '';
const inject = `<script>\n${gd}\n</script>\n<script>\n${bundle}\n</script>\n`;

const lucideTag = '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>';
if (html.includes('window.games =') && html.includes('QuantumExtras')) {
  console.log('Already merged — skipping duplicate inject');
  process.exit(0);
}
if (!html.includes(lucideTag)) {
  console.error('Lucide script tag not found');
  process.exit(1);
}
html = html.replace(lucideTag, inject + lucideTag);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Merged into 1.html');
