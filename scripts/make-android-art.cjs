// Renders the Android launcher icons and splash screens from the game's SVG art.
// Needs Playwright (pre-installed in Claude's environment). Usage: node scripts/make-android-art.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RES = path.join(ROOT, 'android/app/src/main/res');
const BG = '#10202a';
const icon = fs.readFileSync(path.join(ROOT, 'public/icons/icon.svg'), 'utf8');
const inner = icon.replace(/^[\s\S]*?<rect width="512" height="512"[^>]*\/>/, '').replace(/<\/svg>\s*$/, '');
const fg = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g transform="translate(256 256) scale(${scale}) translate(-256 -262)">${inner}</g></svg>`;
const round = icon.replace('rx="110"', 'rx="256"');

const DENS = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

async function render(page, svg, w, h, out, bg = 'transparent') {
  const size = Math.min(w, h);
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:${bg};display:grid;place-items:center;width:${w}px;height:${h}px">
    <img style="width:${size}px;height:${size}px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`);
  await page.waitForTimeout(50);
  await page.screenshot({ path: out, omitBackground: bg === 'transparent' });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [d, k] of Object.entries(DENS)) {
    const dir = path.join(RES, `mipmap-${d}`);
    await render(page, icon, 48 * k, 48 * k, path.join(dir, 'ic_launcher.png'));
    await render(page, round, 48 * k, 48 * k, path.join(dir, 'ic_launcher_round.png'));
    await render(page, fg(0.78), 108 * k, 108 * k, path.join(dir, 'ic_launcher_foreground.png'));
  }
  const splashes = fs.readdirSync(RES).filter((d) => d.startsWith('drawable')).map((d) => path.join(RES, d, 'splash.png')).filter(fs.existsSync);
  for (const file of splashes) {
    const buf = fs.readFileSync(file);
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    const logo = Math.round(Math.min(w, h) * 0.45);
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:${BG};display:grid;place-items:center;width:${w}px;height:${h}px">
      <img style="width:${logo}px;height:${logo}px" src="data:image/svg+xml;base64,${Buffer.from(fg(0.9)).toString('base64')}"></body></html>`);
    await page.waitForTimeout(50);
    await page.screenshot({ path: file });
  }
  await browser.close();
  console.log('Android art written');
})();
