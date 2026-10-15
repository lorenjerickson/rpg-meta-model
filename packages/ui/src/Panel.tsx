import type { ReactNode } from 'react';

export interface PanelProps {
  title: string;
  children?: ReactNode;
}

/** A titled section of content. */
export function Panel({ title, children }: PanelProps) {
  return (
    <section className="panel">
      <h2 className="panel-title">{title}</h2>
      {children}
    </section>
  );
}
