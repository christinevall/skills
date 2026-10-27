import { cx } from '../../utils/cx';
import type { Space } from '../../utils/types';
import './Stack.css';

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  /** Space between the children, from the spacing scale. @default 'md' */
  gap?: Space;
  /** Horizontal alignment of the children. @default 'stretch' */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** The element to render. Use 'ul' or 'ol' for lists. @default 'div' */
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'ul' | 'ol' | 'form' | 'fieldset';
}

/**
 * Puts children under each other with even space between them. The space
 * lives on the Stack, not on the children, so any component can go inside
 * without margins leaking. The most used layout primitive.
 */
export function Stack({ gap = 'md', align = 'stretch', as: Tag = 'div', className, ...props }: StackProps) {
  const listRole = Tag === 'ul' || Tag === 'ol' ? { role: 'list' } : {};
  return <Tag className={cx('ds-stack', className)} data-gap={gap} data-align={align} {...listRole} {...props} />;
}
