import { libraryConfig } from '@dnd-domain/config/tsdown';

export default libraryConfig({
  // The components use hooks and browser events, so Next.js must treat them as client components.
  banner: { js: "'use client';" },
  copy: ['src/styles.css'],
});
