import { useState } from 'react';
import { cx } from '../../utils/cx';
import type { ImageSource } from '../../utils/types';
import './Image.css';

export interface ImageProps extends ImageSource, Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** Shape. auto keeps the image's own shape (portraits); 16/9 for features and cards; 1/1 for the photo strip. @default 'auto' */
  ratio?: 'auto' | '16/9' | '4/3' | '1/1';
  /** Load at once with high priority. Only for the one big image at the top of a page. @default false */
  priority?: boolean;
}

/**
 * An image with the radius from the tokens. A fixed ratio reserves the
 * space so the page does not jump; alt text is required (empty only for
 * decoration). A missing file shows a grey box with the alt text.
 */
export function Image({ src, alt, width, height, ratio = 'auto', priority = false, className, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cx('ds-image', className)} data-ratio={ratio} {...props}>
      {failed ? (
        <div className="ds-image__fallback" role={alt ? 'img' : undefined} aria-label={alt || undefined}>
          {alt}
        </div>
      ) : (
        <img
          className="ds-image__img"
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
