/**
 * Whether the secondary navigation is collapsed to icons, remembered in a cookie so the server
 * renders it in the saved state on the next visit.
 */
export const SIDENAV_COOKIE = 'sidenav-collapsed';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function isCollapsedCookie(value: string | undefined): boolean {
  return value === '1';
}

/** Saves the preference from the browser. */
export function saveSidenavCollapsed(collapsed: boolean): void {
  document.cookie = `${SIDENAV_COOKIE}=${collapsed ? '1' : '0'}; path=/; max-age=${String(ONE_YEAR_IN_SECONDS)}; samesite=lax`;
}
