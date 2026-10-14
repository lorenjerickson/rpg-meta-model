/**
 * Play-tests contested combat: runs duels between strong and weak attackers and defenders,
 * with assorted weapons, armour and conditions, and prints the results as markdown tables.
 *
 * Usage: npm run simulate -- [--seed 1890] [--trials 5] [--rounds 20]
 *
 * Each duel is one-way: the attacker makes one attack per round, up to the round limit, until
 * the defender drops.
 */
import {
  characterAttackPool,
  characterDamageRoll,
  characterDefense,
  characterSoakPool,
  damageAfterSoak,
  findItem,
  findMonster,
  effectiveSoak,
  monsterDefense,
  monsterSoakPool,
  poolAverage,
  resolveContest,
  rollContest,
  rollDamage,
  type Character,
  type Condition,
  type DamageResponses,
  type DamageType,
  type DiceExpression,
  type MonsterStatBlock,
  type PoolDie,
  type Rng,
  type WeaponDefinition,
  type WeaponProficiency,
} from '../src';

function option(name: string, fallback: number): number {
  const index = process.argv.indexOf(`--${name}`);
  const value = index >= 0 ? Number(process.argv[index + 1]) : fallback;
  if (!Number.isFinite(value)) {
    throw new Error(`--${name} must be a number`);
  }
  return value;
}

const SEED = option('seed', 1890);
const TRIALS = option('trials', 5);
const MAX_ROUNDS = option('rounds', 20);

/** Seeded RNG (mulberry32) so runs are reproducible. */
function mulberry32(seed: number): Rng {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(SEED);

// ---------- Combatants ----------

interface CharacterInput {
  name: string;
  level: number;
  scores?: Partial<Character['attributeScores']>;
  weapons?: readonly WeaponProficiency[];
  armor?: Character['proficiencies']['armor'];
  items: readonly string[];
  hp: number;
}

function character(input: CharacterInput): Character {
  return {
    id: input.name,
    name: input.name,
    ethnicityId: 'english',
    backgroundId: 'enlisted',
    professions: [{ professionId: 'soldier', level: input.level, specializationPath: [] }],
    experience: 0,
    size: 'medium',
    speed: { walk: 30 },
    senses: {},
    attributeScores: {
      might: 10,
      agility: 10,
      hardiness: 10,
      intellect: 10,
      wisdom: 10,
      charisma: 10,
      fortune: 10,
      sanity: 10,
      ...input.scores,
    },
    hitPoints: { current: input.hp, max: input.hp, temporary: 0 },
    hitDiceSpent: {},
    deathSaves: { successes: 0, failures: 0 },
    exhaustion: 0,
    madness: 0,
    conditions: [],
    heroicInspiration: false,
    proficiencies: {
      savingThrows: [],
      skills: {},
      weapons: input.weapons ?? [],
      armor: input.armor ?? [],
      tools: [],
      languages: ['english'],
      disciplines: [],
    },
    feats: [],
    inventory: input.items.map((itemId) => ({ itemId, quantity: 1, equipped: true })),
    money: 0,
  };
}

function weapon(id: string): WeaponDefinition {
  const item = findItem(id);
  if (item?.category !== 'weapon') {
    throw new Error(`${id} is not a weapon`);
  }
  return item;
}

function monster(id: string): MonsterStatBlock {
  const found = findMonster(id);
  if (found === undefined) {
    throw new Error(`Unknown monster ${id}`);
  }
  return found;
}

interface DamageDice {
  dice: DiceExpression;
  pool: readonly PoolDie[];
  type: DamageType;
}

interface Attacker {
  label: string;
  attackType: 'melee' | 'ranged';
  pool: () => readonly PoolDie[];
  damage: () => readonly DamageDice[];
}

interface Defender {
  label: string;
  hp: number;
  defense: (attackType: 'melee' | 'ranged') => number;
  soak: (type: DamageType) => readonly PoolDie[];
  responses: DamageResponses;
}

function characterAttacker(
  label: string,
  char: Character,
  weaponId: string,
  twoHanded = false,
): Attacker {
  const held = weapon(weaponId);
  return {
    label,
    attackType: held.weaponType,
    pool: () => characterAttackPool(char, held),
    damage: () => {
      const roll = characterDamageRoll(char, held, twoHanded);
      return [{ dice: roll.dice, pool: roll.pool, type: held.damage.type }];
    },
  };
}

function monsterAttacker(label: string, monsterId: string, actionId: string): Attacker {
  const attack = monster(monsterId).actions.find((entry) => entry.id === actionId)?.attack;
  if (attack === undefined) {
    throw new Error(`${monsterId} has no attack ${actionId}`);
  }
  return {
    label,
    attackType: attack.kind === 'ranged' ? 'ranged' : 'melee',
    pool: () => attack.pool,
    damage: () =>
      attack.damage.map((entry) => ({
        dice: entry.dice,
        pool: entry.pool ?? [],
        type: entry.type,
      })),
  };
}

function characterDefender(label: string, char: Character): Defender {
  return {
    label,
    hp: char.hitPoints.max,
    defense: (attackType) => characterDefense(char, attackType),
    soak: (type) => characterSoakPool(char, type),
    responses: {},
  };
}

function monsterDefender(label: string, monsterId: string, conditions: Condition[] = []): Defender {
  const block = monster(monsterId);
  return {
    label,
    hp: block.hitPoints.average,
    defense: (attackType) => monsterDefense(block, attackType, conditions),
    soak: (type) => monsterSoakPool(block, type, conditions),
    responses: {
      ...(block.resistances && { resistances: block.resistances }),
      ...(block.vulnerabilities && { vulnerabilities: block.vulnerabilities }),
      ...(block.damageImmunities && { immunities: block.damageImmunities }),
    },
  };
}

const urchinChar = character({
  name: 'Urchin',
  level: 1,
  scores: { agility: 12 },
  weapons: [{ category: 'simple' }],
  items: ['pocket-knife'],
  hp: 9,
});
const constableChar = character({
  name: 'Constable',
  level: 3,
  scores: { agility: 14, might: 12 },
  weapons: [{ category: 'simple' }, { weaponId: 'service-revolver' }],
  items: ['service-revolver'],
  hp: 24,
});
const bruiserChar = character({
  name: 'Bruiser',
  level: 9,
  scores: { might: 18 },
  weapons: [{ category: 'simple' }, { category: 'martial' }],
  items: ['fire-axe'],
  hp: 80,
});
const marksmanChar = character({
  name: 'Marksman',
  level: 9,
  scores: { agility: 18 },
  weapons: [{ category: 'simple' }, { category: 'martial' }],
  items: ['bolt-action-rifle', 'telescopic-sight'],
  hp: 70,
});

const clerkChar = character({
  name: 'Clerk',
  level: 3,
  items: ['bowler-hat', 'travelling-clothes', 'leather-gloves', 'dress-shoes'],
  hp: 20,
});
const soldierChar = character({
  name: 'Soldier',
  level: 5,
  armor: ['light', 'medium', 'shield'],
  items: [
    'steel-helmet',
    'trench-armour',
    'leather-bracers',
    'leather-gloves',
    'leather-chaps',
    'work-boots',
    'trench-shield',
  ],
  hp: 44,
});

const urchin = characterAttacker('Urchin, pocket knife', urchinChar, 'pocket-knife');
const constable = characterAttacker(
  'Constable, service revolver',
  constableChar,
  'service-revolver',
);
const bruiser = characterAttacker('Bruiser, fire axe 2H', bruiserChar, 'fire-axe', true);
const marksman = characterAttacker('Marksman, rifle + scope', marksmanChar, 'bolt-action-rifle');

const clerk = characterDefender('Clerk, everyday clothes', clerkChar);
const soldier = characterDefender('Soldier, trench kit + shield', soldierChar);

const ATTACKERS: readonly Attacker[] = [
  urchin,
  constable,
  monsterAttacker('Ghoul, bite', 'ghoul', 'bite'),
  bruiser,
  marksman,
  monsterAttacker('Steam Juggernaut, piston fist', 'steam-juggernaut', 'piston-fist'),
];

const DEFENDERS: readonly Defender[] = [
  clerk,
  characterDefender(
    'Frontier hand, duster',
    character({
      name: 'Frontier hand',
      level: 4,
      armor: ['light'],
      items: ['flat-cap', 'leather-duster', 'leather-gloves', 'work-boots'],
      hp: 34,
    }),
  ),
  monsterDefender('Ghoul', 'ghoul'),
  soldier,
  characterDefender(
    'Boilerplate suit',
    character({
      name: 'Boilerplate',
      level: 5,
      armor: ['light', 'medium', 'heavy'],
      items: ['boilerplate-suit'],
      hp: 44,
    }),
  ),
  monsterDefender('Steam Juggernaut', 'steam-juggernaut'),
];

const VARIANTS: readonly (readonly [string, Attacker, Defender])[] = [
  [
    'Attacker Poisoned',
    characterAttacker(
      constable.label,
      { ...constableChar, conditions: ['poisoned'] },
      'service-revolver',
    ),
    clerk,
  ],
  [
    'Attacker Exhaustion 2',
    characterAttacker(constable.label, { ...constableChar, exhaustion: 2 }, 'service-revolver'),
    clerk,
  ],
  [
    'Defender Prone vs melee',
    bruiser,
    characterDefender(soldier.label, { ...soldierChar, conditions: ['prone'] }),
  ],
  [
    'Defender Prone vs ranged',
    marksman,
    characterDefender(soldier.label, { ...soldierChar, conditions: ['prone'] }),
  ],
  [
    'Defender Restrained',
    bruiser,
    characterDefender(soldier.label, { ...soldierChar, conditions: ['restrained'] }),
  ],
  [
    'Defender Unseen',
    marksman,
    characterDefender(clerk.label, { ...clerkChar, conditions: ['unseen'] }),
  ],
  [
    'Defender Paralyzed',
    monsterAttacker('Ghoul, bite', 'ghoul', 'bite'),
    characterDefender(clerk.label, { ...clerkChar, conditions: ['paralyzed'] }),
  ],
  [
    'Attacker Unseen',
    characterAttacker(urchin.label, { ...urchinChar, conditions: ['unseen'] }, 'pocket-knife'),
    soldier,
  ],
];

// ---------- Simulation ----------

interface TrialStats {
  attacks: number;
  hits: number;
  crits: number;
  damage: number;
  soaked: number;
  attackTotal: number;
  defenseTotal: number;
  rounds: number | null;
}

function runTrial(attacker: Attacker, defender: Defender): TrialStats {
  let hp = defender.hp;
  const stats: TrialStats = {
    attacks: 0,
    hits: 0,
    crits: 0,
    damage: 0,
    soaked: 0,
    attackTotal: 0,
    defenseTotal: 0,
    rounds: null,
  };
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const attack = rollContest(attacker.pool(), { rng });
    const defense = defender.defense(attacker.attackType);
    const outcome = resolveContest(attack.total, defense);
    stats.attacks += 1;
    stats.attackTotal += attack.total;
    stats.defenseTotal += defense;
    if (outcome.success) {
      stats.hits += 1;
      stats.crits += outcome.critical ? 1 : 0;
      for (const entry of attacker.damage()) {
        const raw = rollDamage(entry.dice, entry.pool, outcome.critical, rng);
        const soak = effectiveSoak(
          rollContest(defender.soak(entry.type), { d20: false, rng }).total,
          outcome,
        );
        const dealt = damageAfterSoak(raw, soak, entry.type, defender.responses);
        stats.soaked += Math.min(raw, soak);
        stats.damage += dealt;
        hp -= dealt;
      }
    }
    if (hp <= 0) {
      stats.rounds = round;
      break;
    }
  }
  return stats;
}

interface PairingResult {
  hitRate: number;
  critRate: number;
  damagePerHit: number;
  soakPerHit: number;
  avgAttack: number;
  avgDefense: number;
  rounds: number[];
}

function runPairing(attacker: Attacker, defender: Defender): PairingResult {
  const trials = Array.from({ length: TRIALS }, () => runTrial(attacker, defender));
  const sum = (key: Exclude<keyof TrialStats, 'rounds'>) =>
    trials.reduce((total, trial) => total + trial[key], 0);
  const attacks = sum('attacks');
  const hits = sum('hits');
  const perHit = (total: number) => (hits === 0 ? 0 : total / hits);
  return {
    hitRate: hits / attacks,
    critRate: perHit(sum('crits')),
    damagePerHit: perHit(sum('damage')),
    soakPerHit: perHit(sum('soaked')),
    avgAttack: sum('attackTotal') / attacks,
    avgDefense: sum('defenseTotal') / attacks,
    rounds: trials.flatMap((trial) => (trial.rounds === null ? [] : [trial.rounds])),
  };
}

// ---------- Report ----------

const percent = (value: number) => `${String(Math.round(value * 100))}%`;
const decimal = (value: number) => value.toFixed(1);

function resultCells(result: PairingResult): string[] {
  return [
    percent(result.hitRate),
    percent(result.critRate),
    decimal(result.damagePerHit),
    decimal(result.soakPerHit),
    `${decimal(result.avgAttack)} vs ${decimal(result.avgDefense)}`,
    `${String(result.rounds.length)}/${String(TRIALS)}`,
    result.rounds.length === 0 ? '—' : result.rounds.join(', '),
  ];
}

function table(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const line = (cells: readonly string[]) => `| ${cells.join(' | ')} |`;
  return [line(header), line(header.map(() => '---')), ...rows.map(line)].join('\n');
}

const RESULT_HEADER = [
  'Hit %',
  'Crit %',
  'Dmg / hit',
  'Soaked / hit',
  'Avg atk vs def',
  'Dropped',
  'Rounds to drop',
];

const matrixRows = ATTACKERS.flatMap((attacker) =>
  DEFENDERS.map((defender) => [
    attacker.label,
    defender.label,
    ...resultCells(runPairing(attacker, defender)),
  ]),
);
const variantRows = VARIANTS.map(([variant, attacker, defender]) => [
  variant,
  `${attacker.label} vs ${defender.label}`,
  ...resultCells(runPairing(attacker, defender)),
]);

const averages = [
  ...ATTACKERS.map((attacker) => [
    attacker.label,
    'attack',
    decimal(10.5 + poolAverage(attacker.pool())),
  ]),
  ...DEFENDERS.map((defender) => [defender.label, 'defense', String(defender.defense('melee'))]),
];

console.log(
  [
    `# Combat simulation`,
    '',
    `Seed ${String(SEED)}, ${String(TRIALS)} duels per pairing, up to ${String(MAX_ROUNDS)} rounds, ` +
      'one attack per round.',
    '',
    '## Average rolls',
    '',
    table(['Combatant', 'Roll', 'Average'], averages),
    '',
    '## Matchups',
    '',
    table(['Attacker', 'Defender', ...RESULT_HEADER], matrixRows),
    '',
    '## Conditions',
    '',
    table(['Variant', 'Matchup', ...RESULT_HEADER], variantRows),
  ].join('\n'),
);
