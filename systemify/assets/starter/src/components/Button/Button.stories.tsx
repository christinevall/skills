import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Cluster } from '../../layout/Cluster/Cluster';
import { Button } from './Button';

/**
 * The main button. One primary per
 * view. With href it is a link that looks like a
 * button. secondary (outlined) is for a second action in prototypes.
 */
const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Get in touch', variant: 'primary', fullWidth: false, loading: false, onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Get in touch' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Secondary: Story = { args: { variant: 'secondary', children: 'Email instead' } };

/** Full width by default only. Switch the viewport to small screens. */
export const FullWidthBelowMd: Story = { args: { fullWidth: 'until-md' } };

/** Spinner, same width, clicks ignored, "busy" for screen readers (and still named). */
export const Loading: Story = {
  args: { loading: true, children: 'Send request' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Send request' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const AsLink: Story = {
  args: { href: '/contact', children: 'Contact' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
  },
};

export const AllVariants: Story = {
  render: () => (
    <Cluster gap="sm">
      <Button>primary</Button>
      <Button variant="secondary">secondary</Button>
      <Button loading>loading</Button>
      <Button disabled>disabled</Button>
    </Cluster>
  ),
};
