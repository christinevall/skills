import { cx } from '../../utils/cx';
import './Grid.css';

type Span = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ColProps extends React.HTMLAttributes<HTMLElement> {
  /** Columns on Mobile (out of 4). @default 4 (full width) */
  span?: 1 | 2 | 3 | 4;
  /** Columns on Tablet (out of 8). @default 8 (full width) */
  tablet?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Columns on Desktop (out of 12). @default 12 (full width) */
  desktop?: Span;
  /** Column to start in on Tablet (1–8). Leave out to follow on. */
  tabletStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Column to start in on Desktop (1–12). Leave out to follow on. */
  desktopStart?: Span;
  /** The element to render. Use 'li' inside a Grid rendered as a list. @default 'div' */
  as?: 'div' | 'li' | 'article' | 'aside' | 'header';
}

/**
 * One column area of the layout grid. Say how many columns it spans per
 * breakpoint: <Col desktop={5}> is five of twelve on Desktop and full width
 * below.
 */
export function Col({ span = 4, tablet = 8, desktop = 12, tabletStart, desktopStart, as: Tag = 'div', className, style, ...props }: ColProps) {
  const vars = {
    '--_col-span': span,
    '--_col-span-tablet': tablet,
    '--_col-span-desktop': desktop,
    // Always set, so a Col nested in another never inherits its parent's start.
    '--_col-start-tablet': tabletStart ?? 'auto',
    '--_col-start-desktop': desktopStart ?? 'auto',
  } as React.CSSProperties;
  return <Tag className={cx('ds-col', className)} style={{ ...vars, ...style }} {...props} />;
}
