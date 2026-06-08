# pp-player-app

The **player-facing** app for [PocketPair](https://pocketpair.be), a poker
tournament platform for clubs and their players. Built with **Expo / React Native**
(SDK 56, React Native 0.85, React 19, Hermes, New Architecture), it talks to the
`pp-service` GraphQL backend over HTTP + WebSocket with JWT bearer auth.

It ships for **iOS, Android, and web** from a single codebase.

## Features

- **Tournaments** — browse, register, and follow a live tournament: clock, blinds,
  prize pool, and your seat, all updating in real time over GraphQL subscriptions.
- **My seats & leaderboard** — current seating, plus club leaderboards over
  configurable periods.
- **Profile & gamification** — achievements, attendance streaks, a season pass with
  weekly quests, and a "Year in Poker" wrapped recap.
- **Social** — friends, rivals, and shareable moments.
- **Cosmetics** — a store to preview and equip avatar frames and badges.
- **Pro tools** — predictions, opponent notes, scouting lookup, and analytics,
  gated behind feature flags and a Pro entitlement.
- **Privacy-first** — granular sharing/consent settings, defaulted off.
- **i18n** — English, French, and Dutch, with the chosen locale persisted.

## Tech stack

| Concern | Choice |
|---|---|
| Runtime | Expo SDK 56 · React Native 0.85 · React 19 · Hermes · New Architecture |
| Navigation | Expo Router (file-based, typed routes) |
| Data | Apollo Client v4 — `HttpLink` + `GraphQLWsLink` (graphql-ws), auth & error links |
| State | Zustand (+ AsyncStorage persist); JWT in `expo-secure-store` (native) / AsyncStorage (web) |
| Styling | NativeWind v4 — the `pp-*` gold-on-charcoal design tokens |
| Animation | Reanimated 4 + Moti |
| i18n | i18next · react-i18next · expo-localization |
| QR | `react-native-qrcode-svg` (generate) · `expo-camera` (scan) |
| Fonts | Inter · Space Grotesk · JetBrains Mono |

## Getting started

```bash
npm install
cp .env.example .env.local     # point the app at your pp-service instance
npm start                      # Expo dev server — press i / a / w
```

The backend must be running for queries, mutations, and subscriptions to resolve.
From the monorepo root: `docker compose up -d` (GraphQL on `:8080`).

> **Networking:** an iOS simulator reaches the host via `localhost`. A physical
> device needs your machine's LAN IP (e.g. `http://192.168.1.20:8080`). The web
> preview can't reach `pp-service` across origins (CORS) — use a device or
> simulator for full data testing.

### Configuration

Runtime config is provided through `EXPO_PUBLIC_*` env vars (inlined into the bundle
at build time). See `.env.example`:

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_GRAPHQL_ENDPOINT` | GraphQL HTTP endpoint |
| `EXPO_PUBLIC_GRAPHQL_WS_ENDPOINT` | GraphQL WebSocket endpoint |
| `EXPO_PUBLIC_AUTH_BASE_URL` | Auth/OAuth base URL |

## Project layout

```
src/
  app/          # Expo Router routes — (tabs) + login, register, tournament/[id],
                #   achievements, analytics, cosmetics, predictions, season, …
  components/   # domain components + ui/ primitives + motion/ primitives
  graphql/      # Apollo client, links, and operations/ (TypedDocumentNodes)
  hooks/        # useClubs, useLiveClock, useLiveRegistrations, useEquippedCosmetics, …
  stores/       # useAuthStore, useClubStore, useTournamentStore, useGamificationStore
  i18n/         # i18next init + persisted-locale hook + locales/
  theme/        # design tokens + cosmetic rendering
  utils/        # currency, datetime, qrCodeRouter
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run android` | Build & run a native dev build |
| `npm run web` | Web preview |
| `npm run lint` | Lint with `expo lint` |
| `npx tsc --noEmit` | Type-check |

GraphQL operations are hand-written `TypedDocumentNode`s under
`src/graphql/operations/`; `codegen.ts` can regenerate them from the `.gql` files
while the backend is running (`npx graphql-codegen`).

## Build & release (EAS)

Build profiles (`development`, `preview`, `production`) live in `eas.json`.

```bash
npm i -g eas-cli
eas login                                        # interactive, once
eas build:configure                              # links the EAS project

eas build --profile development --platform ios   # on-device dev client
eas build --profile preview     --platform all   # internal testing
eas build --profile production  --platform all   # store build
eas submit --profile production --platform ios   # / android
```

App identifiers: bundle id / package `com.pocketpair.app`, scheme `pocketpair`.
Signing credentials are managed by EAS on first build. Icon, adaptive icons, and the
`#18181a` splash are configured in `app.json` — replace the placeholder art under
`assets/images/` before a store release.

> EAS builds run on Expo's servers and require an authenticated Expo account, so
> they're triggered manually rather than from CI.
