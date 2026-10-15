/**
 * Money in pence, in the British pounds-shillings-pence (£sd) system. Fractions of a penny are
 * halfpennies (0.5) and farthings (0.25).
 */
export type Money = number;

export const PENCE_PER_SHILLING = 12;
export const SHILLINGS_PER_POUND = 20;
export const PENCE_PER_POUND = PENCE_PER_SHILLING * SHILLINGS_PER_POUND;
/** A guinea is 21 shillings, used for professional fees and luxury goods. */
export const PENCE_PER_GUINEA = 21 * PENCE_PER_SHILLING;

/** Coins in circulation and their values in pence. */
export const COINS = {
  farthing: 0.25,
  halfpenny: 0.5,
  penny: 1,
  threepence: 3,
  sixpence: 6,
  shilling: 12,
  florin: 24,
  'half-crown': 30,
  crown: 60,
  'half-sovereign': 120,
  sovereign: 240,
} as const;

export type Coin = keyof typeof COINS;

/** Builds an amount from pounds, shillings and pence. */
export function lsd(pounds: number, shillings = 0, pence = 0): Money {
  return pounds * PENCE_PER_POUND + shillings * PENCE_PER_SHILLING + pence;
}

export function guineas(count: number): Money {
  return count * PENCE_PER_GUINEA;
}

export interface Lsd {
  pounds: number;
  shillings: number;
  /** May include a fraction: 0.25, 0.5 or 0.75. */
  pence: number;
}

/** Splits an amount into pounds, shillings and pence. */
export function toLsd(money: Money): Lsd {
  if (money < 0) {
    throw new RangeError(`Money can't be negative, got ${String(money)}`);
  }
  const pounds = Math.floor(money / PENCE_PER_POUND);
  const afterPounds = money - pounds * PENCE_PER_POUND;
  const shillings = Math.floor(afterPounds / PENCE_PER_SHILLING);
  return { pounds, shillings, pence: afterPounds - shillings * PENCE_PER_SHILLING };
}

const FRACTIONS: Readonly<Record<string, number>> = { '¼': 0.25, '½': 0.5, '¾': 0.75 };

function formatPence(pence: number): string {
  const whole = Math.floor(pence);
  const fraction = Object.entries(FRACTIONS).find(([, value]) => value === pence - whole)?.[0];
  if (fraction === undefined) {
    return `${String(whole)}d`;
  }
  return `${whole === 0 ? '' : String(whole)}${fraction}d`;
}

/** Formats an amount the period way: "£1 2s 6d", "2s 6d", "6½d", "£5". */
export function formatMoney(money: Money): string {
  const { pounds, shillings, pence } = toLsd(money);
  const parts = [
    pounds > 0 ? `£${String(pounds)}` : '',
    shillings > 0 ? `${String(shillings)}s` : '',
    pence > 0 ? formatPence(pence) : '',
  ].filter((part) => part !== '');
  return parts.length === 0 ? '0d' : parts.join(' ');
}

const AMOUNT = String.raw`(\d+)?([¼½¾])?`;
const MONEY_PATTERN = new RegExp(String.raw`^(?:£(\d+))?\s*(?:(\d+)s)?\s*(?:${AMOUNT}d)?$`);
const SLASH_PATTERN = /^(\d+)\/(\d+|-)$/;
const GUINEA_PATTERN = /^(\d+)\s*gns?$/;

/** Parses "£1 2s 6d", "2s 6d", "6½d", "2/6" (2s 6d), "5/-" (5s) or "3 gns" (guineas). */
export function parseMoney(text: string): Money {
  const trimmed = text.trim();
  const guinea = GUINEA_PATTERN.exec(trimmed);
  if (guinea) {
    return guineas(Number(guinea[1]));
  }
  const slash = SLASH_PATTERN.exec(trimmed);
  if (slash) {
    return lsd(0, Number(slash[1]), slash[2] === '-' ? 0 : Number(slash[2]));
  }
  const match = MONEY_PATTERN.exec(trimmed);
  if (trimmed === '' || !match) {
    throw new Error(`Invalid amount of money: "${text}"`);
  }
  const [, pounds, shillings, pence, fraction] = match;
  return lsd(
    Number(pounds ?? 0),
    Number(shillings ?? 0),
    Number(pence ?? 0) + (fraction === undefined ? 0 : (FRACTIONS[fraction] ?? 0)),
  );
}
