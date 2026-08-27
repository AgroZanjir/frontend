/**
 * H10 - dispatch blocked by a lien.
 *
 * The clearest statement of rule 3 in the whole product: the lot is stored,
 * reserved and shippable, and it still cannot leave. Encumbrance is an overlay
 * on a lot, never a status value - which is why this screen blocks the action
 * and offers the release request beside it, rather than showing the lot as
 * some fourth kind of thing.
 */

import {
  Btn,
  KV,
  Note,
  PageHead,
  PanelCard,
  Pill,
  Tag,
} from "@/components/panel/primitives";
import PanelIcon from "@/components/panel/icons";
import { useState } from "react";

import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import type { ProductCode } from "@/lib/panel-types";
import { usePanelData } from "@/lib/panel-data";

/** Lots on the same dispatch plan that carry no encumbrance. */
const READY: [string, ProductCode, number][] = [
  ["AZ-2026-SMQ-0377", "cherry", 2380],
  ["AZ-2026-SMQ-0396", "apricot", 6250],
];

const HubDispatch = () => {
  const { LOTS, LIENS, findLot } = usePanelData();
  const { t, nf, pn, money } = usePanelT();

  // The screen is about the lot that cannot leave. Show a pledged one if there
  // is one - that is the case worth demonstrating - and otherwise the first
  // lot on a shelf.
  const pledged = LOTS.find((lot) => lot.pledge && lot.st === "stored");
  const [code, setCode] = useState(
    (pledged ?? LOTS.find((lot) => lot.st === "stored") ?? LOTS[0])?.c ?? "",
  );
  const l = findLot(code);
  const lien = LIENS.find((x) => x.lot === code && x.st === "active");

  // Dispatch asks the spine, which asks every cluster that registered a guard.
  // A pledged lot comes back 409 with the lender named, and the toast prints
  // exactly that - this screen does not decide, it reports.
  const dispatch = useAction(() => api.post(`/lots/${code}/dispatch/`), {
    success: "act_dispatched",
    capability: "approve",
  });

  return (
    <>
      <PageHead title={t("d_title")} sub={t("d_sub")} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,330px)" }}
      >
        <div className="stack">
          <PanelCard cls="blocked">
            <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
              <span className="pill p-crit" style={{ padding: 8 }}>
                <PanelIcon name="lock" />
              </span>
              <div>
                <div className="t-h2" style={{ color: "var(--crit)" }}>
                  {t("d_blocked")}
                </div>
                <div
                  className="t-sm muted"
                  style={{ marginTop: 4, maxWidth: "60ch" }}
                >
                  {t("d_blocked_d")}
                </div>
              </div>
            </div>

            <div className="hr" />

            <div className="grid g2">
              <KV
                rows={[
                  [t("pl_lot"), <span className="lotid">{l.c}</span>],
                  [t("w_net"), `${nf(l.net)} kg`],
                  [t("pl_zone"), <span className="mono">{l.z}</span>],
                ]}
              />
              <KV
                rows={[
                  [
                    t("d_lien"),
                    lien ? (
                      <Pill s="active" cls="p-crit" />
                    ) : (
                      <Tag cls="p-line">{t("none")}</Tag>
                    ),
                  ],
                  [t("b_ref"), <span className="mono">{lien?.fa ?? "—"}</span>],
                  [t("b_amt"), lien ? money(lien.amt) : "—"],
                ]}
              />
            </div>

            <div className="row" style={{ marginTop: 14 }}>
              <select
                className="inp mono"
                style={{ maxWidth: 220 }}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                aria-label={t("pl_lot")}
              >
                {LOTS.map((lot) => (
                  <option key={lot.c} value={lot.c}>
                    {lot.c}
                  </option>
                ))}
              </select>
              {/* Enabled whether or not this screen thinks the lot is pledged.
                  The lien is the API's to enforce, and a button disabled by a
                  stale cache is a lie about why. */}
              <Btn
                cls="btn-p"
                icon="disp"
                disabled={dispatch.disabled || !l}
                onClick={() => void dispatch.run()}
              >
                {t("n_disp")}
              </Btn>
            </div>
          </PanelCard>

          <Note>{t("li_note")}</Note>
        </div>

        <div>
          <PanelCard head={t("sh_lots")}>
            <div className="stack">
              {READY.map(([c, p, q], i) => (
                <div key={c}>
                  {i > 0 && <div className="hr" style={{ margin: "9px 0" }} />}
                  <div className="between">
                    <div>
                      <div className="lotid">{c}</div>
                      <div className="t-xs muted-2">
                        {pn(p)} · {nf(q)} kg
                      </div>
                    </div>
                    <Tag cls="p-good">{t("cu_ready")}</Tag>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default HubDispatch;
