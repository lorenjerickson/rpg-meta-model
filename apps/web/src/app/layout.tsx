import '@dnd-domain/ui/styles.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { SIDENAV_COOKIE, isCollapsedCookie } from '../sidenavPreference';
import { AppShell } from './AppShell';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Wanderlust',
  description: 'A Victorian, steampunk and gothic-horror tabletop system',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const sidenavCollapsed = isCollapsedCookie((await cookies()).get(SIDENAV_COOKIE)?.value);
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        <AppShell initialCollapsed={sidenavCollapsed}>{children}</AppShell>
      </body>
    </html>
  );
}
