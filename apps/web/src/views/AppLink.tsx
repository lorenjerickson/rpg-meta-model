'use client';

import { Link, type LinkProps } from '@dnd-domain/ui';
import NextLink from 'next/link';

/** A design-system link that navigates with the Next.js router. */
export function AppLink({ href, ...props }: Omit<LinkProps, 'as'> & { href: string }) {
  return <Link {...props} as={NextLink} href={href} />;
}
