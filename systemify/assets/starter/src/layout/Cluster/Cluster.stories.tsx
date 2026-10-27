import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from '../../components/Link/Link';
import { Cluster } from './Cluster';

/** Puts things in a row that wraps when there is no room: links, buttons, tags. */
const meta = {
  title: 'Layout/Cluster',
  component: Cluster,
  tags: ['autodocs'],
  args: { gap: 'md', justify: 'start', align: 'center', wrap: true, as: 'div' },
  render: (args) => (
    <Cluster {...args}>
      <Link href="#one" variant="plain">First link</Link>
      <Link href="#two" variant="plain">Second link</Link>
      <Link href="#youtube" variant="plain">YouTube</Link>
    </Cluster>
  ),
} satisfies Meta<typeof Cluster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Centred: Story = { args: { justify: 'center' } };
