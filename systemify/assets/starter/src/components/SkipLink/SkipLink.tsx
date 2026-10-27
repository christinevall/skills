import { cx } from '../../utils/cx';
import './SkipLink.css';

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The id of the main content, with #. @default '#main' */
  href?: string;
  /** @default 'Skip to content' */
  children?: React.ReactNode;
}

/**
 * The first thing on every page: invisible until a keyboard user presses
 * Tab, then it lets them jump past the navigation straight to the content.
 */
export function SkipLink({ href = '#main', children = 'Skip to content', className, ...props }: SkipLinkProps) {
  return (
    <a className={cx('ds-skip-link', className)} href={href} {...props}>
      {children}
    </a>
  );
}
