// Builds public/words.txt from the ENABLE word list (public domain).
// Usage: node scripts/build-words.mjs path/to/enable1.txt
// Source used: https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) {
  console.error('Usage: node scripts/build-words.mjs path/to/enable1.txt');
  process.exit(1);
}
const words = readFileSync(src, 'utf8')
  .split(/\r?\n/)
  .map((w) => w.trim().toLowerCase())
  .filter((w) => /^[a-z]{3,15}$/.test(w));
const unique = [...new Set(words)].sort();
writeFileSync(new URL('../public/words.txt', import.meta.url), unique.join('\n') + '\n');
console.log(`Wrote ${unique.length} words`);
