import { cx } from '../../utils/cx';
import { Spinner } from '../Spinner/Spinner';
import './Button.css';

type Shared = {
  /** primary: the one main action in a view. secondary: outlined, for a second action in prototypes. @default 'primary' */
  variant?: 'primary' | 'secondary';
  /** Stretch to the full width: always (true), or only on Mobile ('mobile'). @default false */
  fullWidth?: boolean | 'mobile';
  /** Shows a spinner, keeps the width, ignores clicks; screen readers hear "busy". @default false */
  loading?: boolean;
  /** The label: short, a verb where possible. */
  children: React.ReactNode;
};

export type ButtonProps = Shared &
  (
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
    | ({ /** Makes it a link that looks like a button. */ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement> & { disabled?: boolean })
  );

/**
 * The button. Height, padding and radius are component tokens. A
 * real <button>, or an <a> when it has an href.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', fullWidth = false, loading = false, className, children, ...rest } = props;
  const shared = {
    className: cx('ds-button', className),
    'data-variant': variant,
    'data-full-width': fullWidth === true ? 'always' : fullWidth === 'mobile' ? 'mobile' : undefined,
    'data-loading': loading || undefined,
  };
  const content = (
    <>
      {loading ? <Spinner className="ds-button__spinner" label="" /> : null}
      <span className="ds-button__label">{children}</span>
    </>
  );

  if (rest.href !== undefined) {
    const { disabled, href, ...anchor } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & { disabled?: boolean };
    const inactive = disabled || loading;
    return (
      <a {...shared} {...anchor} href={inactive ? undefined : href} aria-disabled={inactive || undefined} aria-busy={loading || undefined}>
        {content}
      </a>
    );
  }
  const { type = 'button', onClick, ...button } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      {...shared}
      {...button}
      type={type}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
    >
      {content}
    </button>
  );
}
