/**
 * The event composer.
 *
 * This is where the prototype's one real i18n defect was fixed: it stored each
 * event's sentence as Uzbek prose, so a Russian-speaking broker read a lot's
 * history in Uzbek. The API stores the payload and the sentence is written
 * here, which only works if every event type this platform emits has a case -
 * and if the ones it does not still render something.
 */

import { describe, expect, it } from "vitest";

import { eventMessage } from "@/lib/panel-format";
import type { LotEvent } from "@/lib/panel-types";

/** Keys come back as themselves, so a missing key is visible in the output. */
const c = {
  t: (key: string) => key,
  nf: (n: number) => n.toLocaleString("en-US"),
  lang: "en" as const,
};

const event = (t: string, payload: Record<string, unknown>): LotEvent => ({
  t,
  at: "2026-08-14 07:42",
  by: "G. Rasulova",
  ic: "in",
  m: "",
  payload,
});

describe("event messages", () => {
  it("compose the gate reading from grams", () => {
    const message = eventMessage(
      event("registered", {
        gross_weight_g: 4_310_000,
        net_weight_g: 4_200_000,
        idempotency_key: "8f2c",
      }),
      c,
    );

    expect(message).toBe("w_gross 4,310 kg · w_net 4,200 kg · ev_idem 8f2c");
  });

  it("read measurements out of the QC payload", () => {
    expect(
      eventMessage(
        event("sampled", {
          measurements: { brix: 12.4, calibre_kg: 2.1 },
          defect_pct: 1.8,
        }),
        c,
      ),
    ).toBe("Brix 12.4 · ev_calibre 2.1 kg · qc_def 1.8%");
  });

  it("turn a lien's minor units back into sum", () => {
    expect(
      eventMessage(
        event("pledged", {
          application: "FA-2026-0117",
          amount_minor: 16_800_000_000,
          kind: "inventory",
        }),
        c,
      ),
    ).toBe("FA-2026-0117 · 168,000,000 uzs · k_inventory");
  });

  it("render an unknown event type rather than an empty line", () => {
    // An event this client has never heard of is still evidence. Hiding it
    // would be worse than showing it plainly.
    expect(
      eventMessage(event("recalled", { reason: "buyer request" }), c),
    ).toBe("reason: buyer request");
  });

  it("leave an authored message alone", () => {
    const authored = { ...event("graded", {}), m: "Grade A · 4 200 kg" };
    expect(eventMessage(authored, c)).toBe("Grade A · 4 200 kg");
  });
});
