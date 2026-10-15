import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Chip,
  Header,
  Icon,
  ICON_NAMES,
  IconButton,
  Input,
  List,
  Logo,
  RadioGroup,
  SideNav,
  Switch,
  Text,
  Toolbar,
} from './index';

const html = (element: React.ReactElement) => renderToStaticMarkup(element);

describe('Button', () => {
  it('defaults to a medium grey button and applies variants and sizes', () => {
    expect(html(<Button>Save</Button>)).toBe(
      '<button type="button" class="ds-btn ds-btn--default ds-btn--md">Save</button>',
    );
    expect(
      html(
        <Button variant="primary" size="lg">
          Go
        </Button>,
      ),
    ).toContain('class="ds-btn ds-btn--primary ds-btn--lg"');
  });
});

describe('form fields', () => {
  it('links the label and hint to the input, and marks errors', () => {
    const markup = html(<Input id="name" label="Name" hint="As on your papers" required />);
    expect(markup).toContain('<label for="name" class="ds-label">Name');
    expect(markup).toContain('aria-describedby="name-hint"');
    expect(markup).toContain('class="ds-input ds-input--md"');
    expect(html(<Input id="age" error="Too young" />)).toContain('aria-invalid="true"');
    expect(html(<Input id="age" error="Too young" />)).toContain('ds-hint ds-hint--error');
  });

  it('renders checkboxes, switches and radio groups', () => {
    expect(html(<Checkbox label="Armed" />)).toContain('class="ds-checkbox__input"');
    expect(html(<Switch label="Lamps lit" />)).toContain('role="switch"');
    const group = html(
      <RadioGroup label="Ration" options={['Bread', 'Salt pork']} defaultValue="Bread" />,
    );
    expect(group).toContain('role="radiogroup"');
    expect(group.match(/type="radio"/g)).toHaveLength(2);
    expect(group).toContain('checked=""');
  });
});

describe('Header', () => {
  const nav = [
    { key: 'setup', label: 'Setup' },
    { key: 'system', label: 'System' },
  ];

  it('marks the current destination and shows login without an account', () => {
    const markup = html(<Header productName="Wanderlust" nav={nav} current="system" />);
    expect(markup).toContain('<span class="ds-header__wordmark">Wanderlust</span>');
    expect(markup).toContain('class="ds-header__link is-current" aria-current="page">System');
    expect(markup).toContain('Log in');
  });

  it('shows the account avatar with initials', () => {
    const markup = html(
      <Header
        nav={nav}
        account={{ name: 'Ada Lovelace' }}
        showAccountName={false}
        logo={<Logo />}
      />,
    );
    expect(markup).toContain('ds-avatar--initials" aria-hidden="true">AL</span>');
    expect(markup).not.toContain('ds-acct__name');
    expect(markup).toContain('class="ds-logo"');
  });
});

describe('navigation', () => {
  it('ends a breadcrumb in the current page', () => {
    const markup = html(
      <Breadcrumb items={[{ label: 'Worlds', href: '/worlds' }, { label: 'Londinium' }]} />,
    );
    expect(markup).toContain('<a class="ds-crumbs__link" href="/worlds">Worlds</a>');
    expect(markup).toContain(
      '<span class="ds-crumbs__current" aria-current="page">Londinium</span>',
    );
  });

  it('marks the current side navigation item and its badge', () => {
    const markup = html(
      <SideNav
        title="Worlds"
        current="maps"
        groups={[{ label: 'Atlas', items: [{ key: 'maps', label: 'Maps', badge: 3 }] }]}
      />,
    );
    expect(markup).toContain('ds-sidenav__link is-current');
    expect(markup).toContain('>3</span>');
    expect(markup).toContain(', 3 new items');
  });
});

describe('Badge and Chip', () => {
  it('caps counts and hides zero', () => {
    expect(html(<Badge count={120} />)).toContain('>99+<');
    expect(html(<Badge count={0} />)).toBe('');
    expect(html(<Badge />)).toContain('ds-badge--dot');
  });

  it('labels the remove control', () => {
    expect(html(<Chip label="Occult" onRemove={() => undefined} />)).toContain(
      'aria-label="Remove Occult"',
    );
  });
});

describe('List, Card, Toolbar and Text', () => {
  it('renders simple, rich and columnar lists', () => {
    expect(html(<List items={['Ghoul', 'Deep One']} />)).toContain('ds-list__item--simple');
    expect(html(<List items={[{ title: 'Ghoul', meta: 'CR 1' }]} />)).toContain(
      '<div class="ds-list__meta">CR 1</div>',
    );
    const table = html(
      <List
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'cr', header: 'CR', numeric: true },
        ]}
        items={[{ name: 'Ghoul', cr: 1 }]}
      />,
    );
    expect(table).toContain('<table class="ds-list ds-list--md ds-list--table">');
    expect(table).toContain('ds-list__cell--right ds-list__cell--num">1</td>');
  });

  it('renders a card with its parts', () => {
    const markup = html(
      <Card eyebrow="Profession" title="Soldier">
        Drilled and steady.
      </Card>,
    );
    expect(markup).toContain('<h3 class="ds-card__title">Soldier</h3>');
    expect(markup).toContain('ds-card__eyebrow');
  });

  it('gives only the first toolbar button a tab stop', () => {
    const markup = html(
      <Toolbar
        aria-label="Map tools"
        items={[{ label: 'Pan' }, { separator: true }, { label: 'Zoom' }]}
      />,
    );
    expect(markup.match(/tabindex="0"/g)).toHaveLength(1);
    expect(markup).toContain('role="separator"');
  });

  it('maps text styles to elements', () => {
    expect(html(<Text variant="heading-1">System</Text>)).toBe(
      '<h1 class="ds-text ds-text--heading-1">System</h1>',
    );
    expect(html(<Text muted>Quiet</Text>)).toBe(
      '<p class="ds-text ds-text--body ds-text--muted">Quiet</p>',
    );
  });
});

describe('icons and the collapsible SideNav', () => {
  it('draws named icons, decorative unless labelled', () => {
    expect(html(<Icon name="map" />)).toContain('aria-hidden="true"');
    expect(html(<Icon name="map" label="Maps" />)).toContain('aria-label="Maps"');
    expect(ICON_NAMES).toContain('skull');
  });

  it('labels icon buttons for screen readers and as a tooltip', () => {
    const markup = html(<IconButton icon="menu" label="Open navigation" />);
    expect(markup).toContain('aria-label="Open navigation"');
    expect(markup).toContain('title="Open navigation"');
    expect(markup).toContain('class="ds-iconbtn"');
  });

  const groups = [
    {
      label: 'Atlas',
      items: [{ key: 'maps', label: 'Maps', icon: <Icon name="map" />, badge: 4 }],
    },
  ];

  it('offers a collapse toggle when collapsible', () => {
    const markup = html(<SideNav title="Worlds" groups={groups} collapsible />);
    expect(markup).toContain('aria-label="Collapse navigation"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).not.toContain('ds-sidenav--collapsed');
  });

  it('collapses to icons, keeping labels for screen readers and as tooltips', () => {
    const markup = html(<SideNav title="Worlds" groups={groups} collapsible defaultCollapsed />);
    expect(markup).toContain('ds-sidenav--collapsed');
    expect(markup).toContain('aria-label="Expand navigation"');
    expect(markup).toContain('title="Maps"');
    expect(markup).toContain('<span class="ds-sidenav__label">Maps</span>');
    expect(markup).toContain('ds-badge--dot');
    expect(markup).toContain(', 4 new items');
  });

  it('never collapses or shows the toggle as a modal drawer', () => {
    const markup = html(<SideNav title="Worlds" groups={groups} modal collapsible collapsed />);
    expect(markup).not.toContain('ds-sidenav--collapsed');
    expect(markup).not.toContain('Collapse navigation');
  });
});
