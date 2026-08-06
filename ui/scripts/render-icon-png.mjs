// Rasterize brand/icon.svg into the 512px PNG the app store requires, then
// verify the result before leaving it on disk.
//
//   npm run icon:png
//
// WHY A SCRIPT AND NOT A ONE-OFF: the icon ships as two files. The rail renders
// the SVG (crisp at the 16-34 px it draws at), while the store fields name a
// PNG, because an app icon there must be square, transparent and at least 256
// across. Two files can drift, so the raster is generated from the vector rather
// than drawn separately, and a test digests the SVG's geometry to fail when the
// PNG was not regenerated after a change.
//
// WHY A BROWSER: the icon's strokes are written as
// `var(--ico-a, var(--muted, #7f7f88))` so they theme themselves anywhere the
// dashboard inlines them, falling back to literal hex everywhere else. Rendering
// through an <img> tag is exactly how the dashboard delivers a non-builtin icon,
// so the fallbacks resolve here the same way they do in production. A rasterizer
// with partial CSS support can drop a var() chain and silently paint the mark
// black -- invisible on a dark card -- which is why the pixels are asserted
// below instead of trusted.
import { chromium } from '@playwright/test';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SVG = resolve(HERE, '..', 'brand', 'icon.svg');
const PNG = resolve(HERE, '..', 'brand', 'icon-512.png');
const SIZE = 512;

// The two literal colours the var() chains bottom out at. If a render loses a
// chain, these stop appearing and the script fails instead of writing a broken
// asset. Kept as [r, g, b] to compare against canvas pixels directly.
const BRACKETS = [0x7f, 0x7f, 0x88];
const MARK = [0x00, 0xc9, 0x8d];

const near = ([r, g, b], [tr, tg, tb], tolerance = 6) =>
  Math.abs(r - tr) <= tolerance &&
  Math.abs(g - tg) <= tolerance &&
  Math.abs(b - tb) <= tolerance;

const fail = (message) => {
  console.error(`icon:png FAILED -- ${message}`);
  process.exit(1);
};

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
  const svg = readFileSync(SVG);
  const dataUri = `data:image/svg+xml;base64,${svg.toString('base64')}`;

  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:transparent">` +
      `<img id="icon" src="${dataUri}" width="${SIZE}" height="${SIZE}" style="display:block">` +
      `</body></html>`,
  );
  const icon = page.locator('#icon');
  await icon.evaluate((img) => (img.decode ? img.decode() : null));
  // omitBackground keeps the alpha channel; without it the store card would get
  // an opaque white square that reads as a hole on a dark surface.
  const png = await icon.screenshot({ omitBackground: true });

  const report = await page.evaluate(async (bytes) => {
    const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colours = new Map();
    let opaque = 0;
    let transparent = 0;
    for (let p = 0; p < data.length; p += 4) {
      if (data[p + 3] < 8) {
        transparent += 1;
        continue;
      }
      opaque += 1;
      // Only fully-opaque pixels are candidate stroke colours; the rest are
      // antialiasing between a stroke and the transparent background.
      if (data[p + 3] === 255) {
        const key = `${data[p]},${data[p + 1]},${data[p + 2]}`;
        colours.set(key, (colours.get(key) ?? 0) + 1);
      }
    }
    return {
      width: canvas.width,
      height: canvas.height,
      opaque,
      transparent,
      colours: [...colours.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([key, count]) => ({ rgb: key.split(',').map(Number), count })),
    };
  }, [...png]);

  if (report.width !== SIZE || report.height !== SIZE) {
    fail(`expected ${SIZE}x${SIZE}, rendered ${report.width}x${report.height}`);
  }
  if (report.transparent === 0) {
    fail('the render has no transparent pixels, so the alpha channel was lost');
  }
  const inkPercent = (100 * report.opaque) / (SIZE * SIZE);
  if (inkPercent < 5 || inkPercent > 60) {
    fail(`ink coverage ${inkPercent.toFixed(1)}% is implausible for this mark`);
  }
  for (const [label, colour] of [['brackets', BRACKETS], ['mark', MARK]]) {
    if (!report.colours.some((entry) => near(entry.rgb, colour))) {
      fail(
        `the ${label} colour rgb(${colour}) is absent from the render -- a ` +
          'var() chain was probably dropped, which paints the icon black',
      );
    }
  }

  writeFileSync(PNG, png);
  console.log(
    `icon:png wrote ${PNG}\n` +
      `  ${report.width}x${report.height}, ${statSync(PNG).size} bytes, ` +
      `${inkPercent.toFixed(1)}% ink, ${report.transparent} transparent px\n` +
      `  colours: ${report.colours
        .map((entry) => `rgb(${entry.rgb.join(',')})x${entry.count}`)
        .join(' ')}`,
  );
} finally {
  await browser.close();
}
