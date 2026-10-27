import { cx } from '../../utils/cx';
import type { Space } from '../../utils/types';
import './Cluster.css';

export interface ClusterProps extends React.HTMLAttributes<HTMLElement> {
  /** Space between the children, both directions. @default 'sm' */
  gap?: Space;
  /** How children are spread along the row. 'between' pushes them to both ends. @default 'start' */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Vertical alignment within a row. @default 'center' */
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  /** Let children wrap onto a new line when they run out of room. @default true */
  wrap?: boolean;
  /** The element to render. Use 'ul' for a list of tags or links. @default 'div' */
  as?: 'div' | 'ul' | 'ol' | 'nav' | 'header' | 'footer';
}

/**
 * Puts children in a row that wraps when it runs out of room: buttons,
 * tags, links, a logo next to a menu. No breakpoints needed.
 */
export function Cluster({
  gap = 'sm',
  justify = 'start',
  align = 'center',
  wrap = true,
  as: Tag = 'div',
  className,
  ...props
}: ClusterProps) {
  const listRole = Tag === 'ul' || Tag === 'ol' ? { role: 'list' } : {};
  return (
    <Tag
      className={cx('ds-cluster', className)}
      data-gap={gap}
      data-justify={justify}
      data-align={align}
      data-wrap={wrap}
      {...listRole}
      {...props}
    />
  );
}
