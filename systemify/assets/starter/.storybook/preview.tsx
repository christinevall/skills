/*
 * Storybook preview: what wraps every story.
 * - Loads the stylesheet once (tokens, fonts, base styles).
 * - Adds the three modes (Mobile, Tablet, Desktop) to the viewport menu.
 * - Turns accessibility problems into test failures (a11y: 'error').
 */
import type { Decorator, Preview } from '@storybook/react-vite';
import '../src/styles/index.css';

/**
 * Site links inside Storybook. Pages link to "/work", "/about"…, which exist
 * on the website but not in Storybook. A click on such a link opens the
 * matching page story instead, so you can click through the site here too.
 * Add one line per page story: '/path': '<story id>' (the id is in the URL
 * when you open the story). External links behave normally.
 */
const pageStories: Record<string, string> = {
  // '/': 'pages-site--home',
};

function openPageStory(event: React.MouseEvent) {
  const link = (event.target as HTMLElement).closest('a');
  const href = link?.getAttribute('href');
  if (!link || !href || !href.startsWith('/') || link.target === '_blank') return;
  event.preventDefault();
  const path = href.split('#')[0] || '/';
  const id = pageStories[path];
  if (!id) return; // e.g. /imprint: only on the website
  const manager = window.parent !== window ? window.parent : window;
  manager.location.search = `?path=/story/${id}`;
}

/** Stories sit on the page background; fullscreen stories get no padding. */
const withPage: Decorator = (Story, context) => (
  <div
    onClickCapture={openPageStory}
    style={{ padding: context.parameters.layout === 'fullscreen' ? 0 : 'var(--ds-space-lg)', background: 'var(--ds-color-surface-default)' }}
  >
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withPage],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    controls: { expanded: true, sort: 'requiredFirst' },
    docs: { codePanel: true },
    // The three modes of the system, at the widths the audit measured.
    viewport: {
      options: {
        mobile: { name: 'Mobile (375)', styles: { width: '375px', height: '812px' }, type: 'mobile' },
        tablet: { name: 'Tablet (1024)', styles: { width: '1024px', height: '900px' }, type: 'tablet' },
        desktop: { name: 'Desktop (1440)', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
      },
    },
    options: {
      storySort: {
        order: [
          'Start here',
          ['Getting started', 'Prototyping with AI'],
          'Foundations',
          ['Typography', 'Layout grid', 'Colour', 'Space and shape'],
          'Layout',
          'Components',
          ['Text', 'Actions', 'Media', 'Forms', 'Feedback'],
          'Patterns',
          'Templates',
          'Pages',
          'Prototypes',
        ],
      },
    },
  },
};

export default preview;
