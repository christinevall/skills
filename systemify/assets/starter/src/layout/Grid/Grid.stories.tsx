import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '../../docs/helpers';
import { Col } from './Col';
import { Grid } from './Grid';

/**
 * The layout grid of the system: 4 columns on Mobile, 8 on Tablet, 12 on
 * Desktop, gutters 16 / 24 / 32px, inside the page margins. Every page layout
 * is Grid + Col: say how many columns each part spans per breakpoint. In Figma
 * this is a layout grid per mode with the same numbers. Use the viewport menu
 * (Mobile, Tablet, Desktop) to see it change.
 */
const meta = {
  title: 'Layout/Grid',
  component: Grid,
  subcomponents: { Col },
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { rowGap: 'xl', align: 'start', as: 'div' },
  decorators: [(Story) => <div className="ds-container" data-size="content" style={{ paddingBlock: 'var(--ds-space-xl)' }}><Story /></div>],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All columns at once: 12 on Desktop, 8 on Tablet, 4 on Mobile. */
export const Columns: Story = {
  render: (args) => (
    <Grid {...args} rowGap="xs">
      {Array.from({ length: 12 }, (_, i) => (
        <Col key={i} span={1} tablet={1} desktop={1}>
          <Box>{i + 1}</Box>
        </Col>
      ))}
    </Grid>
  ),
};

/** Media + text: image 5 columns, text 7 on Desktop; 4 + 4 on Tablet; stacked on Mobile. */
export const FiveSeven: Story = {
  render: (args) => (
    <Grid {...args}>
      <Col tablet={4} desktop={5}><Box tall>desktop 5 · tablet 4</Box></Col>
      <Col tablet={4} desktop={7}><Box tall>desktop 7 · tablet 4</Box></Col>
    </Grid>
  ),
};

/** Two cards per row. */
export const SixSix: Story = {
  render: (args) => (
    <Grid {...args}>
      {[1, 2, 3, 4].map((n) => (
        <Col key={n} tablet={4} desktop={6}><Box tall>card {n}</Box></Col>
      ))}
    </Grid>
  ),
};

/** A section title in 3 columns, content in 9: the subpage pattern (see SectionAside). */
export const ThreeNine: Story = {
  render: (args) => (
    <Grid {...args}>
      <Col desktop={3}><Box>title · 3</Box></Col>
      <Col desktop={9}><Box tall>content · 9</Box></Col>
    </Grid>
  ),
};

/** Start a column further in: here 6 columns from column 4 on Desktop. */
export const Offset: Story = {
  render: (args) => (
    <Grid {...args}>
      <Col desktop={6} desktopStart={4}><Box>desktop 6, starts at 4</Box></Col>
    </Grid>
  ),
};
