/*
 * Notes a demo visit (the name typed into the welcome popup) in Firestore's
 * demoVisits collection, for the main admin's list on /admin.
 *
 * The demo build leaves the Firebase SDK out on purpose, so this is one plain
 * request to Firestore's REST API. The rules accept it without signing in, but
 * only a short name and the server's time.
 */

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

/** Same port as firebase.json, for `VITE_USE_EMULATORS=true`. */
const HOST =
  import.meta.env.VITE_USE_EMULATORS === "true"
    ? "http://127.0.0.1:8085"
    : "https://firestore.googleapis.com";

const ID_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** A random 20-character id, like Firestore's own. */
function createId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (byte) => ID_CHARACTERS[byte % ID_CHARACTERS.length]).join("");
}

/** Best effort: a failed note never gets in the visitor's way. */
export function logDemoVisit(name: string): void {
  if (!PROJECT_ID) return;

  const database = `projects/${PROJECT_ID}/databases/(default)`;
  const body = {
    writes: [
      {
        update: {
          name: `${database}/documents/demoVisits/${createId()}`,
          fields: { name: { stringValue: name.trim().slice(0, 30) } },
        },
        currentDocument: { exists: false },
        updateTransforms: [{ fieldPath: "visitedAt", setToServerValue: "REQUEST_TIME" }],
      },
    ],
  };

  fetch(`${HOST}/v1/${database}/documents:commit${API_KEY ? `?key=${API_KEY}` : ""}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch((error) => console.error("Couldn't note the demo visit:", error));
}
