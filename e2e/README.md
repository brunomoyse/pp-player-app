# Player-app end-to-end flows (Maestro)

These flows exist because Google Play rejected version code 2 under the
**Broken Functionality** policy — "unresponsive UI elements, such as buttons or
icons". A reviewer opened a tournament, tapped **Register** three times, and got
three identical `Registration failed. Please try again.` toasts.

Two independent defects sat on that one path, and *both* presented as a button
that does nothing:

1. the app sent its own `userId`, which the server read as "a manager is
   registering somebody else" and denied for every player;
2. cancelling left the registration row behind, so signing up again tripped the
   `(tournament, player)` unique index.

Neither was caught, because the backend test deliberately exercised the one
payload the app never sends, and the only flow that would have caught it had
never been run. The suite below is built so that cannot repeat.

## Coverage

| Flow | What it protects |
|------|------------------|
| `reviewer-path.yaml` | The whole journey a store reviewer walks: cold start as a guest, browse, open a tournament, read its tabs, log in, **register**, check My Seats, leaderboard, profile, then cancel. Every screen must reach content, never an error or empty state. |
| `registration-flow.yaml` | The registration **lifecycle**: register → cancel → register **again** → cancel. The second registration is the guard for defect (2); a flow that registers once passes with that bug still in place. |
| `tournament-states.yaml` | Every tournament lifecycle state shows a CTA that matches it: open → live Register; not-yet-open → disabled "Registration not open yet"; in progress → clock, no CTA; finished → View Final Results. |
| `login-and-browse.yaml` | Guest browsing, login, and the authenticated tab set. |
| `profile-redesign.yaml` | Guest profile hero and the authenticated profile's grouped sections. |
| `native-checks.yaml` | Guest profile renders in the default locale and the language control responds. |

`helpers/` holds subflows shared via `runFlow`:

- `login.yaml` — signs in and waits for the authenticated tab set.
- `open-tournament.yaml` — opens a tournament **by category + name**.

## What Maestro cannot reach here (and what covers it instead)

Three iOS-driver limits shaped these flows. They are worked around, not ignored:

- **React Native `Modal` content is invisible.** While one is open,
  `maestro hierarchy` returns nothing but the status bar, so neither the locale
  sheet nor the club picker can be asserted. Locale coverage moved to
  `src/i18n/__tests__/locales.test.ts` (all three languages define the same keys,
  none blank); the flows assert the *control* is present and responds, and leave
  the club selection on its default.
- **Tab-bar taps report success without switching tabs.** `tapOn: { id: "tab-…" }`
  comes back COMPLETED with the screen unchanged (a `point:` tap at the same
  coordinates does work, so the tab bar itself is fine). Every flow navigates by
  deep link — `openLink: pocketpair://my-seats` — which is also resilient from a
  pushed detail screen.
- **Text inside a `Pressable` is collapsed.** iOS merges a card's children into
  one accessibility element, so a title inside a seat card is not matchable.
  Assert a dedicated testID on the card instead
  (`registration-status-REGISTERED`).

Two smaller ones: `hideKeyboard` is unsupported on recent simulators (tap the
headline to dismiss), and Maestro cannot type into a `secureTextEntry` field
(toggle the app's own **Show password** first).

## Two rules that keep these honest

**Never select a tournament by list index.** `tapOn: { id: "tournament-card",
index: 0 }` silently drifts onto whichever event sorts first, which changes with
`start_time` and fixture volume. The original flow tapped index 0 and landed on
a `not_started` tournament — so it could never have passed even after the server
was fixed. Use `helpers/open-tournament.yaml` and name the tournament.

**Assert the state *after* the action, not the tap.** `tapOn: register-cta`
succeeds whether or not registration worked — a tap always "works". What proves
the feature is the CTA flipping to `unregister-cta`, plus
`assertNotVisible: "Registration failed. Please try again."`.

## Running them

The flows need the deterministic local stack — `pocketpair.app` data drifts and
the seeded login account only exists locally:

```bash
# From the monorepo root: fresh Postgres + backend built from source + fixtures
REBUILD=1 NO_WEB=1 ./e2e-harness.sh up

# Fast reset between runs (no container recreate)
./e2e-harness.sh seed
```

Then build the app onto a simulator and run the suite:

```bash
cd pp-player-app
npx expo run:ios --device "iPhone 17"      # or: npx expo run:android

./e2e/run.sh                               # reseed, then whole suite
maestro test e2e/registration-flow.yaml    # one flow (assumes a clean seed)
```

`e2e/run.sh` reseeds first on purpose: a run interrupted mid-flow leaves a
registration behind, and the next run then fails on a CTA that is already
`unregister-cta`.

The flows default to the harness account (`native-e2e@pocketpair.test` /
`Passw0rd!`) and to the fixture tournaments in
`pp-service/fixtures/05_tournaments.sql`, where the nearest upcoming event per
club is seeded `registration_open` and the rest stay `not_started`. Override per
run with `maestro test -e EMAIL=… -e OPEN_TOURNAMENT=…`.

`registration-flow.yaml` and `reviewer-path.yaml` clean up after themselves
(they cancel what they registered), so they are re-runnable without reseeding.

## Before submitting a build to a store

Run the whole suite green against the harness. If a flow needs an index-based
tap or a retry to pass, fix the app or the fixture — do not loosen the flow.
