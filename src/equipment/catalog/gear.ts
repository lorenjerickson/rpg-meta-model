import { lsd } from '../../core/currency';
import type { GearDefinition } from '../items';

function gear(id: string, input: Omit<GearDefinition, 'id' | 'category'>): GearDefinition {
  return { id, category: 'adventuring-gear', ...input };
}

export const GEAR: readonly GearDefinition[] = [
  // Light and time
  gear('pocket-watch', {
    name: 'Pocket Watch',
    description: 'A silver hunter-case watch on a chain.',
    weightLb: 0.25,
    cost: lsd(2),
  }),
  gear('oil-lantern', {
    name: 'Oil Lantern',
    description:
      'Sheds Bright Light in a 30-foot radius and Dim Light for 30 feet beyond for 6 hours on a ' +
      'pint of lamp oil. It can be shuttered to Dim Light in a 5-foot radius.',
    weightLb: 2,
    cost: lsd(0, 3),
  }),
  gear('lamp-oil', {
    name: 'Lamp Oil (Pint)',
    description: 'Paraffin for lanterns. Thrown, it can be lit to burn for 2 rounds.',
    weightLb: 1,
    cost: lsd(0, 0, 3),
  }),
  gear('electric-torch', {
    name: 'Electric Torch',
    description:
      'A battery torch. It sheds Bright Light in a 20-foot cone and Dim Light for 20 feet beyond ' +
      'for 4 hours before its battery is spent.',
    weightLb: 1,
    cost: lsd(1),
    rarity: 'uncommon',
  }),
  gear('box-of-matches', {
    name: 'Box of Matches',
    description: 'Fifty safety matches. Lighting one takes a Bonus Action.',
    weightLb: 0,
    cost: lsd(0, 0, 1),
  }),

  // Exploration
  gear('hemp-rope', {
    name: 'Hemp Rope (50 Feet)',
    description: 'Can be burst with a DC 20 Might (Athletics) check.',
    weightLb: 10,
    cost: lsd(0, 4),
  }),
  gear('grappling-hook', {
    name: 'Grappling Hook',
    description: 'Thrown up to 50 feet to catch on a ledge or railing.',
    weightLb: 4,
    cost: lsd(0, 3),
  }),
  gear('crowbar', {
    name: 'Crowbar',
    description: 'Grants Advantage on Might checks where leverage can be applied.',
    weightLb: 5,
    cost: lsd(0, 3),
  }),
  gear('climbing-kit', {
    name: 'Climbing Kit',
    description: 'Pitons, boot spikes, harness and gloves. Grants Advantage on checks to climb.',
    weightLb: 12,
    cost: lsd(1),
  }),
  gear('field-glasses', {
    name: 'Field Glasses',
    description: 'Binoculars that make distant objects appear eight times closer.',
    weightLb: 2,
    cost: lsd(3),
  }),
  gear('pocket-compass', {
    name: 'Pocket Compass',
    description: 'Grants Advantage on Wisdom (Survival) checks to avoid becoming lost.',
    weightLb: 0.25,
    cost: lsd(1),
  }),
  gear('magnifying-glass', {
    name: 'Magnifying Glass',
    description: 'Grants Advantage on checks to examine small or detailed things.',
    weightLb: 0,
    cost: lsd(0, 10),
  }),
  gear('bradshaws-guide', {
    name: "Bradshaw's Railway Guide",
    description:
      'Timetables of every railway in the country. Grants Advantage on checks to plan a ' +
      'journey by rail.',
    weightLb: 1,
    cost: lsd(0, 0, 6),
  }),
  gear('notebook-and-pencil', {
    name: 'Notebook and Pencil',
    weightLb: 0.5,
    cost: lsd(0, 0, 6),
  }),
  gear('typewriter', {
    name: 'Typewriter',
    description: 'A portable writing machine with a carrying case.',
    weightLb: 30,
    cost: lsd(15),
    rarity: 'uncommon',
  }),
  gear('shaving-mirror', {
    name: 'Shaving Mirror',
    description: 'A small steel mirror, handy for looking around corners.',
    weightLb: 0.5,
    cost: lsd(0, 1),
  }),

  // Security and restraint
  gear('handcuffs', {
    name: 'Handcuffs',
    description:
      'Restrain a Small or Medium creature. Escaping takes a DC 20 Agility (Legerdemain) ' +
      'check; breaking them takes a DC 25 Might (Athletics) check.',
    weightLb: 2,
    cost: lsd(0, 10),
  }),
  gear('padlock', {
    name: 'Padlock',
    description: "Comes with a key. Picking it takes a DC 15 check with burglar's tools.",
    weightLb: 1,
    cost: lsd(0, 2, 6),
  }),
  gear('iron-chain', {
    name: 'Iron Chain (10 Feet)',
    description: 'Can be burst with a DC 20 Might (Athletics) check.',
    weightLb: 10,
    cost: lsd(0, 5),
  }),
  gear('police-whistle', {
    name: 'Police Whistle',
    description: 'A shrill whistle audible up to half a mile away.',
    weightLb: 0,
    cost: lsd(0, 1),
  }),

  // Health and survival
  gear('first-aid-kit', {
    name: 'First-Aid Kit',
    description:
      'Bandages, lint and iodine. It has ten uses; as a Utilize action, you can expend one to ' +
      'make a creature with 0 Hit Points Stable without a check.',
    weightLb: 3,
    cost: lsd(0, 10),
  }),
  gear('gas-mask', {
    name: 'Gas Mask',
    description:
      'A rubberised hood with eyepieces and a filter. Grants Advantage on saving throws against ' +
      'inhaled gases for 1 hour per filter.',
    weightLb: 3,
    cost: lsd(1),
    rarity: 'uncommon',
  }),
  gear('canteen', {
    name: 'Canteen',
    description: 'Holds 2 pints of water.',
    weightLb: 1,
    cost: lsd(0, 2),
  }),
  gear('hip-flask', {
    name: 'Hip Flask',
    description: 'Holds half a pint of something warming.',
    weightLb: 0.5,
    cost: lsd(0, 3),
  }),
  gear('bedroll', {
    name: 'Bedroll',
    weightLb: 7,
    cost: lsd(0, 5),
  }),
  gear('tent', {
    name: 'Tent',
    description: 'A canvas tent that sleeps two.',
    weightLb: 20,
    cost: lsd(1),
  }),

  // Luggage and clothing
  gear('steamer-trunk', {
    name: 'Steamer Trunk',
    description: 'Holds 12 cubic feet or 300 pounds of gear.',
    weightLb: 25,
    cost: lsd(2),
  }),
  gear('valise', {
    name: 'Valise',
    description: 'A carpet bag or leather travelling case holding 1 cubic foot of gear.',
    weightLb: 3,
    cost: lsd(0, 8),
  }),
  gear('umbrella', {
    name: 'Umbrella',
    description: 'Indispensable. In a pinch, it can be used as a walking cane.',
    weightLb: 2,
    cost: lsd(0, 7, 6),
  }),
  gear('work-clothes', {
    name: 'Work Clothes',
    description: 'Durable working dress: boots, trousers or skirts, shirt and cap.',
    weightLb: 4,
    cost: lsd(0, 10),
  }),
  gear('travelling-clothes', {
    name: 'Travelling Clothes',
    description: 'A respectable suit or dress, coat and hat.',
    weightLb: 4,
    cost: lsd(1, 10),
  }),
  gear('evening-dress', {
    name: 'Evening Dress',
    description: 'Formal dress for society: tailcoat or gown, gloves and the rest.',
    weightLb: 6,
    cost: lsd(8),
  }),
];
