/**
 * Turns the paths an assistant writes into links a reader can follow.
 *
 * Both briefs tell the model to write a path plainly - `/showroom`,
 * `/public/passport?lot=AZ-2026-SMQ-0412` - because a model asked to produce
 * markup produces markup that has to be trusted, and nothing here is going to
 * render untrusted HTML into a page. A plain path is inert text.
 *
 * That leaves the reader retyping it, which is why this exists. The path is
 * matched, checked against the routes this application actually has, and only
 * then becomes a link. Anything else stays as the text it was: a model that
 * invents `/pricing` gets a reader who sees `/pricing` and no broken route,
 * and one that writes something stranger cannot navigate anybody anywhere.
 *
 * Whitelist rather than pattern: the set below is the app's own route table,
 * and a path is a link only if its first segment is in it.
 */

import { Link } from "react-router-dom";

/** First segments the router actually serves. Anything else is left as text. */
const ROUTES = new Set([
  // the public website
  "about",
  "services",
  "showroom",
  "technology",
  "partners",
  "news",
  "careers",
  "contact",
  "panels",
  // the panels, and the passport both surfaces link to
  "public",
  "farmer",
  "hub",
  "trials",
  "bank",
  "insurance",
  "export",
  "admin",
  "overview",
]);

/**
 * A leading slash, one or more segments, and optionally the query that keys a
 * passport - `?lot=` on the public one, `?l=` on a panel's.
 *
 * Deliberately narrow, and with no `.` in it: no route or lot code in this
 * application contains one, while a sentence ending in a path does. Allowing
 * it swallowed the full stop into the link, so "the passport is
 * /hub/lot?l=AZ-2026-SMQ-0412." pointed at a lot code with a dot on the end.
 *
 * Trailing punctuation is not part of a segment, so
 * "read /showroom." links `/showroom` and leaves the full stop alone, and a
 * lot code keeps its hyphens without swallowing the sentence after it.
 */
const PATH =
  /\/[a-z][a-z-]*(?:\/[A-Za-z0-9_-]+)*(?:\?(?:lot|l)=[A-Za-z0-9_-]+)?/g;

/**
 * A path whose query we could not parse is not one to link.
 *
 * `PATH` deliberately will not match `?lot=<code>`, so a placeholder ends the
 * match early and leaves `/public/passport` looking like a clean link with the
 * `<code>` stranded beside it as text. Linking that sends the reader to a
 * passport screen with no lot in it. If a `?` follows the match, the model
 * wrote a query this cannot read - leave the whole thing as text.
 */
const hasUnreadableQuery = (text: string, end: number) => text[end] === "?";

/**
 * Some routes mean nothing without the parameter that keys them.
 *
 * `/public/passport` renders an empty page without `?lot=`, and a panel's
 * `/…/lot` without `?l=` opens whichever lot the screen defaults to rather
 * than the one being discussed. Both briefs say to write the parameter; this
 * makes sure a slip cannot put a link to nowhere in front of a reader.
 */
/**
 * A code with no digit in it is a stand-in, not a lot code.
 *
 * Told not to write `<kod>`, the model found disguises without brackets -
 * `?l=CODE`, `?l=LOT-KODI`, `/lot/KOD`. Those match the path pattern
 * perfectly, so without this they become links a reader can click that lead
 * to a lot which does not exist. Every code this platform issues carries a
 * year and a serial; a bare word does not.
 */
const isStandIn = (path: string) => {
  const code = path.match(/\?(?:lot|l)=([^&]+)$/)?.[1];
  return code !== undefined && !/\d/.test(code);
};

const isIncomplete = (path: string) =>
  /^\/public\/passport\/?$/.test(path) ||
  /\/lot\/?$/.test(path) ||
  /\?(lot|l)=$/.test(path);

export const linkify = (text: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(PATH)) {
    const path = match[0];
    const at = match.index ?? 0;
    const segment = path.slice(1).split(/[/?]/)[0];

    if (!ROUTES.has(segment)) continue;
    if (hasUnreadableQuery(text, at + path.length)) continue;
    if (isIncomplete(path) || isStandIn(path)) continue;

    if (at > cursor) out.push(text.slice(cursor, at));
    out.push(
      <Link key={`${at}-${path}`} className="ai-path" to={path}>
        {path}
      </Link>,
    );
    cursor = at + path.length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
};

export default linkify;
