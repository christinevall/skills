import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '../../components/Text/Text';
import { Stack } from './Stack';

/**
 * Puts things under each other with even space, so children never need
 * margins. sm (12px) between paragraphs, lg (24px) between a heading and its
 * text, md (16px) between list entries.
 */
const meta = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: { gap: 'sm', align: 'stretch', as: 'div' },
  render: (args) => (
    <Stack {...args}>
      <Text>First paragraph.</Text>
      <Text>Second paragraph.</Text>
      <Text>Third paragraph.</Text>
    </Stack>
  ),
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const HeadingToText: Story = { args: { gap: 'lg' } };
