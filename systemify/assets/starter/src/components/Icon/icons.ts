/**
 * A small outline icon set. 24×24
 * outline paths drawn in currentColor, so an icon takes the text colour.
 */
export const icons = {
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  menu: 'M3 8h18M9 16h12',
  close: 'M5 5l14 14M19 5 5 19',
  play: 'M8 5.5v13l11-6.5-11-6.5Z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  'chevron-down': 'm6 9 6 6 6-6',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 16v-4.5M12 8h.01',
  'check-circle': 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-4-10 2.8 2.8L16 9.5',
  'alert-circle': 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 7.5v5M12 16.5h.01',
} as const;

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];
