import { cx } from '../../utils/cx';
import type { HeadingLevel } from '../../utils/types';
import './Heading.css';

/** The heading text styles. Same names as the tokens and the Figma text styles. */
export type HeadingTextStyle = 'display-lg' | 'heading-lg' | 'heading-md' | 'heading-sm';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** The heading's place in the page outline: 1 once per page, 2 for sections, 3 inside them. */
  level: HeadingLevel;
  /**
   * The text style, named category-size: display-lg (page titles), heading-lg (section titles),
   * heading-md (group titles), heading-sm (card and list titles). Sizes change per mode.
   * Defaults by level: 1 display-lg, 2 heading-lg, 3 heading-md, 4–6 heading-sm.
   */
  textStyle?: HeadingTextStyle;
  /** @default 'start' */
  align?: 'start' | 'center';
  /** strong: the heading colour. default: the body colour. @default 'strong' */
  tone?: 'strong' | 'default';
}

const byLevel = { 1: 'display-lg', 2: 'heading-lg', 3: 'heading-md', 4: 'heading-sm', 5: 'heading-sm', 6: 'heading-sm' } as const;

/**
 * A heading in one of the four heading text styles. Level (meaning) and
 * textStyle (look) are separate, so a page has one h1 however it is designed.
 */
export function Heading({ level, textStyle, align = 'start', tone = 'strong', className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cx('ds-heading', className)} data-text-style={textStyle ?? byLevel[level]} data-align={align} data-tone={tone} {...props} />;
}
