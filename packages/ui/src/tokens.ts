/**
 * The Dusk design tokens, for code that needs values rather than CSS variables (charts, canvas
 * drawing). Components and app styles should use the CSS variables from styles.css instead.
 */
export const colors = {
  'charcoal-950': '#15151a',
  'charcoal-900': '#1e1e25',
  'charcoal-800': '#2a2a33',
  'charcoal-700': '#3b3b47',
  ink: '#ece8f4',
  'ink-muted': '#a9a4b8',
  'purple-900': '#2b1f4d',
  'purple-600': '#7048e8',
  'purple-400': '#b197fc',
  'amber-400': '#f5b83d',
  'gold-200': '#f8d98a',
  'grey-600': '#55525f',
  'grey-500': '#7d7a88',
  'grey-400': '#9a97a6',
  'grey-300': '#c9c6d1',
  'grey-200': '#dedbe5',
  white: '#ffffff',
  success: '#5fd39a',
  danger: '#f87171',
} as const;

export type ColorToken = keyof typeof colors;

export const fonts = {
  sans: 'Montserrat, system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
} as const;

export const space = { 'space-1': 4, 'space-2': 8, 'space-4': 16, 'space-8': 32 } as const;

export const radius = { 'radius-sm': 4, 'radius-md': 8, 'radius-lg': 16 } as const;

export const elevation = {
  'elevation-1': '0 1px 2px rgba(0, 0, 0, 0.40), 0 1px 3px rgba(0, 0, 0, 0.30)',
  'elevation-2': '0 2px 4px rgba(0, 0, 0, 0.40), 0 4px 10px rgba(0, 0, 0, 0.35)',
  'elevation-3': '0 4px 8px rgba(0, 0, 0, 0.45), 0 10px 24px rgba(0, 0, 0, 0.40)',
  'elevation-4': '0 8px 16px rgba(0, 0, 0, 0.50), 0 20px 48px rgba(0, 0, 0, 0.55)',
} as const;
