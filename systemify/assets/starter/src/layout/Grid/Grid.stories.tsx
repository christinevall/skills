import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '../../docs/helpers';
import { Col } from './Col';
import { Grid } from './Grid';

/**
 * The layout grid of the system: 4 columns by default, 8 from md, 12 on
 * lg, gutters 16 / 24 / 32px, inside the page margins. Every page layout
 * is Grid + Col: say how many columns each part spans per breakpoint. Use the viewport menu
 * (default, md, lg) to see it change.
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

/** All columns at once: 12 from lg, 8 from md, 4 by default. */
export const Columns: Story = {
  render: (args) => (
    <Grid {...args} rowGap="xs">
      {Array.from({ length: 12 }, (_, i) => (
        <Col key={i} span={1} md={1} lg={1}>
          <Box>{i + 1}</Box>
        </Col>
      ))}
    </Grid>
  ),
};

/** Media + text: image 5 columns, text 7 from lg; 4 + 4 from md; stacked by default. */
export const FiveSeven: Story = {
  render: (args) => (
    <Grid {...args}>
      <Col md={4} lg={5}><Box tall>lg 5 · md 4</Box></Col>
      <Col md={4} lg={7}><Box tall>lg 7 · md 4</Box></Col>
    </Grid>
  ),
};

/** Two cards per row. */
export const SixSix: Story = {
  render: (args) => (
    <Grid {...args}>
      {[1, 2, 3, 4].map((n) => (
        <Col key={n} md={4} lg={6}><Box tall>card {n}</Box></Col>
      ))}
    </Grid>
  ),
};

/** A section title in 3 columns, content in 9: the subpage pattern (see SectionAside). */
export const ThreeNine: Story = {
  render: (args) => (
    <Grid {...args}>
      <Col lg={3}><Box>title · 3</Box></Col>
      <Col lg={9}><Box tall>content · 9</Box></Col>
    </Grid>
  ),
};

/** Start a column further in: here 6 columns from column 4 from lg. */
export const Offset: Story = {
  render: (args) => (
    <Grid {...args}>
      <Col lg={6} lgStart={4}><Box>lg 6, starts at 4</Box></Col>
    </Grid>
  ),
};
