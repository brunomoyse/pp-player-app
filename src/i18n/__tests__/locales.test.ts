import { describe, expect, it } from '@jest/globals';

import en from '@/i18n/locales/en.json';
import fr from '@/i18n/locales/fr.json';
import nl from '@/i18n/locales/nl.json';

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : flatten(value, path);
  });
}

// The locale sheet is the one screen the native e2e suite cannot reach —
// `LanguageModal` renders in a React Native `Modal`, and Maestro's iOS driver
// sees nothing inside one (see e2e/native-checks.yaml). Switching to a locale
// with a missing key falls back to English mid-screen, or renders the raw key
// path where a translation is genuinely absent, which is exactly the kind of
// broken surface a store reviewer flags. This is the substitute coverage.
describe('locale files', () => {
  const keys = { en: flatten(en as Tree), fr: flatten(fr as Tree), nl: flatten(nl as Tree) };

  it('defines the same keys in every language', () => {
    for (const locale of ['fr', 'nl'] as const) {
      const missing = keys.en.filter((key) => !keys[locale].includes(key));
      const extra = keys[locale].filter((key) => !keys.en.includes(key));
      expect({ locale, missing, extra }).toEqual({ locale, missing: [], extra: [] });
    }
  });

  it('leaves no translation blank', () => {
    for (const [locale, tree] of Object.entries({ en, fr, nl })) {
      const blank = flatten(tree as Tree).filter((key) => {
        const value = key.split('.').reduce<unknown>((node, part) => (node as Tree)?.[part], tree);
        return typeof value === 'string' && value.trim() === '';
      });
      expect({ locale, blank }).toEqual({ locale, blank: [] });
    }
  });

  // The registration copy added for the Broken Functionality fix has to exist
  // in all three languages: a reviewer on a French or Dutch device must see the
  // "registration isn't open yet" state, not an untranslated key.
  it('translates the registration-gating copy everywhere', () => {
    const required = [
      'events.registrationNotOpenYet',
      'events.toast.registrationNotOpen',
      'events.toast.tournamentUnavailable',
      'events.toast.sessionExpired',
    ];
    for (const locale of ['en', 'fr', 'nl'] as const) {
      for (const key of required) {
        expect(keys[locale]).toContain(key);
      }
    }
  });
});
