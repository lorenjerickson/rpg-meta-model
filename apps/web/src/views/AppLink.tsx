'use client';

import { ButtonLink, Link, type ButtonLinkProps, type LinkProps } from '@dnd-domain/ui';
import NextLink from 'next/link';

/** A design-system link that navigates with the Next.js router. */
export function AppLink({ href, ...props }: Omit<LinkProps, 'as'> & { href: string }) {
  return <Link {...props} as={NextLink} href={href} />;
}

/** A design-system button link that navigates with the Next.js router. */
export function AppButtonLink({ href, ...props }: Omit<ButtonLinkProps, 'as'> & { href: string }) {
  return <ButtonLink {...props} as={NextLink} href={href} />;
}
