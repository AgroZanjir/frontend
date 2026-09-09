/**
 * Paths become links; everything else stays text.
 *
 * The whitelist is the point. A model that names a page this application does
 * not have must not produce a link into a 404, and nothing it writes should be
 * able to navigate a reader somewhere the router does not go.
 */

import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { describe, expect, it } from "vitest";

import { linkify } from "@/lib/linkify";

const render = (text: string) =>
  renderToString(<StaticRouter location="/">{linkify(text)}</StaticRouter>);

describe("linkify", () => {
  it("links a path the router actually serves", () => {
    expect(render("The catalogue is on /showroom.")).toContain(
      'href="/showroom"',
    );
  });

  it("keeps the punctuation after a path out of it", () => {
    // Including after a lot code: "…?l=AZ-2026-SMQ-0412." must not link a code
    // with a full stop on the end.
    expect(render("Open /hub/lot?l=AZ-2026-SMQ-0412.")).toContain(
      'href="/hub/lot?l=AZ-2026-SMQ-0412"',
    );

    const html = render("See /technology. Then /about, then /contact!");

    expect(html).toContain('href="/technology"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/contact"');
    expect(html).not.toContain('href="/technology."');
    expect(html).not.toContain('href="/about,"');
  });

  it("carries a lot code through to the passport", () => {
    const html = render(
      "History: /public/passport?lot=AZ-2026-SMQ-0412 for that one.",
    );

    expect(html).toContain('href="/public/passport?lot=AZ-2026-SMQ-0412"');
  });

  it("links a panel passport, which lives inside its panel", () => {
    // The route is `<panel>/lot?l=<code>`. There is no top-level `/lot`, and
    // the brief said there was until an answer in Uzbek made the broken path
    // visible.
    expect(render("Open /hub/lot?l=AZ-2026-SMQ-0412")).toContain(
      'href="/hub/lot?l=AZ-2026-SMQ-0412"',
    );
  });

  it("never links a top-level /lot, which is not a route", () => {
    expect(render("See /lot/AZ-2026-SMQ-0412 for the history.")).not.toContain(
      "href",
    );
  });

  it("never links a passport route with its parameter left empty", () => {
    expect(render("Open /hub/lot?l= to see it.")).not.toContain("href");
    expect(render("Open /hub/lot for the passport.")).not.toContain("href");
  });

  it("leaves a route this app does not have as plain text", () => {
    // A model inventing /pricing gets a reader who sees /pricing, not one who
    // lands on a 404.
    const html = render("Prices are on /pricing and /shop/cart.");

    expect(html).not.toContain("href");
    expect(html).toContain("/pricing");
  });

  it("never links a placeholder in any language", () => {
    // The rule is about the shape. A model answering in Uzbek wrote `<kod>`;
    // in Russian it would be `<код>`. None of them may become a link.
    for (const text of [
      "Read /public/passport?lot=<code> for the history.",
      "Pasport: /hub/lot?l=<kod> sahifasida.",
      "Смотрите /public/passport?lot=<код>.",
    ]) {
      expect(render(text)).not.toContain("href");
    }
  });

  it("never links a stand-in wearing no brackets", () => {
    // Told not to write `<kod>`, the model found `CODE`, `KOD` and `LOT-KODI`.
    // Those match the path pattern perfectly; what gives them away is that no
    // code this platform issues is free of digits.
    for (const text of [
      "Open /bank/lot?l=CODE for the history.",
      "Pasport: /farmer/lot?l=LOT-KODI",
      "Смотрите /hub/lot?l=KOD.",
    ]) {
      expect(render(text)).not.toContain("href");
    }
  });

  it("still links a real code, which carries digits", () => {
    expect(render("Open /hub/lot?l=AZ-2026-SMQ-0412.")).toContain(
      'href="/hub/lot?l=AZ-2026-SMQ-0412"',
    );
  });

  it("never links the placeholder the brief forbids", () => {
    // And does not link the bare `/public/passport` in front of it either -
    // that would send the reader to a passport screen with no lot in it, which
    // is a worse outcome than plain text.
    const html = render("Read /public/passport?lot=<code> for the history.");

    expect(html).not.toContain("href");
    expect(html).toContain("/public/passport");
  });

  it("never links a passport with no lot in it", () => {
    // That screen is keyed entirely on `?lot=`, so it renders an empty page.
    // The brief sends a reader with no code to /public instead; this is the
    // belt to that braces.
    expect(render("Enter it at /public/passport to check.")).not.toContain(
      "href",
    );
    expect(render("Open /public/passport/ for the history.")).not.toContain(
      "href",
    );
  });

  it("still links the lookup screen itself", () => {
    expect(render("Type the code at /public.")).toContain('href="/public"');
  });

  it("leaves prose with no path in it completely alone", () => {
    expect(render("Provenance is public; commerce is not.")).toBe(
      "Provenance is public; commerce is not.",
    );
  });
});
