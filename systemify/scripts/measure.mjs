/**
 * measure.mjs: measures a live site at every breakpoint width and saves the
 * results for the audit. Runs assets/measure-site.js in a real browser
 * (Playwright Chromium), one page and one width at a time.
 *
 *   node scripts/measure.mjs https://example.com / /about /work --out docs/audit
 *   node scripts/measure.mjs https://example.com / --widths 375,1024,1440
 *
 * Out, per page and width:
 *   docs/audit/<page>-<width>.json   the measurements (text styles, colours, relations, measures…)
 *   docs/audit/<page>-<width>.png    a full-page screenshot
 *
 * Needs Playwright: `npm i -D playwright && npx playwright install chromium`
 * (the full starter already has it). Read-only: it changes nothing on the site.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args.splice(i, 2)[1] : fallback;
};
const out = resolve(flag('out', 'docs/audit'));
const widths = flag('widths', '375,1024,1440').split(',').map(Number);
const [base, ...paths] = args;
if (!base) { console.error('Usage: node scripts/measure.mjs <site-url> [/path …] [--out docs/audit] [--widths 375,1024,1440]'); process.exit(1); }

// measure-site.js sits in the skill's assets/ or next to this script in a project.
const candidates = [join(here, '../assets/measure-site.js'), join(here, 'measure-site.js')];
const scriptPath = candidates.find(existsSync);
if (!scriptPath) { console.error('measure-site.js not found next to this script or in ../assets/'); process.exit(1); }
const measure = readFileSync(scriptPath, 'utf8');

const { chromium } = await import('playwright');
const browser = await chromium.launch();
mkdirSync(out, { recursive: true });

for (const path of paths.length ? paths : ['/']) {
  const name = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await page.goto(new URL(path, base).href, { waitUntil: 'networkidle', timeout: 60000 });
      const json = await page.evaluate(`(${measure.slice(measure.indexOf('async'))})()`);
      writeFileSync(join(out, `${name}-${width}.json`), json);
      await page.screenshot({ path: join(out, `${name}-${width}.png`), fullPage: true });
      console.log(`✓ ${path} at ${width}`);
    } catch (error) {
      console.log(`✗ ${path} at ${width}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
}
await browser.close();
