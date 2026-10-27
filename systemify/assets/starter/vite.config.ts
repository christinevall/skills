/// <reference types="vitest/config" />
/*
 * Vite config. Storybook builds with it, and `npm run test` uses it to render
 * every story in a real (headless) Chromium: a story that crashes, fails its
 * play test, or breaks an accessibility rule fails the test run.
 */
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(import.meta.dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
