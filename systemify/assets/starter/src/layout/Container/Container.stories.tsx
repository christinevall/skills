import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '../../docs/helpers';
import { Container } from './Container';

/**
 * Holds content at grid width: page margins of 24 / 40 / 56px and at most
 * 1168px of content (on a 1440px screen the margins are 136px). Section
 * already contains one.
 */
const meta = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { size: 'content', as: 'div' },
  render: (args) => (
    <Container {...args}>
      <Box>size="{args.size}"</Box>
    </Container>
  ),
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Full: Story = { args: { size: 'full' } };
