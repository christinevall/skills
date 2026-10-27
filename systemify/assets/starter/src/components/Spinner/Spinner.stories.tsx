import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

/** Shows that something is in progress. Used inside a loading Button. */
const meta = {
  title: 'Components/Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: { size: 'lg', label: 'Loading' },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
