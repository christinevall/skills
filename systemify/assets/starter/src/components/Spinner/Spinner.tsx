import { cx } from '../../utils/cx';
import './Spinner.css';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size. inherit (1em) matches the surrounding text. @default 'inherit' */
  size?: 'inherit' | 'md' | 'lg';
  /**
   * Announced to screen readers. Set to '' when the spinner sits inside
   * something that already announces the busy state (like a loading Button).
   * @default 'Loading'
   */
  label?: string;
}

/** Shows that something is in progress. With reduced motion it pulses instead of spinning. */
export function Spinner({ size = 'inherit', label = 'Loading', className, ...props }: SpinnerProps) {
  const a11y = label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true as const };
  return <span className={cx('ds-spinner', className)} data-size={size} {...a11y} {...props} />;
}
