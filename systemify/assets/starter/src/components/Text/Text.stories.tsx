import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '../../layout/Stack/Stack';
import { Text } from './Text';

/**
 * Text in the body and label text styles, named category-size-modifier:
 * body-lg, body-md, body-md-strong, body-md-italic, body-sm, label-md. Three
 * colours: strong, default, muted.
 */
const meta = {
  title: 'Components/Text/Text',
  component: Text,
  tags: ['autodocs'],
  args: {
    textStyle: 'body-md',
    tone: 'default',
    align: 'start',
    as: 'p',
    children: 'I build and teach digital products at the intersection of UI design, product building, and AI.',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Intro lines. Size per mode comes from the token. */
export const BodyLg: Story = { args: { textStyle: 'body-lg', tone: 'strong', children: 'Fieldnote Studio' } };
export const Muted: Story = { args: { tone: 'muted', children: 'A practical book for building and running digital products as a company of one.' } };
export const BodyMdItalic: Story = { args: { textStyle: 'body-md-italic', children: 'The Invisible Divide (Design/Dev)' } };
export const BodySm: Story = { args: { textStyle: 'body-sm', tone: 'muted', children: 'June 28, 2026' } };

export const AllTextStyles: Story = {
  render: () => (
    <Stack gap="sm">
      <Text textStyle="body-lg" tone="strong">body-lg · From UI to AI.</Text>
      <Text>body-md · I speak at global conferences.</Text>
      <Text textStyle="body-md-strong">body-md-strong · Pixel Pioneers, June 2026</Text>
      <Text textStyle="body-md-italic">body-md-italic · The Invisible Divide (Design/Dev)</Text>
      <Text textStyle="body-sm" tone="muted">body-sm · June 28, 2026</Text>
      <Text textStyle="label-md" tone="strong">label-md · Work</Text>
    </Stack>
  ),
};
