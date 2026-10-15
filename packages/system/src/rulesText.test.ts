import { describe, expect, it } from 'vitest';
import {
  ACTION_DEFINITIONS,
  BACKGROUNDS,
  CONDITION_DEFINITIONS,
  FEATS,
  HUMAN_TRAITS,
  ITEMS,
  MONSTERS,
  PROFESSIONS,
} from './index';

describe('rules text', () => {
  it('refers to rounds, not turns', () => {
    const catalogs = {
      ACTION_DEFINITIONS,
      BACKGROUNDS,
      CONDITION_DEFINITIONS,
      FEATS,
      HUMAN_TRAITS,
      ITEMS,
      MONSTERS,
      PROFESSIONS,
    };
    for (const [name, catalog] of Object.entries(catalogs)) {
      const text = JSON.stringify(catalog);
      expect(text, name).not.toMatch(
        /\b(?:your|its|their|next|each|per|this|the|later|single|one|last)\s+turns?\b|'s\s+turns?\b/i,
      );
    }
  });
});
