import { renderToStaticMarkup } from 'react-dom/server';
import { inferShape, type ShapeError } from '@dnd-domain/utils';
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
  matchesQuery,
  MediaEditor,
  RadioGroup,
  ShapeForm,
  SideNav,
  Switch,
  TagInput,
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

describe('ShapeForm', () => {
  const shape = inferShape(
    [
      {
        id: 'sabre',
        name: 'Sabre',
        cost: 300,
        concealable: false,
        attribute: 'might',
        properties: ['finesse'],
        damage: { dice: '1d8' },
        parentId: null,
      },
      {
        id: 'rifle',
        name: 'Rifle',
        cost: 900,
        concealable: false,
        attribute: 'agility',
        properties: [],
        damage: { dice: '1d10' },
        parentId: 'sabre',
        capacity: 5,
      },
    ],
    {
      valueSets: [
        { name: 'attributes', values: ['might', 'agility'] },
        { name: 'weapon_properties', values: ['finesse', 'heavy'] },
      ],
      readOnly: ['id'],
    },
  );
  const render = (value: unknown, errors: ShapeError[] = []) =>
    html(<ShapeForm shape={shape} value={value} onChange={() => undefined} errors={errors} />);
  const sabre = {
    id: 'sabre',
    name: 'Sabre',
    cost: 300,
    concealable: false,
    attribute: 'might',
    properties: ['finesse'],
    damage: { dice: '1d8' },
    parentId: null,
  };

  it('generates a control for every kind of field', () => {
    const markup = render(sabre);
    // The id field is read-only.
    expect(markup).toMatch(/<input(?=[^>]*disabled="")(?=[^>]*value="sabre")[^>]*>/);
    expect(markup).toContain('type="number"');
    expect(markup).toContain('role="switch"');
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-label="Remove Finesse"');
    expect(render({ ...sabre, attribute: '' })).toContain('placeholder="Choose attribute…"');
    // A small object of simple fields is shown in place, under a light heading.
    expect(markup).toContain('<span class="ds-section__label">Damage</span>');
  });

  it('offers absent optional and null fields to add back', () => {
    const markup = render(sabre);
    expect(markup).toContain('+ Capacity');
    expect(markup).toContain('+ Parent id');
  });

  it('shows errors beside their fields', () => {
    expect(render(sabre, [{ path: ['cost'], message: 'must be a number' }])).toContain(
      'must be a number',
    );
  });
  it('edits a signed roll as one dice field, and summarises it in rows', () => {
    const armour = {
      modifiers: [{ kind: 'soak', count: 1, die: 4, sign: -1, damageTypes: ['cold'] }],
    };
    const form = inferShape([armour]);
    const rows = html(<ShapeForm shape={form} value={armour} onChange={() => undefined} />);
    expect(rows).toContain('<div class="ds-rows__detail">-1d4</div>');
    const soak = form.kind === 'object' ? form.fields[0]?.shape : undefined;
    const item = soak?.kind === 'array' ? soak.items : undefined;
    if (!item) throw new Error('no item shape');
    const fields = html(
      <ShapeForm shape={item} value={armour.modifiers[0]} onChange={() => undefined} />,
    );
    expect(fields).toContain('value="-1d4"');
    expect(fields).not.toContain('>Count<');
    expect(fields).not.toContain('>Sign<');
  });

  it('shows dice as notation in place', () => {
    const dice = inferShape([
      { damage: { dice: { terms: [{ count: 1, die: 12 }], modifier: 1 }, type: 'piercing' } },
    ]);
    const markup = html(
      <ShapeForm
        shape={dice}
        value={{
          damage: { dice: { terms: [{ count: 1, die: 12 }], modifier: 1 }, type: 'piercing' },
        }}
        onChange={() => undefined}
      />,
    );
    expect(markup).toContain('<span class="ds-section__label">Damage</span>');
    expect(markup).toContain('value="1d12 + 1"');
  });
});

describe('ShapeForm lists and nested objects', () => {
  const professions = [
    {
      name: 'Soldier',
      hitPoints: { average: 22, formula: { count: 4, die: 8 } },
      specializations: [
        { name: 'Rifleman', rank: 'apprentice', actions: [{ name: 'Steady Aim' }] },
        { name: 'Sniper', rank: 'journeyman', actions: [] },
      ],
    },
  ];
  const shape = inferShape(professions);
  const markup = html(
    <ShapeForm
      shape={shape}
      value={professions[0]}
      onChange={() => undefined}
      errors={[{ path: ['specializations', 1, 'rank'], message: 'is required' }]}
    />,
  );

  it('shows a list of entities as rows to edit or remove', () => {
    expect(markup).toContain('<span class="ds-section__label">Specializations</span>');
    expect(markup).toContain('<span class="ds-section__count">2</span>');
    expect(markup).toContain('>Rifleman</button>');
    expect(markup).toContain('Rank: Apprentice');
    expect(markup).toContain('aria-label="Edit Sniper"');
    expect(markup).toContain('aria-label="Remove Sniper"');
    expect(markup).toContain('+ Specialization');
  });

  it('keeps the rows’ own lists out of view until an item is opened', () => {
    expect(markup).not.toContain('Steady Aim');
  });

  it('shows a larger nested object as one row, and flags problems inside rows', () => {
    expect(markup).toContain('>Hit points</button>');
    expect(markup).toContain('Average: 22');
    expect(markup).toContain('aria-label="1 problems in Sniper"');
  });
});

describe('MediaEditor', () => {
  const props = {
    name: 'Ghoul',
    icon: 'skull' as const,
    defaultPrompt: 'Ghoul: a pallid eater of the dead',
    onUpload: () => undefined,
    onGenerate: () => undefined,
    onRemoveImage: () => undefined,
    onIconChange: () => undefined,
  };

  it('shows the icon without an image, and explains when generation is off', () => {
    const markup = html(<MediaEditor {...props} canGenerate={false} />);
    expect(markup).toContain('aria-label="Ghoul icon"');
    expect(markup).toContain('OPENAI_API_KEY');
    expect(markup).not.toContain('Remove image');
    expect(markup).toContain('aria-pressed="true"');
  });

  it('shows the image with a remove action', () => {
    const markup = html(<MediaEditor {...props} canGenerate imageUrl="/content/x.webp" />);
    expect(markup).toContain('<img class="ds-media__image" src="/content/x.webp" alt="Ghoul"/>');
    expect(markup).toContain('Remove image');
  });
});

describe('ShapeForm row titles', () => {
  const shape = inferShape([
    {
      weaponProficiencies: [{ category: 'simple' }],
      specializations: [{ name: 'Rifleman', rank: 'apprentice' }],
    },
  ]);

  it('names unnamed items by their first simple value, and untitled named ones by position', () => {
    const markup = html(
      <ShapeForm
        shape={shape}
        value={{
          weaponProficiencies: [{ category: 'martial' }],
          specializations: [{ name: '', rank: 'novice' }],
        }}
        onChange={() => undefined}
      />,
    );
    expect(markup).toContain('>Martial</button>');
    expect(markup).toContain('>Specialization 1</button>');
  });
});

describe('filtering long lists', () => {
  const many = Array.from({ length: 12 }, (_, index) => `Item ${String(index + 1)}`);

  it('matches every word, ignoring case and accents', () => {
    expect(matchesQuery('Café Society Gentlemen', 'cafe GENT')).toBe(true);
    expect(matchesQuery('Café Society', 'cafe club')).toBe(false);
    expect(matchesQuery('anything', '  ')).toBe(true);
  });

  it('puts a filter over lists longer than ten items, and not over short ones', () => {
    expect(html(<List aria-label="Ghouls" items={many} />)).toContain(
      'placeholder="Filter ghouls…"',
    );
    expect(html(<List items={many.slice(0, 3)} />)).not.toContain('ds-filter');
    expect(html(<List items={many.slice(0, 3)} filter />)).toContain('ds-filter');
    expect(html(<List items={many} />)).toContain(
      '<span class="ds-filter__count" aria-live="polite">12</span>',
    );
  });

  it('filters long side navigation, but not the collapsed strip', () => {
    const groups = [
      { label: 'Rules', items: many.map((label) => ({ label, icon: <Icon name="map" /> })) },
    ];
    expect(html(<SideNav title="System" groups={groups} />)).toContain(
      'placeholder="Filter destinations…"',
    );
    expect(
      html(<SideNav title="System" groups={groups} collapsible defaultCollapsed />),
    ).not.toContain('ds-filter');
  });

  it('filters the icon picker and long rows in generated forms', () => {
    const editor = html(
      <MediaEditor
        name="Ghoul"
        icon="skull"
        defaultPrompt=""
        canGenerate={false}
        onUpload={() => undefined}
        onGenerate={() => undefined}
        onRemoveImage={() => undefined}
        onIconChange={() => undefined}
      />,
    );
    expect(editor).toContain('placeholder="Filter icons…"');
    const shape = inferShape([{ traits: [{ name: 'Keen Smell' }] }]);
    const traits = many.map((name) => ({ name }));
    expect(
      html(<ShapeForm shape={shape} value={{ traits }} onChange={() => undefined} />),
    ).toContain('placeholder="Filter traits…"');
  });
});

describe('TagInput', () => {
  it('puts the tags inside the field as removable chips, before the text box', () => {
    const markup = html(
      <TagInput label="Tags" value={['Undead', 'Cultist']} onChange={() => undefined} />,
    );
    expect(markup).toMatch(/class="ds-tags ds-tags--md".*Undead.*Cultist.*<input/);
    expect(markup).toContain('aria-label="Remove Undead"');
    expect(markup).toContain('Type and press Tab or Enter to add');
    expect(markup).not.toContain('role="combobox"');
  });

  it('suggests from its options and shows their labels', () => {
    const markup = html(
      <TagInput
        label="Damage types"
        value={['fire']}
        options={[
          { value: 'fire', label: 'Fire' },
          { value: 'cold', label: 'Cold' },
        ]}
        onChange={() => undefined}
      />,
    );
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-label="Remove Fire"');
  });
});
