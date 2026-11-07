# Kadalacurry

Shared meal ordering and expense tracking for roommates. Mobile-first React + TypeScript + Vite app on Firebase Auth and Firestore.

Each house is a **room** with its own link (`/kadala-house`), roommates, meals, prices and payment history. The app's owner (the main admin) approves new rooms; each room has one room admin who lets people in and sets the room up.

## Getting started

```bash
cp .env.example .env.local   # fill in your Firebase web config
npm install
npm run dev                  # the app, against your real Firebase project
npm run dev:demo             # the demo, at http://localhost:5174/demo/ (can run alongside)
```

To try things without touching real data, run it against the local emulators instead (see [Local testing with the Firebase emulators](#local-testing-with-the-firebase-emulators)).

## How rooms work

| Page | Who | What |
| --- | --- | --- |
| `/` | Anyone | Back to rooms opened on this device, open a room by name, make a room, try the demo. |
| `/create` | Anyone with Google | Signing in asks the main admin for a room. Once approved, they name it (permanent) and pick meals and prices. They become its room admin. |
| `/admin` | Main admin only | Approve or decline room requests, open or delete any room, move the original house into a room. |
| `/<room-id>` | Members | The app. Anyone else who signs in here asks to join and waits for the room admin. |
| `/vendor.html?room=<room-id>` | Anyone with the link | The room's due and today's and tomorrow's meal counts, for the meal vendor. No names, no sign-in. |

- **The main admin** is hard-coded as `akashajayawork@gmail.com` in [src/config/mainAdmin.ts](src/config/mainAdmin.ts) and `isMainAdmin()` in [firestore.rules](firestore.rules) (change both together). They can also have rooms of their own: they create them at `/create` without needing approval.
- **Room names are unique and permanent.** The name becomes the room's id and link (`Kadala House` → `/kadala-house`), so two names that make the same link count as the same name. The create page checks while you type, and creating the room checks again inside a transaction; the rules refuse to create a room that already exists.
- **One admin per room.** The room admin taps their avatar to open room setup: join requests (approve with a name, or decline), roommates (remove anyone whose due is paid up), meals and prices, and the vendor's UPI. All of it can change any time except the room name. People can only be added by signing in to the room link and being approved.
- **Meals:** breakfast, lunch and dinner, each on or off with a fixed price per person. A meal keeps the price it was ordered at, so changing a price never rewrites past orders.

### Paying the vendor

Settling the total due offers **Google Pay** (opens it with the vendor's UPI ID and the amount filled in), **another UPI app**, or **Paid another way** (cash, bank transfer: settles straight away). The room admin sets the vendor's UPI ID (or phone number) in room setup.

A web page can't see whether a UPI payment went through, so when you come back from Google Pay the app asks *"Did the payment go through?"* and only settles once you tap *Yes*. If the due changed while you were paying, it says so instead of recording the wrong amount. Notes:

- UPI apps only open on a phone. On a computer the dialog shows the UPI ID to pay from your phone.
- With only a phone number (no UPI ID), the app can't fill in the payee: it shows the number to copy and pay by hand.
- Google Pay sometimes refuses app-to-app payments to personal (non-merchant) UPI IDs. If that happens, pay by scanning the vendor's QR and choose *Paid another way*.

## Moving from the single-house version (v1)

v1 kept one house in top-level collections (`users`, `roommates`, `dailyOrders`, …). v2 keeps every house in `rooms/{roomId}/…`. Nothing is deleted or rewritten by the update: the new rules keep v1 working exactly as before, and the move **copies** the house into a room.

1. **Publish the new rules** ([firestore.rules](firestore.rules)). The old app keeps working with them, so this can happen any time before the next step.
2. **Release v2:** merge `develop` into `main` (see [Branches and releases](#branches-and-releases)). From now on the site serves v2.
3. **Move the house:** open `/kadalacurry/admin`, sign in with the main admin account, and under **Original house** type the room's name (permanent!) and tap **Move into a new room**. It copies everyone with their dues, every order (at v1's prices: breakfast ₹50, lunch ₹60), the debts, the payment history and anyone still waiting for access, with you as the room admin.
4. **Check the room**, then from room setup (tap your avatar) copy the **room link** for your roommates and the **vendor link** for the vendor (the old `vendor.html` link stops showing numbers). Everyone signs in with the same Google account as before and is straight in.
5. **Clean up, once you're happy:** on `/admin`, **Delete the old copy**, then delete the v1 section at the end of `firestore.rules` (marked) and publish the rules again.

## Local testing with the Firebase emulators

The emulators run Firestore and Google sign-in on your computer, so you can test rooms, approvals and payments without touching real data. They need **Java 17+**; the scripts use firebase-tools 13 (via `npx`) because it still runs on Java 17.

```bash
npm run emulators       # terminal 1: Auth + Firestore emulators, UI at http://127.0.0.1:4000
npm run dev:emulator    # terminal 2: the app, talking to the emulators (.env.emulator)
```

Open the address `dev:emulator` prints. "Continue with Google" opens a fake sign-in window: **Add new account** and type any email. Use `akashajayawork@gmail.com` to be the main admin, other emails to be anyone else (use another browser or browser profile for each extra person). The Emulator UI shows the data and accounts. Everything is wiped when the emulators stop.

To try the v1 → room move locally, add a few `users/{uid}` documents in the Emulator UI (use the account ids from its Authentication tab) before opening `/admin`.

### Security tests

```bash
npm run test:rules
```

Runs [tests/firestore.rules.test.ts](tests/firestore.rules.test.ts) against the Firestore emulator: who can create rooms, approve people, read and write orders, debts and payments, see vendor boards, and so on. It starts an emulator just for the tests, or uses the one from `npm run emulators` if it's already running. Run it after every change to `firestore.rules`.

If an emulator ever refuses to start with "port taken", an old one is still running (firebase-tools on Windows sometimes leaves it behind): `npm run emulators:stop`.

## Demo

`/demo/` is the full app with a sample room, for showing people around without an account. It first asks the visitor's name, then signs them in as the room admin under that name, with five days of meals (breakfast, lunch and dinner), three past payments, current dues, roommates who owe them, one person waiting to join, and everything in room setup to try. Settling with Google Pay is simulated.

It's a separate build (`vite build --mode demo`) in which every Firebase service a room uses is swapped for the in-memory copy in `src/demo/services/`. It never talks to Firebase, and since nothing is stored anywhere, the data resets whenever the page is left or refreshed. The sample data is in [src/demo/seed.ts](src/demo/seed.ts), dated relative to today. [src/demo/contract.ts](src/demo/contract.ts) makes `tsc` fail if a demo service stops matching its real one.

## Buy me a coffee

The button appears when the kadalacurry logo is tapped, on the demo (banner and welcome popup) and on `/admin`. Put your link in `BUY_ME_A_COFFEE_URL` in [src/config/support.ts](src/config/support.ts). Until then it shows as a dashed placeholder in development and not at all in production.

## Branches and releases

- `main` is what's live: every push to it deploys.
- `develop` is the next version. Pushes to it only run a build check.
- To release: bump `version` in `package.json` on `develop`, merge `develop` into `main`, and tag the merge `vX.Y.Z`.

## Firestore security rules

The rules live in [firestore.rules](firestore.rules). Publish them whenever they change: Firebase Console → Firestore Database → Rules → paste → Publish (or `npx firebase-tools deploy --only firestore:rules`, which uses the project in [.firebaserc](.firebaserc)).

## Hosting on GitHub Pages

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds the app and publishes it on every push to `main`. One-time setup:

1. Push the project to a GitHub repository. On a free account Pages needs a **public** repo, which is fine: `.env.local` is never uploaded (it's in `.gitignore`) and the data is protected by the Firestore rules.
2. **Settings → Secrets and variables → Actions → New repository secret:** add the six `VITE_FIREBASE_*` values from `.env.local`, using the same names.
3. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
4. **Firebase console → Authentication → Settings → Authorized domains:** add `<your-username>.github.io`, or Google sign-in will be refused.

The site is then at `https://<your-username>.github.io/<repo>/`, rooms at `…/<repo>/<room-id>`, the demo at `…/<repo>/demo/`. GitHub Pages has no routing, so the build copies `index.html` to `404.html`: any path that isn't a file loads the app, which reads the path ([src/app/router.ts](src/app/router.ts)).

## Data model

| Collection | Purpose |
| --- | --- |
| `rooms/{roomId}` | A house: `name` (permanent), `adminUid`/`adminName` (its one admin), `meals` (breakfast/lunch/dinner: `enabled`, `price`), `vendorUpi`. The id is the URL-safe name. |
| `rooms/{roomId}/members/{uid}` | Being in the room. `name` (chosen by the room admin) and `outstandingBalance`, the unpaid meal bill (never below zero). |
| `rooms/{roomId}/orders/{YYYY-MM-DD}_{uid}` | One person's meals for one day, with `prices` (what each cost when ordered) and `amount`. |
| `rooms/{roomId}/debts/{uidA}_{uidB}` | What two roommates owe each other. Ids are sorted; `amount > 0` means `users[0]` owes `users[1]`. `names` keeps both names. |
| `rooms/{roomId}/settlements/{id}` | Append-only payment history: `bill` (someone paid the whole house bill; `paidVia` is `gpay`, `upi` or `other`) or `repayment`. |
| `rooms/{roomId}/joinRequests/{uid}` | Left by someone who signed in to the room and isn't in it. Only the room admin sees these. |
| `roomRequests/{uid}` | Someone asking the main admin for a room: `pending`, then `approved`. Used up when they create it. |
| `vendorBoards/{roomId}` | Public numbers for the room's vendor: meal counts per day and the total due. Kept up to date by the members' apps. |
| `users`, `roommates`, `dailyOrders`, `debts`, `settlements`, `accessRequests`, `vendorBoard` | v1 (single house). Read-only to the main admin for the move; delete once moved. |

**Settling the total due** runs as one transaction: every roommate's balance goes to zero and each share is added to that roommate's debt to the payer. Tapping a debt and settling it clears it and records a repayment.

## Project structure

```
src/
├── app/                 # Router (pages by path), room page, shell (header, tabs, swipe)
├── assets/easter-eggs/  # Drop street-art images/GIFs here
├── components/
│   ├── brand/           # Tappable logo, About popup, Buy me a coffee
│   ├── feedback/        # Toasts, confetti, success check
│   ├── layout/          # AppHeader, BottomNav
│   └── ui/              # Dialog, EasterEgg slot, Wordmark
├── config/              # Firebase setup, main admin, coffee link, easter-egg registry
├── constants/           # App-wide constants (meals, collection names, paths)
├── demo/                # Demo edition: sample room + in-memory stand-ins for services/
├── features/            # One folder per feature
│   ├── accounts/        # Total due, paying the vendor, debts, PDF history
│   ├── admin/           # Room setup: join requests, roommates, meals & prices, vendor UPI
│   ├── auth/            # Google sign-in session and sign-in screens
│   ├── calendar/        # Monthly calendar with a day-details popup
│   ├── console/         # /admin: room requests, rooms, moving the v1 house
│   ├── create-room/     # /create: ask for a room, name it, set it up
│   ├── landing/         # / : the home page
│   ├── meals/           # Home: greeting, due, daily meal ordering
│   ├── rooms/           # Opening a room: membership, join requests, room context
│   └── vendor/          # Public vendor page + the sync that feeds it
├── hooks/               # Shared hooks (useSwipe, useNow, useRoomIdAvailability)
├── services/            # All Firebase reads/writes (no Firebase calls in components)
├── styles/              # Design tokens, reset, shared primitives
├── types/               # Shared domain types
└── utils/               # Pure helpers (dates, currency, names, meal prices, room names, UPI links)
tests/                   # Firestore security tests (emulator)
scripts/                 # test:rules and emulators:stop helpers
```

Each feature contains `components/`, `hooks/`, `pages/`, its own CSS, and an `index.ts` that is its public API. Code outside a feature imports only from that `index.ts` (e.g. `@/features/auth`). `@/` is an alias for `src/`.

## Easter eggs

The UI is deliberately plain white; the street-art feel comes from small images and GIFs placed in reserved slots. Put files in `src/assets/easter-eggs/` and register them by slot name in [src/config/easterEggs.ts](src/config/easterEggs.ts). Empty slots show as faint dashed boxes in development and render nothing in production.
