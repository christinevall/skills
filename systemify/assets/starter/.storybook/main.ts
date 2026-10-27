/*
 * Storybook configuration.
 * - stories: every .mdx page and every .stories.tsx file under src/
 * - addons: docs (pages), a11y (accessibility panel + checks), mcp (the
 *   server an AI agent talks to, at http://localhost:6006/mcp), vitest (tests)
 * - staticDirs: the public/ folder (images), so stories and the website use
 *   the very same images
 */
import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    // remark-gfm: tables in the MDX pages (Getting started, Before and after…)
    { name: '@storybook/addon-docs', options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } } },
    '@storybook/addon-a11y',
    '@storybook/addon-mcp',
    '@storybook/addon-vitest',
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  staticDirs: [{ from: '../public', to: '/' }],
  // manifests/components.json: every component with its description, props
  // and story code. The Storybook MCP serves it to agents; a custom MCP can
  // read the same file later.
  features: { componentsManifest: true },
  typescript: {
    // react-docgen-typescript reads the real TypeScript types, so union props
    // like variant: 'primary' | 'secondary' show every option in the docs.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Only document props declared in this system, not the 300 inherited DOM props.
      propFilter: (prop) => {
        const file = prop.parent?.fileName ?? prop.declarations?.[0]?.fileName ?? '';
        return !file.includes('node_modules');
      },
    },
  },
};
export default config;
