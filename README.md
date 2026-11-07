# Kadalacurry

Shared meal ordering and expense tracking for roommates. Mobile-first React + TypeScript + Vite app on Firebase Auth and Firestore.

## Getting started

```bash
cp .env.example .env.local   # fill in your Firebase web config
npm install
npm run dev                  # the app
npm run dev:demo             # the demo, at http://localhost:5174/demo/ (can run alongside)
```

## Demo

`/demo/` is the full app with a sample household, for showing people around without an account. The visitor is the admin, with five days of meals, three past payments, current dues, roommates who owe them and one access request waiting for approval.

It's a separate build (`vite build --mode demo`) in which every Firebase service in `src/services/` is swapped for the in-memory copy in `src/demo/services/`. It never talks to Firebase, and since nothing is stored anywhere, the data resets whenever the page is left or refreshed. The sample data is in [src/demo/seed.ts](src/demo/seed.ts), dated relative to today. [src/demo/contract.ts](src/demo/contract.ts) makes `tsc` fail if a demo service stops matching its real one.

## Branches and releases

- `main` is what's live: every push to it deploys.
- `develop` is the next version. Pushes to it only run a build check.
- To release: bump `version` in `package.json` on `develop`, merge `develop` into `main`, and tag the merge `vX.Y.Z`.

## Firestore security rules

The rules live in [firestore.rules](firestore.rules). Publish them before using the Accounts features: Firebase Console → Firestore Database → Rules → paste → Publish (or `firebase deploy --only firestore:rules` with the Firebase CLI).

## Hosting on GitHub Pages

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds the app and publishes it on every push to `main`. One-time setup:

1. Push the project to a GitHub repository. On a free account Pages needs a **public** repo, which is fine: `.env.local` is never uploaded (it's in `.gitignore`) and the data is protected by the Firestore rules.
2. **Settings → Secrets and variables → Actions → New repository secret:** add the six `VITE_FIREBASE_*` values from `.env.local`, using the same names.
3. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
4. **Firebase console → Authentication → Settings → Authorized domains:** add `<your-username>.github.io`, or Google sign-in will be refused.

The app is then at `https://<your-username>.github.io/<repo>/`, the vendor page at `…/<repo>/vendor.html` and the demo at `…/<repo>/demo/`.

## Data model

| Collection | Purpose |
| --- | --- |
| `users/{uid}` | Created by the admin to approve an account. `outstandingBalance` is the source of truth for a roommate's unpaid meal bill; `role: "admin"` marks the admin. |
| `roommates/{uid}` | Shared profile: display `name` plus a mirror of the balance. |
| `dailyOrders/{YYYY-MM-DD}_{uid}` | One roommate's meals for one day. |
| `debts/{uidA}_{uidB}` | What two roommates owe each other. Ids are sorted; `amount > 0` means `users[0]` owes `users[1]`. |
| `settlements/{id}` | Append-only payment history: `bill` (someone paid the whole house bill) or `repayment` (one roommate paid another back). |
| `accessRequests/{uid}` | Left by someone who signed in with Google but isn't approved yet. Only the admin can see these. |
| `vendorBoard/current` | Public numbers for the meal vendor: meal counts per day and the house's total due. No names. Kept up to date by the roommates' apps. |

**Letting friends in:** when someone new signs in with Google they see "Access pending" and an access request is saved. The admin (the account whose `users` document has `role: "admin"`) sees a count on their avatar; tapping it shows the requests, where they pick a name and approve. The friend's app lets them in automatically.

**Vendor page:** `/vendor.html` is a public page (no sign-in) for the meal vendor showing the house's due and tomorrow's breakfast and lunch counts. It reads only `vendorBoard/current`. It's a separate entry point (`vendor.html` → `src/vendor.tsx`), so it doesn't load the app or the sign-in code.

**Settling the total due** runs as one transaction: every roommate's balance goes to zero and each share is added to that roommate's debt to the payer. Tapping a debt and settling it clears it and records a repayment.

## Project structure

```
src/
├── app/                 # App composition: providers, shell (header, tabs, swipe), navigation
├── assets/easter-eggs/  # Drop street-art images/GIFs here
├── components/
│   ├── feedback/        # Toasts, confetti, success check
│   ├── layout/          # AppHeader, BottomNav
│   └── ui/              # Dialog, EasterEgg slot, Wordmark
├── config/              # Firebase setup, easter-egg registry
├── constants/           # App-wide constants (meal prices, collection names)
├── demo/                # Demo edition: sample data + in-memory stand-ins for services/
├── features/            # One folder per feature
│   ├── admin/           # Access requests: approve or decline new roommates
│   ├── auth/            # Login, approval gate, AuthProvider, useAuth
│   ├── meals/           # Home: greeting, due, daily meal ordering
│   ├── calendar/        # Monthly calendar with a day-details popup
│   ├── accounts/        # Total due, debts, settlements, PDF history
│   └── vendor/          # Public vendor page + the sync that feeds it
├── hooks/               # Shared hooks (useSwipe, useNow)
├── services/            # All Firebase reads/writes (no Firebase calls in components)
├── styles/              # Design tokens, reset, shared primitives
├── types/               # Shared domain types
└── utils/               # Pure helpers (dates, currency, names, haptics)
```

Each feature contains `components/`, `hooks/`, `pages/`, its own CSS, and an `index.ts` that is its public API. Code outside a feature imports only from that `index.ts` (e.g. `@/features/auth`). `@/` is an alias for `src/`.

## Easter eggs

The UI is deliberately plain white; the street-art feel comes from small images and GIFs placed in reserved slots. Put files in `src/assets/easter-eggs/` and register them by slot name in [src/config/easterEggs.ts](src/config/easterEggs.ts). Empty slots show as faint dashed boxes in development and render nothing in production.
