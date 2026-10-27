import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cluster } from '../../layout/Cluster/Cluster';
import { Stack } from '../../layout/Stack/Stack';
import { Text } from '../Text/Text';
import { Icon } from './Icon';
import { iconNames } from './icons';

/** A few outline icons (external link, menu, close, play, form states). Decorative unless given a label. */
const meta = {
  title: 'Components/Media/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'external', size: 'lg' },
  argTypes: { name: { control: 'select', options: iconNames } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const AllIcons: Story = {
  render: () => (
    <Cluster gap="xl">
      {iconNames.map((name) => (
        <Stack key={name} gap="xs" align="center">
          <Icon name={name} size="lg" />
          <Text textStyle="body-sm" tone="muted">{name}</Text>
        </Stack>
      ))}
    </Cluster>
  ),
};
