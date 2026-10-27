import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from '../../components/Heading/Heading';
import { Text } from '../../components/Text/Text';
import { Stack } from '../Stack/Stack';
import { Section } from './Section';

/**
 * One full-width band of a page: the page colour, a subtle tint, or the dark inverse
 * colour; vertical padding from the tokens (it changes per breakpoint); the
 * content held at grid width. Pages are a stack of Sections.
 */
const meta = {
  title: 'Layout/Section',
  component: Section,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { tone: 'subtle', spacing: 'lg', width: 'content', as: 'section' },
  render: (args) => (
    <Section {...args} aria-labelledby="demo">
      <Stack gap="lg">
        <Heading level={2} id="demo">Recent work</Heading>
        <Text>A band of the page. Padding: 40px by default, 56px from md, 80px from lg.</Text>
      </Stack>
    </Section>
  ),
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = { args: { tone: 'default' } };
export const Subtle: Story = {};
/** Subpage bands use the smaller padding: 24 / 32 / 40px. */
export const SpacingMd: Story = { args: { spacing: 'md' } };

/** Bands in turn: default and subtle. */
export const Alternating: Story = {
  render: () => (
    <>
      {(['subtle', 'default', 'subtle', 'default'] as const).map((tone, i) => (
        <Section key={i} tone={tone} spacing="md" as="div">
          <Text>tone="{tone}"</Text>
        </Section>
      ))}
    </>
  ),
};
