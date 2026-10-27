import { cx } from '../../utils/cx';
import { isExternalHref } from '../../utils/types';
import { Icon } from '../Icon/Icon';
import './Link.css';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Where the link goes. */
  href: string;
  /**
   * inline: underlined, inside text; takes the text style around it.
   * arrow: bold "find out more  →" on its own line.
   * nav: the navigation style, with the external-link icon in front for links that leave the site.
   * plain: no underline until hover, takes the text style around it (titles that are links).
   * @default 'inline'
   */
  variant?: 'inline' | 'arrow' | 'nav' | 'plain';
  /** Opens another site in a new tab, with a hidden "(opens in a new tab)" for screen readers. Detected from the href when left out. */
  external?: boolean;
  /** Marks the link to the current page (aria-current="page"). For navigation. @default false */
  current?: boolean;
  /** The link text. */
  children: React.ReactNode;
}

/**
 * A link in one of the system's link styles. Links to other sites open
 * in a new tab and say so to screen readers.
 */
export function Link({ href, variant = 'inline', external, current = false, className, children, ...props }: LinkProps) {
  const isExternal = external ?? isExternalHref(href);
  return (
    <a
      className={cx('ds-link', className)}
      data-variant={variant}
      href={href}
      aria-current={current ? 'page' : undefined}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {variant === 'nav' && isExternal ? <Icon name="external" className="ds-link__icon" /> : null}
      {children}
      {variant === 'arrow' ? <span aria-hidden="true">{'  →'}</span> : null}
      {isExternal ? <span className="ds-visually-hidden"> (opens in a new tab)</span> : null}
    </a>
  );
}
