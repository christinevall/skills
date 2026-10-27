import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Image } from './Image';

/**
 * Images with the radius from the tokens. auto keeps the image's own shape
 * (portraits), 16/9 for features and cards, 1/1 for the photo strip. alt
 * text is required; a missing file shows a grey box with the alt text.
 */
const meta = {
  title: 'Components/Media/Image',
  component: Image,
  tags: ['autodocs'],
  args: { src: '/images/placeholder-wide.svg', alt: 'Placeholder: a grey landscape frame', width: 1600, height: 900, ratio: '16/9', priority: false },
  decorators: [(Story) => <div style={{ maxInlineSize: 'var(--ds-layout-prose-width)' }}><Story /></div>],
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Portrait: Story = { args: { src: '/images/placeholder-tall.svg', alt: 'Placeholder: a grey portrait frame', width: 1000, height: 1250, ratio: 'auto' } };
export const Square: Story = { args: { src: '/images/placeholder-tall.svg', alt: 'Placeholder: a grey portrait frame', width: 1000, height: 1250, ratio: '1/1' } };

/** Error handling: the file is missing. */
export const BrokenImage: Story = {
  args: { src: '/images/missing.jpg', alt: 'A photo that failed to load' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByRole('img', { name: 'A photo that failed to load' })).toBeVisible());
  },
};
