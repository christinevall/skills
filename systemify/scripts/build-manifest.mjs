/**
 * build-manifest.mjs: copies Storybook's component manifest to the package root.
 *
 *   npm run build   (runs storybook build, then this)
 *
 * storybook build writes storybook-static/manifests/components.json: every
 * component with its description, props, defaults and story code. That is
 * what the Storybook MCP serves to agents. A copy at packages/cvds/components.json
 * is the stable place a custom MCP (or any tool) can read it from later,
 * without running Storybook. It is generated: do not edit it by hand.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const from = resolve(root, 'storybook-static/manifests/components.json');
const to = resolve(root, 'components.json');

if (!existsSync(from)) {
  console.error('No manifest yet. Run `npm run build-storybook` first (it creates storybook-static/manifests/components.json).');
  process.exit(1);
}
// Strip the absolute path of this computer, so the committed file is the same on every machine.
const text = readFileSync(from, 'utf8').replaceAll(root + '/', '').replaceAll(resolve(root, '..', '..') + '/', '');
writeFileSync(to, text);
const manifest = JSON.parse(text);
const count = Object.keys(manifest.components ?? manifest).length;
console.log(`manifest: ${count} components -> components.json`);
