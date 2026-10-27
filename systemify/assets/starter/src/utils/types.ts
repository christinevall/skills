/** Shared prop types, so every component spells the same idea the same way. */

/** A step on the spacing scale. Maps to var(--ds-space-<step>). */
export type Space = 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Heading levels: the document outline, independent of how big it looks. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** A link a component renders: label, destination, and whether it leaves the site. */
export interface LinkItem {
  /** The visible text. */
  label: string;
  /** Where it goes. */
  href: string;
  /** Opens another site. Adds an icon and a screen-reader hint. Detected from the href when left out. */
  external?: boolean;
}

/** An image a component renders. alt is required: '' marks it as decorative. */
export interface ImageSource {
  /** Image URL. */
  src: string;
  /** What the image shows, for people who cannot see it. Use '' only for pure decoration. */
  alt: string;
  /** Intrinsic width in px, to reserve space and avoid layout shift. */
  width?: number;
  /** Intrinsic height in px. */
  height?: number;
}

/** True for absolute http(s) links. */
export const isExternalHref = (href: string) => /^https?:\/\//.test(href);
