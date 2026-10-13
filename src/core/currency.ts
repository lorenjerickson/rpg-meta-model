export const COINS = ['cp', 'sp', 'ep', 'gp', 'pp'] as const;

export type Coin = (typeof COINS)[number];

export const COIN_NAMES: Readonly<Record<Coin, string>> = {
  cp: 'Copper',
  sp: 'Silver',
  ep: 'Electrum',
  gp: 'Gold',
  pp: 'Platinum',
};

export const COIN_VALUE_IN_CP: Readonly<Record<Coin, number>> = {
  cp: 1,
  sp: 10,
  ep: 50,
  gp: 100,
  pp: 1000,
};

/** Fifty coins of any kind weigh 1 pound. */
export const COINS_PER_POUND = 50;

export type Currency = Record<Coin, number>;

export interface Price {
  amount: number;
  coin: Coin;
}

export function emptyPurse(): Currency {
  return { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
}

export function toCopper(currency: Partial<Currency>): number {
  return COINS.reduce((sum, coin) => sum + (currency[coin] ?? 0) * COIN_VALUE_IN_CP[coin], 0);
}

export function priceInCopper(price: Price): number {
  return price.amount * COIN_VALUE_IN_CP[price.coin];
}

/** Breaks a copper value into the fewest coins of the given denominations. */
export function fromCopper(
  copper: number,
  denominations: readonly Coin[] = ['gp', 'sp', 'cp'],
): Currency {
  const purse = emptyPurse();
  let remaining = copper;
  const ordered = [...denominations].sort((a, b) => COIN_VALUE_IN_CP[b] - COIN_VALUE_IN_CP[a]);
  for (const coin of ordered) {
    purse[coin] = Math.floor(remaining / COIN_VALUE_IN_CP[coin]);
    remaining -= purse[coin] * COIN_VALUE_IN_CP[coin];
  }
  if (remaining !== 0) {
    throw new RangeError(
      `${String(copper)} cp can't be made from ${denominations.join(', ')} alone`,
    );
  }
  return purse;
}

export function coinWeight(currency: Partial<Currency>): number {
  const count = COINS.reduce((sum, coin) => sum + (currency[coin] ?? 0), 0);
  return count / COINS_PER_POUND;
}
