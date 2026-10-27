import { cx } from '../../utils/cx';
import { Container, type ContainerProps } from '../Container/Container';
import './Section.css';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Background band: the page colour (default), a subtle tint (subtle) or the dark inverse colour (inverse). @default 'default' */
  tone?: 'default' | 'subtle' | 'inverse';
  /**
   * Vertical padding, top and bottom.
   * lg: home feature bands (40 / 56 / 80px). md: subpage bands (24 / 32 / 40px).
   * header: the page title band (36px). none: no padding.
   * @default 'md'
   */
  spacing?: 'lg' | 'md' | 'header' | 'none';
  /** Width of the inner container. @default 'content' */
  width?: ContainerProps['size'];
  /** The element to render. Use 'div' when the band has no heading of its own. @default 'section' */
  as?: 'section' | 'div' | 'header' | 'footer' | 'aside';
}

/**
 * One full-width band of a page: background, vertical padding, and the
 * content held at grid width. Pages are a stack of Sections; the site
 * alternates white and grey.
 */
export function Section({ tone = 'default', spacing = 'md', width = 'content', as: Tag = 'section', className, children, ...props }: SectionProps) {
  return (
    <Tag className={cx('ds-section', className)} data-tone={tone} data-spacing={spacing} {...props}>
      <Container size={width}>{children}</Container>
    </Tag>
  );
}
