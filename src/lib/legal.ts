import { Linking } from 'react-native';

// The legal pages live on the marketing site (hash routes, so no server rewrite
// needed). Override the base with EXPO_PUBLIC_LANDING_URL per environment.
const LANDING_BASE = process.env.EXPO_PUBLIC_LANDING_URL ?? 'https://pocketpair.be';

export const legalUrls = {
  privacy: `${LANDING_BASE}/#/privacy`,
  terms: `${LANDING_BASE}/#/terms`,
} as const;

export type LegalDoc = keyof typeof legalUrls;

/** Open a legal document in the system browser. */
export function openLegal(doc: LegalDoc): void {
  void Linking.openURL(legalUrls[doc]);
}
