import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stack } from '../../layout/Stack/Stack';
import { Text } from '../Text/Text';
import { Link } from './Link';

/**
 * The site's four link styles: inline (underlined in text), arrow ("find out
 * more  →"), nav (the header; links that leave the site get the external icon
 * in front, like "Docs"), plain (titles that are links). Links to other
 * sites open in a new tab and say so to screen readers.
 */
const meta = {
  title: 'Components/Actions/Link',
  component: Link,
  tags: ['autodocs'],
  args: { href: '/work', variant: 'arrow', current: false, children: 'find out more' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Arrow: Story = {};

export const Inline: Story = {
  render: () => (
    <Text>
      I’m the author of <Link href="https://thesolo.io/">The Solo</Link>, a book about building digital products.
    </Text>
  ),
};

/** Navigation: external links get the icon in front and a hidden "(opens in a new tab)". */
export const Nav: Story = {
  render: () => (
    <Stack gap="sm" align="start">
      <Link href="/work" variant="nav" current>Work</Link>
      <Link href="https://example.com/" variant="nav">Docs</Link>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('link', { name: /Docs \(opens in a new tab\)/ })).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

export const Plain: Story = { args: { variant: 'plain', children: 'The Invisible Divide (Design/Dev)', href: 'https://youtu.be/Cr2H54e_vgo' } };
