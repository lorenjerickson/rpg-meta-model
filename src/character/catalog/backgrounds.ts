import { lsd, type Money } from '../../core/currency';
import { findItem } from '../../equipment/catalog';
import type { BackgroundDefinition } from '../backgrounds';
import type { EquipmentOption } from '../startingEquipment';

/** What every background's equipment is worth: the kit plus change, or this in money. */
export const BACKGROUND_EQUIPMENT_VALUE: Money = lsd(15);

/** The total value of an equipment option: its items at catalog prices plus its money. */
export function equipmentOptionValue(option: EquipmentOption): Money {
  return option.items.reduce(
    (total, { itemId, quantity }) => total + (findItem(itemId)?.cost ?? 0) * quantity,
    option.money,
  );
}

type BackgroundInput = Omit<BackgroundDefinition, 'id' | 'equipment'> & {
  /** Item ids in the kit, one of each. */
  kit: readonly string[];
};

function background(id: string, input: BackgroundInput): BackgroundDefinition {
  const { kit, ...rest } = input;
  const items = kit.map((itemId) => ({ itemId, quantity: 1 }));
  const itemsValue = equipmentOptionValue({ label: '', items, money: 0 });
  return {
    id,
    ...rest,
    equipment: [
      { label: 'A', items, money: BACKGROUND_EQUIPMENT_VALUE - itemsValue },
      { label: 'B', items: [], money: BACKGROUND_EQUIPMENT_VALUE },
    ],
  };
}

/** Backgrounds of the late 19th and early 20th centuries. A first draft. */
export const BACKGROUNDS: readonly BackgroundDefinition[] = [
  background('aristocrat', {
    name: 'Aristocrat',
    description: 'Born to a title or old money, raised among servants, tutors and country houses.',
    attributes: ['charisma', 'intellect', 'fortune'],
    feat: 'well-connected',
    skillProficiencies: ['etiquette', 'persuasion'],
    toolProficiency: 'chess-set',
    kit: ['evening-dress', 'travelling-clothes', 'pocket-watch', 'chess-set', 'walking-cane'],
  }),
  background('clerk', {
    name: 'Clerk',
    description: 'You kept ledgers and copied letters in a counting house or government office.',
    attributes: ['intellect', 'agility', 'wisdom'],
    feat: 'skilled',
    skillProficiencies: ['bureaucracy', 'investigation'],
    toolProficiency: 'writing-kit',
    kit: ['writing-kit', 'travelling-clothes', 'pocket-watch', 'notebook-and-pencil', 'umbrella'],
  }),
  background('domestic-servant', {
    name: 'Domestic Servant',
    description: 'You served in a great house, seen by everyone and noticed by no one.',
    attributes: ['agility', 'wisdom', 'charisma'],
    feat: 'alert',
    skillProficiencies: ['etiquette', 'stealth'],
    toolProficiency: 'cooks-utensils',
    kit: ['cooks-utensils', 'work-clothes', 'travelling-clothes', 'notebook-and-pencil'],
  }),
  background('factory-hand', {
    name: 'Factory Hand',
    description: 'You worked twelve-hour shifts at a loom, lathe or furnace from childhood.',
    attributes: ['might', 'hardiness', 'agility'],
    feat: 'tough-constitution',
    skillProficiencies: ['athletics', 'mechanics'],
    toolProficiency: 'tinkers-tools',
    kit: ['tinkers-tools', 'work-clothes', 'box-of-matches', 'hip-flask'],
  }),
  background('farmhand', {
    name: 'Farmhand',
    description: 'You grew up working the land, with animals and weather for company.',
    attributes: ['might', 'hardiness', 'wisdom'],
    feat: 'hard-hitter',
    skillProficiencies: ['animal-handling', 'natural-history'],
    toolProficiency: 'carpenters-tools',
    kit: ['carpenters-tools', 'work-clothes', 'pitchfork', 'canteen', 'bedroll'],
  }),
  background('homesteader', {
    name: 'Homesteader',
    description: 'Your family claimed land on a frontier and held it against everything.',
    attributes: ['might', 'hardiness', 'wisdom'],
    feat: 'field-medic',
    skillProficiencies: ['survival', 'animal-handling'],
    toolProficiency: 'leatherworkers-tools',
    kit: ['leatherworkers-tools', 'hatchet', 'tent', 'bedroll', 'canteen', 'first-aid-kit'],
  }),
  background('street-urchin', {
    name: 'Street Urchin',
    description: 'You grew up on the streets and in the rookeries, living on luck and nerve.',
    attributes: ['agility', 'fortune', 'wisdom'],
    feat: 'charmed-life',
    skillProficiencies: ['streetwise', 'stealth'],
    toolProficiency: 'burglars-tools',
    kit: ['burglars-tools', 'pocket-knife', 'work-clothes', 'box-of-matches'],
  }),
  background('convict', {
    name: 'Convict',
    description: 'You served time in a prison, a hulk or a penal colony, and learned its trades.',
    attributes: ['agility', 'hardiness', 'intellect'],
    feat: 'alert',
    skillProficiencies: ['deception', 'streetwise'],
    toolProficiency: 'forgery-kit',
    kit: ['forgery-kit', 'work-clothes', 'brass-knuckles'],
  }),
  background('enlisted', {
    name: 'Enlisted',
    description: 'You served in the ranks, in garrisons and on campaign.',
    attributes: ['might', 'agility', 'hardiness'],
    feat: 'hard-hitter',
    skillProficiencies: ['athletics', 'gambling'],
    toolProficiency: 'playing-cards',
    kit: ['playing-cards', 'service-revolver', 'pistol-cartridges', 'canteen', 'bedroll'],
  }),
  background('seafarer', {
    name: 'Seafarer',
    description: 'You grew up on ships and in ports, and know the sea in all its moods.',
    attributes: ['might', 'agility', 'wisdom'],
    feat: 'tough-constitution',
    skillProficiencies: ['athletics', 'perception'],
    toolProficiency: 'navigators-tools',
    kit: ['navigators-tools', 'hemp-rope', 'work-clothes', 'pocket-knife', 'hip-flask'],
  }),
  background('emigrant', {
    name: 'Emigrant',
    description: 'You left home for a new country with everything you owned in one trunk.',
    attributes: ['hardiness', 'wisdom', 'fortune'],
    feat: 'polyglot',
    skillProficiencies: ['bureaucracy', 'survival'],
    toolProficiency: 'dice-set',
    kit: ['dice-set', 'steamer-trunk', 'travelling-clothes', 'canteen'],
  }),
  background('seminarian', {
    name: 'Seminarian',
    description: 'You trained for holy orders and saw what faith asks of people.',
    attributes: ['intellect', 'wisdom', 'charisma'],
    feat: 'iron-nerves',
    skillProficiencies: ['theology', 'insight'],
    toolProficiency: 'writing-kit',
    kit: ['writing-kit', 'travelling-clothes', 'notebook-and-pencil', 'oil-lantern'],
  }),
  background('graduate', {
    name: 'Graduate',
    description: 'You read for a degree at a university, and kept reading after.',
    attributes: ['intellect', 'wisdom', 'sanity'],
    feat: 'skilled',
    skillProficiencies: ['science', 'history'],
    toolProficiency: 'writing-kit',
    kit: ['writing-kit', 'travelling-clothes', 'magnifying-glass', 'notebook-and-pencil', 'valise'],
  }),
  background('laboratory-assistant', {
    name: 'Laboratory Assistant',
    description: 'You washed the glassware and took the notes for a scientist who went too far.',
    attributes: ['intellect', 'agility', 'sanity'],
    feat: 'amateur-scientist',
    skillProficiencies: ['science', 'medicine'],
    toolProficiency: 'chemists-kit',
    kit: ['chemists-kit', 'work-clothes', 'notebook-and-pencil', 'gas-mask', 'smelling-salts'],
  }),
  background('bohemian', {
    name: 'Bohemian',
    description: 'You lived among artists, poets and musicians in cheap garrets and late cafés.',
    attributes: ['charisma', 'agility', 'sanity'],
    feat: 'crowd-pleaser',
    skillProficiencies: ['performance', 'insight'],
    toolProficiency: 'violin',
    kit: ['violin', 'travelling-clothes', 'hip-flask', 'notebook-and-pencil'],
  }),
  background('spiritualist', {
    name: 'Spiritualist',
    description: 'You held séances in darkened parlours. Some of what you saw was not a trick.',
    attributes: ['charisma', 'sanity', 'wisdom'],
    feat: 'mesmerist',
    skillProficiencies: ['occult', 'performance'],
    toolProficiency: 'disguise-kit',
    kit: ['disguise-kit', 'travelling-clothes', 'oil-lantern', 'playing-cards'],
  }),
  background('asylum-survivor', {
    name: 'Asylum Survivor',
    description: 'You were committed to an asylum and came out with your wits, and secrets.',
    attributes: ['wisdom', 'sanity', 'fortune'],
    feat: 'iron-nerves',
    skillProficiencies: ['occult', 'medicine'],
    toolProficiency: 'chess-set',
    kit: ['chess-set', 'work-clothes', 'notebook-and-pencil', 'smelling-salts'],
  }),
];

export function findBackground(id: string): BackgroundDefinition | undefined {
  return BACKGROUNDS.find((entry) => entry.id === id);
}
