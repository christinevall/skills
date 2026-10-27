/** Small helpers used only by stories and docs pages. Not part of the public API. */

/** A tinted box that stands in for content in layout stories, labelled with its span. */
export function Box({ children = 'Content', tall = false }: { children?: React.ReactNode; tall?: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minBlockSize: tall ? 'var(--ds-size-80)' : 'var(--ds-size-48)',
        background: 'var(--ds-color-surface-subtle)',
        color: 'var(--ds-color-text-muted)',
        font: 'var(--ds-text-body-sm)',
      }}
    >
      {children}
    </div>
  );
}
