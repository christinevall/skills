/**
 * Joins class names and skips empty ones.
 * cx('ds-button', isWide && 'is-wide', className) -> "ds-button is-wide my-class"
 */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}
