import { cx } from '../../utils/cx';
import './Text.css';

/** The body and label text styles. Same names as the tokens. */
export type TextStyle = 'body-lg' | 'body-md' | 'body-md-strong' | 'body-md-italic' | 'body-sm' | 'label-md';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The text style, named category-size-modifier: body-lg (intro lines), body-md (paragraphs),
   * body-md-strong (meta lines and lists), body-md-italic (titles of works, tags),
   * body-sm (dates, small print), label-md (navigation size).
   * @default 'body-md'
   */
  textStyle?: TextStyle;
  /** strong: heading colour. default: body colour. muted: grey, for descriptions and meta. @default 'default' */
  tone?: 'strong' | 'default' | 'muted' | 'on-inverse' | 'inherit';
  /** @default 'start' */
  align?: 'start' | 'center';
  /** The element to render. Use 'span' inside other text. @default 'p' */
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'time' | 'address';
}

/** Text in one of the system's text styles and colours. */
export function Text({ textStyle = 'body-md', tone = 'default', align = 'start', as: Tag = 'p', className, ...props }: TextProps) {
  return <Tag className={cx('ds-text', className)} data-text-style={textStyle} data-tone={tone} data-align={align} {...props} />;
}
