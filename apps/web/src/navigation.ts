import type { IconName } from '@dnd-domain/ui';

/** A secondary destination: a page under one of the top-level sections. */
export interface Destination {
  key: string;
  label: string;
  icon: IconName;
  /** What the page is for, shown on it until it is built. */
  description: string;
}

export interface DestinationGroup {
  label?: string;
  items: readonly Destination[];
}

/** A top-level destination in the header, with the secondary navigation beside its pages. */
export interface Section {
  key: string;
  label: string;
  description: string;
  groups: readonly DestinationGroup[];
}

const overview = (description: string): DestinationGroup => ({
  items: [{ key: 'overview', label: 'Overview', icon: 'layout-dashboard', description }],
});

export const SECTIONS: readonly Section[] = [
  {
    key: 'setup',
    label: 'Setup',
    description:
      'Prepare a table for play: who is playing, their characters, and the rules in use.',
    groups: [
      overview('Readiness at a glance: players, characters and the rules this table plays by.'),
      {
        label: 'Table',
        items: [
          {
            key: 'players',
            label: 'Players',
            icon: 'users',
            description: 'The people at this table and the Game Master.',
          },
          {
            key: 'invitations',
            label: 'Invitations',
            icon: 'mail',
            description: 'Invite players to the table and track who has joined.',
          },
          {
            key: 'safety',
            label: 'Safety tools',
            icon: 'shield-check',
            description:
              'Lines, veils and content warnings, agreed before play. The gothic horror and ' +
              'Madness rules make these worth settling up front.',
          },
        ],
      },
      {
        label: 'Characters',
        items: [
          {
            key: 'character-builder',
            label: 'Character builder',
            icon: 'user-plus',
            description:
              'Create a character: attributes by point buy, standard array or rolling; ethnicity, ' +
              'background, starting profession, skills and starting equipment.',
          },
          {
            key: 'roster',
            label: 'Roster',
            icon: 'contact',
            description: 'Every character at this table, with level, professions and ranks.',
          },
        ],
      },
      {
        label: 'Rules',
        items: [
          {
            key: 'house-rules',
            label: 'House rules',
            icon: 'scale',
            description:
              'Optional and variant rules, such as the solid-hit margin, base defense and ' +
              'Madness recovery.',
          },
          {
            key: 'dice',
            label: 'Dice',
            icon: 'dices',
            description:
              'How dice pools are rolled and shown: physical dice, digital rolls, or both.',
          },
        ],
      },
    ],
  },
  {
    key: 'system',
    label: 'System',
    description: 'The rules of the game: characters, equipment, science, combat and the bestiary.',
    groups: [
      overview('A map of the rules, from attributes to the bestiary.'),
      {
        label: 'Characters',
        items: [
          {
            key: 'attributes',
            label: 'Attributes',
            icon: 'gauge',
            description:
              'The eight attributes, Might to Sanity, and how modifiers become dice in a pool.',
          },
          {
            key: 'skills',
            label: 'Skills',
            icon: 'target',
            description: 'Period skills and the attribute each one uses.',
          },
          {
            key: 'ethnicities',
            label: 'Ethnicities',
            icon: 'globe',
            description:
              'Ethnicities of the late 1800s and early 1900s, with their traits and languages.',
          },
          {
            key: 'backgrounds',
            label: 'Backgrounds',
            icon: 'scroll',
            description: 'Where a character comes from, and what it gave them.',
          },
          {
            key: 'professions',
            label: 'Professions',
            icon: 'briefcase',
            description: 'Professions, their ranks and specialization trees.',
          },
          {
            key: 'feats',
            label: 'Feats',
            icon: 'award',
            description: 'Feats by category, with their prerequisites and benefits.',
          },
          {
            key: 'languages',
            label: 'Languages',
            icon: 'languages',
            description: 'Spoken and classical languages, cants and codes, and sign languages.',
          },
        ],
      },
      {
        label: 'Equipment',
        items: [
          {
            key: 'weapons',
            label: 'Weapons',
            icon: 'crosshair',
            description: 'Melee weapons and firearms: damage, reload times and misfires.',
          },
          {
            key: 'armour',
            label: 'Armour',
            icon: 'shield',
            description: 'Protective wear by body slot, with defense and soak.',
          },
          {
            key: 'gear',
            label: 'Gear',
            icon: 'backpack',
            description:
              'Tools, clothing and adventuring gear, priced in pounds, shillings and pence.',
          },
          {
            key: 'transport',
            label: 'Transport',
            icon: 'train-front',
            description: 'Mounts and vehicles, from hansom cabs to steam launches.',
          },
        ],
      },
      {
        label: 'Science',
        items: [
          {
            key: 'apparatus',
            label: 'Apparatus',
            icon: 'cog',
            description:
              'Scientific apparatus by discipline: their effects, charges and malfunctions.',
          },
          {
            key: 'preparations',
            label: 'Preparations',
            icon: 'flask-conical',
            description: 'Single-use preparations, from smelling salts to chlorine gas.',
          },
        ],
      },
      {
        label: 'Rules',
        items: [
          {
            key: 'combat',
            label: 'Combat',
            icon: 'swords',
            description:
              'Planned rounds, contested attacks against fixed defense, solid hits, soak and criticals.',
          },
          {
            key: 'actions',
            label: 'Actions',
            icon: 'zap',
            description: 'What a combatant can do in a round, and how long each step takes.',
          },
          {
            key: 'conditions',
            label: 'Conditions',
            icon: 'heart-pulse',
            description: 'Conditions and the dice and defense they add or take away.',
          },
          {
            key: 'rests',
            label: 'Rests',
            icon: 'bed-double',
            description: 'Short and long rests, and the lodgings that make them better or worse.',
          },
        ],
      },
      {
        label: 'Bestiary',
        items: [
          {
            key: 'bestiary',
            label: 'Creatures',
            icon: 'skull',
            description: 'Mutated beasts, reanimated dead, automata and anomalies.',
          },
          {
            key: 'encounter-budgets',
            label: 'Encounter budgets',
            icon: 'calculator',
            description: 'Experience budgets for building encounters of a chosen difficulty.',
          },
        ],
      },
    ],
  },
  {
    key: 'worlds',
    label: 'Worlds',
    description: 'The settings campaigns are played in: their places, people and secrets.',
    groups: [
      overview('A world at a glance: its era, its regions and what is stirring in it.'),
      {
        label: 'Atlas',
        items: [
          {
            key: 'maps',
            label: 'Maps',
            icon: 'map',
            description: 'City plans, regional maps and floor plans.',
          },
          {
            key: 'regions',
            label: 'Regions',
            icon: 'mountain',
            description: 'Countries, colonies and wildernesses, and who holds them.',
          },
          {
            key: 'locations',
            label: 'Locations',
            icon: 'map-pin',
            description: 'Specific places: a gentlemen’s club, an asylum, a flooded mine.',
          },
        ],
      },
      {
        label: 'Society',
        items: [
          {
            key: 'factions',
            label: 'Factions',
            icon: 'flag',
            description: 'Societies, cults, companies and governments, and what they want.',
          },
          {
            key: 'people',
            label: 'People',
            icon: 'users-round',
            description: 'Notable characters the players may meet, ally with or cross.',
          },
        ],
      },
      {
        label: 'Lore',
        items: [
          {
            key: 'history',
            label: 'History',
            icon: 'hourglass',
            description: 'Timelines and events that shaped the world.',
          },
          {
            key: 'mysteries',
            label: 'Mysteries',
            icon: 'eye',
            description:
              'What is really going on: who is behind the mutations and experiments. For the GM.',
          },
          {
            key: 'rumours',
            label: 'Rumours',
            icon: 'ear',
            description: 'Gossip, leads and lies the players can overhear.',
          },
        ],
      },
      {
        label: 'Bestiary',
        items: [
          {
            key: 'creatures',
            label: 'Creatures',
            icon: 'skull',
            description: 'This world’s creatures: system stat blocks and its own variants.',
          },
        ],
      },
    ],
  },
  {
    key: 'campaigns',
    label: 'Campaigns',
    description: 'Ongoing games: their sessions, encounters, party and story.',
    groups: [
      overview('A campaign at a glance: the next session, the party and open threads.'),
      {
        label: 'Play',
        items: [
          {
            key: 'sessions',
            label: 'Sessions',
            icon: 'calendar-days',
            description: 'Scheduled and past sessions, with notes.',
          },
          {
            key: 'encounters',
            label: 'Encounters',
            icon: 'swords',
            description: 'Encounters to run: combatants, plans for each round, and results.',
          },
        ],
      },
      {
        label: 'Party',
        items: [
          {
            key: 'characters',
            label: 'Characters',
            icon: 'users',
            description: 'The party: hit points, conditions, Madness and Exhaustion.',
          },
          {
            key: 'inventory',
            label: 'Inventory',
            icon: 'package',
            description: 'What the party carries, and its purse in pounds, shillings and pence.',
          },
        ],
      },
      {
        label: 'Story',
        items: [
          {
            key: 'quests',
            label: 'Quests',
            icon: 'milestone',
            description: 'Open threads and objectives.',
          },
          {
            key: 'journal',
            label: 'Journal',
            icon: 'notebook-pen',
            description: 'Accounts of each session and battle, written up for the players.',
          },
          {
            key: 'handouts',
            label: 'Handouts',
            icon: 'file-text',
            description: 'Letters, clippings, maps and photographs to give the players.',
          },
        ],
      },
    ],
  },
];

/** The path of a page: the section's own path for its overview. */
export function pagePath(section: Section, destination: Destination): string {
  return destination.key === 'overview' ? `/${section.key}` : `/${section.key}/${destination.key}`;
}

export function findSection(key: string): Section | undefined {
  return SECTIONS.find((section) => section.key === key);
}

export function findDestination(section: Section, key: string): Destination | undefined {
  return section.groups.flatMap((group) => group.items).find((item) => item.key === key);
}

/** The section and page a pathname points at, if any. */
export function locate(pathname: string): { section?: Section; destination?: Destination } {
  const [sectionKey = '', pageKey = 'overview'] = pathname.split('/').filter(Boolean);
  const section = findSection(sectionKey);
  if (!section) return {};
  const destination = findDestination(section, pageKey);
  return destination ? { section, destination } : { section };
}
