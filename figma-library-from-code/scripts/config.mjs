/**
 * figma-library-from-code settings: everything that is specific to this design system.
 * The scripts next to this file read it; to mirror another system, change
 * this file, not the scripts. Paths are relative to the project root, which
 * is where the scripts are run from (npm run …).
 *
 * The two plugin-side scripts (audit.figma.js, snapshot.figma.js) run inside
 * Figma and cannot import this file: each has a PREFIX line at the top that
 * must match `prefix` here.
 */
export const CONFIG = {
  // CSS custom properties are --<prefix>-…: --sds-color-background-accent.
  prefix: 'sds',

  // DTCG token files (https://www.designtokens.org).
  tokens: {
    dir: 'tokens',
    definitions: 'tier-1-definitions', // a folder: raw values, every .json file in it
    light: 'tier-2-usage/semantic.light.json', // roles, light mode
    dark: 'tier-2-usage/semantic.dark.json', // the same roles, dark mode
    textStyles: 'tier-2-usage/text-style.json', // composite text styles
  },

  // One folder per component: <Name>/<Name>.tsx and <Name>/<Name>.module.css.
  components: 'src/components',

  // Figma needs one real family per font token; code may name a stack.
  figmaFonts: { sans: 'Inter', mono: 'Roboto Mono' },
};

export const cssVar = (path) => `--${CONFIG.prefix}-${path}`;
