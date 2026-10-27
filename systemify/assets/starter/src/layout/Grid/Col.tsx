import { cx } from '../../utils/cx';
import './Grid.css';

type Span = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ColProps extends React.HTMLAttributes<HTMLElement> {
  /** Columns by default (out of 4). @default 4 (full width) */
  span?: 1 | 2 | 3 | 4;
  /** Columns from md (out of 8). @default 8 (full width) */
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Columns from lg (out of 12). @default 12 (full width) */
  lg?: Span;
  /** Column to start in from md (1–8). Leave out to follow on. */
  mdStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Column to start in from lg (1–12). Leave out to follow on. */
  lgStart?: Span;
  /** The element to render. Use 'li' inside a Grid rendered as a list. @default 'div' */
  as?: 'div' | 'li' | 'article' | 'aside' | 'header';
}

/**
 * One column area of the layout grid. Say how many columns it spans per
 * breakpoint: <Col lg={5}> is five of twelve from lg and full width
 * below.
 */
export function Col({ span = 4, md = 8, lg = 12, mdStart, lgStart, as: Tag = 'div', className, style, ...props }: ColProps) {
  const vars = {
    '--_col-span': span,
    '--_col-span-md': md,
    '--_col-span-lg': lg,
    // Always set, so a Col nested in another never inherits its parent's start.
    '--_col-start-md': mdStart ?? 'auto',
    '--_col-start-lg': lgStart ?? 'auto',
  } as React.CSSProperties;
  return <Tag className={cx('ds-col', className)} style={{ ...vars, ...style }} {...props} />;
}
