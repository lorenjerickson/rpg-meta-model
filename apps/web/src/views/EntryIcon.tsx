'use client';

import { Icon, isIconName, type IconName } from '@dnd-domain/ui';

/** The icon an entry shows without an image: its chosen icon, or its page's icon. */
export function entryIcon(chosen: string | undefined, fallback: IconName): IconName {
  return chosen && isIconName(chosen) ? chosen : fallback;
}

export function EntryIcon({
  chosen,
  fallback,
  size,
}: {
  chosen: string | undefined;
  fallback: IconName;
  size?: number;
}) {
  return <Icon name={entryIcon(chosen, fallback)} {...(size === undefined ? {} : { size })} />;
}
