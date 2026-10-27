import { cx } from '../../utils/cx';
import './Container.css';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * content: the layout grid's width (1168px max, page margins at the sides).
   * full: edge to edge, no margins.
   * @default 'content'
   */
  size?: 'content' | 'full';
  /** The element to render. @default 'div' */
  as?: 'div' | 'section' | 'header' | 'footer' | 'main' | 'nav';
}

/**
 * Holds content at the width of the layout grid: page margins of 24, 40 or
 * 56px (default, md, lg) and at most 1168px of content. On wider
 * screens the margins grow. Section already contains one.
 */
export function Container({ size = 'content', as: Tag = 'div', className, ...props }: ContainerProps) {
  return <Tag className={cx('ds-container', className)} data-size={size} {...props} />;
}
