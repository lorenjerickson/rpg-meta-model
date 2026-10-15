'use client';

import {
  Header,
  Icon,
  IconButton,
  Logo,
  SideNav,
  type NavItem,
  type SideNavGroup,
} from '@dnd-domain/ui';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { SECTIONS, locate, pagePath, type Section } from '../navigation';
import { saveSidenavCollapsed } from '../sidenavPreference';

const NAV: readonly NavItem[] = SECTIONS.map((section) => ({
  key: section.key,
  label: section.label,
  href: `/${section.key}`,
}));

// Placeholder until accounts are wired up.
const ACCOUNT = { name: 'Account' };

function sideNavGroups(section: Section): SideNavGroup[] {
  return section.groups.map((group) => ({
    ...(group.label === undefined ? {} : { label: group.label }),
    items: group.items.map((item) => ({
      key: item.key,
      label: item.label,
      href: pagePath(section, item),
      icon: <Icon name={item.icon} />,
    })),
  }));
}

/**
 * The app's frame: the top navigation bar, the current section's secondary navigation (a drawer
 * on the left that collapses to icons, or an overlay on phones), and the page.
 */
export function AppShell({
  children,
  initialCollapsed,
}: {
  children: ReactNode;
  /** The saved collapsed state of the secondary navigation, read by the server. */
  initialCollapsed: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { section, destination } = locate(pathname);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const changeCollapsed = (next: boolean) => {
    setCollapsed(next);
    saveSidenavCollapsed(next);
  };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const groups = section ? sideNavGroups(section) : [];
  const navigate = (_key: string, item: { href?: string }) => {
    if (item.href) router.push(item.href);
  };

  return (
    <>
      <Header
        sticky
        logo={<Logo collapse />}
        productName="Wanderlust"
        logoHref="/"
        nav={NAV}
        {...(section ? { current: section.key } : {})}
        onNavigate={navigate}
        actions={
          section ? (
            <span className="shell__menu">
              <IconButton
                icon="menu"
                label={`${section.label} navigation`}
                aria-expanded={drawerOpen}
                onClick={() => {
                  setDrawerOpen(true);
                }}
              />
            </span>
          ) : undefined
        }
        account={ACCOUNT}
        showAccountName={false}
      />
      <div className="shell">
        {section ? (
          <SideNav
            className="shell__sidenav"
            title={section.label}
            groups={groups}
            {...(destination ? { current: destination.key } : {})}
            onNavigate={navigate}
            collapsible
            collapsed={collapsed}
            onCollapsedChange={changeCollapsed}
          />
        ) : null}
        <main className="page">{children}</main>
      </div>
      {section ? (
        <SideNav
          modal
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
          }}
          title={section.label}
          groups={groups}
          {...(destination ? { current: destination.key } : {})}
          onNavigate={navigate}
        />
      ) : null}
    </>
  );
}
