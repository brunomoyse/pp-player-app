# pp-mobile-rn

The player-facing PocketPair app, rebuilt as a native **Expo / React Native** app
(SDK 56, RN 0.85, React 19, Hermes, New Architecture). It is a feature- and
visual-parity port of the Nuxt/Ionic `pp-mobile` web app, talking to the same
`pp-service` GraphQL backend (HTTP + WebSocket, JWT bearer auth).

## Stack

| Concern | Choice |
|---|---|
| Navigation | Expo Router (file-based, typed routes) |
| GraphQL | Apollo Client v4 — `HttpLink` + `GraphQLWsLink` (graphql-ws), auth + error links |
| State | Zustand (+ AsyncStorage persist); tokens in expo-secure-store (native) / AsyncStorage (web) |
| Styling | NativeWind v4 — the `pp-*` gold-on-charcoal token theme |
| Animation | Reanimated 4 + Moti |
| i18n | i18next + react-i18next + expo-localization (en / fr / nl, persisted) |
| Icons / fonts | @expo/vector-icons (Ionicons); Inter / Space Grotesk / JetBrains Mono |
| QR | react-native-qrcode-svg (generate) · expo-camera (scan) |

## Project layout

```
src/
  app/                    # Expo Router routes (tabs, login, register, tournament/[id], achievements)
  components/             # domain components + ui/ primitives + motion/ primitives
  graphql/                # Apollo client, links, and operations/ (TypedDocumentNodes)
  hooks/                  # useClubs, useLiveClock, useLiveRegistrations, useAchievementNotifications
  stores/                # useAuthStore, useClubStore, useTournamentStore, useGamificationStore
  i18n/                   # i18next init + useI18n (persisted locale) + locales/
  theme/                 # design tokens
  utils/                 # currency, datetime, qrCodeRouter
```

## Develop

```bash
npm install
cp .env.example .env.local          # point at your pp-service instance
npx expo start                      # dev client / simulator
npx expo start --web                # quick web preview (no native camera/secure-store)
npm run lint
npx tsc --noEmit                    # type-check
```

Run `pp-service` (root `docker compose up -d`) so GraphQL queries, mutations, and
WebSocket subscriptions resolve. The web preview cannot reach `pp-service` across
origins (CORS) — use a dev build on a device/simulator for full data testing.

## GraphQL codegen (optional)

Operations are hand-written `TypedDocumentNode`s under `src/graphql/operations/`.
`codegen.ts` can regenerate typed hooks from the `.gql` files once the backend is
running (`npx graphql-codegen`).

## Build & release (EAS)

Profiles live in `eas.json` (`development`, `preview`, `production`).

```bash
npm i -g eas-cli
eas login                                   # interactive — required once
eas build:configure                         # links the EAS project (writes projectId)

# Dev client (for on-device development with the WS/camera/secure-store):
eas build --profile development --platform ios      # or android

# Internal testing build:
eas build --profile preview --platform all

# Store build + submit:
eas build --profile production --platform all
eas submit --profile production --platform ios      # / android
```

**Credentials:** the first iOS build prompts to let EAS manage signing
(provisioning profile + distribution cert); Android generates a keystore. Both are
stored on EAS. App identifiers: `com.pocketpair.app` (iOS bundle id + Android
package), scheme `pocketpair`.

**App icon / splash:** configured in `app.json` (`icon`, adaptive icons, and the
`expo-splash-screen` plugin on `#18181a`). Replace the placeholder PNGs under
`assets/images/` with the branded artwork before a store release.

> EAS builds require an authenticated Expo account and run on EAS servers, so they
> are triggered manually (not from CI in this repo).
