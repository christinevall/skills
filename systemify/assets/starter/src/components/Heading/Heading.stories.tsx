import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '../../layout/Stack/Stack';
import { Heading } from './Heading';

/**
 * A heading in one of the four heading text styles, named category-size:
 * display-lg, heading-lg, heading-md, heading-sm. Each is ONE text style whose
 * size changes per breakpoint (display-lg is 3 → 4.5 → 6rem), so there is no
 * "small heading". level is the meaning (one h1 per page), textStyle is the
 * look. Switch the viewport to see the sizes change.
 */
const meta = {
  title: 'Components/Text/Heading',
  component: Heading,
  tags: ['autodocs'],
  args: { level: 2, textStyle: 'heading-lg', align: 'start', tone: 'strong', children: 'Recent work' },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Page titles. Size per mode comes from the token. */
export const DisplayLg: Story = { args: { level: 1, textStyle: 'display-lg', align: 'center', children: 'Speaking.' } };
/** Section titles: 2 / 2.5 / 2.5rem. */
export const HeadingLg: Story = { args: { textStyle: 'heading-lg', children: 'Past & Current.' } };
/** Card and group titles. Size per mode comes from the token. */
export const HeadingMd: Story = { args: { level: 3, textStyle: 'heading-md', children: 'My Beautiful Broken Design Process' } };
/** Card and list titles: 1.5rem. */
export const HeadingSm: Story = { args: { level: 3, textStyle: 'heading-sm', children: 'the Solo' } };

export const AllTextStyles: Story = {
  render: () => (
    <Stack gap="lg">
      <Heading level={2} textStyle="display-lg">display-lg</Heading>
      <Heading level={2} textStyle="heading-lg">heading-lg</Heading>
      <Heading level={3} textStyle="heading-md">heading-md</Heading>
      <Heading level={4} textStyle="heading-sm">heading-sm</Heading>
    </Stack>
  ),
};
