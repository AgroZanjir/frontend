/**
 * The three languages stay in step.
 *
 * This product is used in Uzbek, Russian and English by people who cannot read
 * the other two, so a key that exists in one file and not the others is not a
 * cosmetic gap - it is a screen that shows a raw key like `qc_brix` to whoever
 * is unlucky. The panel screens also reference these keys by hand, so the
 * second test checks that every key a screen asks for actually exists.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { FIXTURES } from "@/lib/panel-fixtures";
import { capLabelKey, capShortKey } from "@/pages/panels/admin/helpers";
import { capabilityLabelKey } from "@/lib/panel-actions";
import en from "@/locales/en/translation.json";
import ru from "@/locales/ru/translation.json";
import uz from "@/locales/uz/translation.json";

const PANEL_SOURCES = join(process.cwd(), "src");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

describe("panel translations", () => {
  it("cover the same keys in uz, ru and en", () => {
    const uzKeys = Object.keys(uz.panel).sort();
    expect(Object.keys(ru.panel).sort()).toEqual(uzKeys);
    expect(Object.keys(en.panel).sort()).toEqual(uzKeys);
  });

  it("name every capability, role, org type and check", () => {
    // These are looked up from data rather than written out in a screen, so
    // the literal-key test above cannot see them. The permission matrix is
    // where this bites: ten column headers, all built from capability codes.
    const { CAPS, ORGTYPES, ROLES, VCHECKS } = FIXTURES;
    const keys = [
      ...CAPS.flatMap(([code, label]) => [
        label,
        capShortKey(code),
        capLabelKey({ CAPS, ORGTYPES, ROLES }, code),
      ]),
      ...ORGTYPES.map(([, label]) => label),
      ...ROLES.flatMap((g) => [g.g, ...g.items.map(([, label]) => label)]),
      ...ROLES.flatMap((g) => g.items.map(([, , , scope]) => `sc_${scope}`)),
      ...VCHECKS.map(([, label]) => label),
    ];

    expect([...new Set(keys)].filter((k) => !(k in uz.panel)).sort()).toEqual(
      [],
    );
  });

  it("name every capability the refusal toast can mention", () => {
    // `useAction` cannot read the catalogue - the public panel has no dataset -
    // so it carries its own map, and this is what stops that map drifting. It
    // had already sent `panel.c_administer` to a reader as an answer.
    FIXTURES.CAPS.forEach(([code, label]) => {
      expect(capabilityLabelKey(code)).toBe(label);
    });
  });

  it("include every key the screens ask for by name", () => {
    const files = walk(PANEL_SOURCES).filter(
      (f) =>
        (f.endsWith(".tsx") || f.endsWith(".ts")) &&
        !f.endsWith(".spec.ts") &&
        !f.endsWith(".spec.tsx"),
    );

    // Literal `t("key")` calls only. Keys built from data - `ev_${e.t}`,
    // `s_${status}` - are covered by the screen render tests instead.
    const used = new Set<string>();
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const [, key] of source.matchAll(/\bt\("([a-z0-9_]+)"\)/g)) {
        used.add(key);
      }
    }

    const missing = [...used].filter((k) => !(k in uz.panel) && !(k in uz));
    expect(missing.sort()).toEqual([]);
  });
});
