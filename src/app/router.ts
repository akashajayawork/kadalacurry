import { RESERVED_ROOM_IDS } from "@/constants/routes";

/**
 * The site's pages. GitHub Pages has no server routing, so every unknown path
 * gets 404.html (a copy of index.html, see vite.config.ts) and this decides
 * what to show.
 */
export type Route =
  | { kind: "home" }
  | { kind: "admin" }
  | { kind: "create" }
  | { kind: "room"; roomId: string }
  | { kind: "not-found" };

const ROOM_ID = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export function parseRoute(pathname: string, base = import.meta.env.BASE_URL): Route {
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, "");
  let segment: string;

  try {
    segment = decodeURIComponent(path).replace(/\/+$/, "").toLowerCase();
  } catch {
    return { kind: "not-found" };
  }

  if (segment === "" || segment === "index.html") return { kind: "home" };
  if (segment === "admin") return { kind: "admin" };
  if (segment === "create") return { kind: "create" };
  if (ROOM_ID.test(segment) && !RESERVED_ROOM_IDS.includes(segment)) {
    return { kind: "room", roomId: segment };
  }
  return { kind: "not-found" };
}
