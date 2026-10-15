import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Panel } from './Panel';

describe('Panel', () => {
  it('renders its title and content', () => {
    expect(renderToStaticMarkup(<Panel title="Bestiary">Ghouls</Panel>)).toBe(
      '<section class="panel"><h2 class="panel-title">Bestiary</h2>Ghouls</section>',
    );
  });
});
