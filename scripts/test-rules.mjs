// Runs the security tests (tests/firestore.rules.test.ts) against the
// Firestore emulator:
//
//   npm run test:rules
//
// If `npm run emulators` is already running, the tests use it. Otherwise this
// starts an emulator just for the tests and stops it afterwards.
import { spawnSync } from "node:child_process";
import { createServer } from "node:net";

import { stopEmulators } from "./stop-emulators.mjs";

const PORT = 8085; // firebase.json → emulators.firestore.port
const TESTS = "node --test tests/firestore.rules.test.ts";

const portIsFree = () =>
  new Promise((resolve) => {
    const server = createServer()
      .once("error", () => resolve(false))
      .once("listening", () => server.close(() => resolve(true)))
      .listen(PORT, "127.0.0.1");
  });

const run = (command) => spawnSync(command, { stdio: "inherit", shell: true }).status ?? 1;

let status;

if (await portIsFree()) {
  status = run(
    `npx --yes firebase-tools@13 emulators:exec --only firestore --project demo-kadalacurry "${TESTS}"`
  );
  stopEmulators();
} else {
  console.log(`An emulator is already running on port ${PORT}; testing against it.`);
  status = run(TESTS);
}

process.exit(status);
