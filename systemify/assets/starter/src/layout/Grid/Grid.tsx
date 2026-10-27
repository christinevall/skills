import { cx } from '../../utils/cx';
import type { Space } from '../../utils/types';
import './Grid.css';

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  /** Vertical space between rows. Column gaps are always the grid's gutter. @default 'xl' */
  rowGap?: Space;
  /** Vertical alignment of the columns in a row. @default 'start' */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** The element to render. Use 'ul' for a list of cards (Cols become list items with as="li"). @default 'div' */
  as?: 'div' | 'ul' | 'ol' | 'section' | 'article';
}

/**
 * The layout grid: 4 columns on Mobile, 8 on Tablet, 12 on Desktop, with a
 * 16, 24 or 32px gutter. Put Col inside and say how many columns each spans.
 */
export function Grid({ rowGap = 'xl', align = 'start', as: Tag = 'div', className, ...props }: GridProps) {
  const listRole = Tag === 'ul' || Tag === 'ol' ? { role: 'list' } : {};
  return <Tag className={cx('ds-grid', className)} data-gap={rowGap} data-align={align} {...listRole} {...props} />;
}
