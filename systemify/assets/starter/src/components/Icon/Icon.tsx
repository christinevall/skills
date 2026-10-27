import { cx } from '../../utils/cx';
import { icons, type IconName } from './icons';
import './Icon.css';

export type { IconName } from './icons';

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'name'> {
  /** Which icon. See the icon list in the Icon docs. */
  name: IconName;
  /** Size. inherit (1em) matches the text around it. md 24px, lg 32px for icon buttons. @default 'inherit' */
  size?: 'inherit' | 'md' | 'lg';
  /**
   * What the icon means, for screen readers. Leave it out when the icon sits
   * next to text that already says it; it is then hidden from assistive tech.
   */
  label?: string;
}

/**
 * An outline icon from the system set (external link, menu, close, and a few for forms). Decorative by default (hidden from
 * screen readers); give it a label only when it stands alone and carries meaning.
 */
export function Icon({ name, size = 'inherit', label, className, ...props }: IconProps) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <svg
      className={cx('ds-icon', className)}
      data-size={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...a11y}
      {...props}
    >
      <path d={icons[name]} />
    </svg>
  );
}
