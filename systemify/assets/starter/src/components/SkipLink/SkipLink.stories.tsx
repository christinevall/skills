import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SkipLink } from './SkipLink';

/** Invisible until someone presses Tab; then it jumps past the navigation. PageShell includes it. */
const meta = {
  title: 'Components/Actions/SkipLink',
  component: SkipLink,
  tags: ['autodocs'],
  args: { href: '#main', children: 'Skip to content' },
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('link', { name: 'Skip to content' })).toHaveFocus();
  },
};
