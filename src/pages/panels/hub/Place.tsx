/**
 * H7 - put-away.
 *
 * Scan the lot, pick the position. The map is the point: a stock-keeper looks
 * for the free square next to the one they are holding, and a list of position
 * codes cannot show that.
 */

import {
  Btn,
  Field,
  KV,
  PageHead,
  PanelCard,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";

/** Positions already holding a lot, as indexes into the 4x8 grid. */
const TAKEN = [0, 1, 2, 5, 6, 9, 10, 11, 17, 18, 22, 25, 26];
/** The square this put-away is going to - B-06, where the flagship lot sits. */
const TARGET = 13;

const HubPlace = () => {
  const { t } = usePanelT();

  return (
    <>
      <PageHead title={t("pl_title")} sub={t("pl_sub")} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,340px) minmax(0,1fr)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 14 }}>
          <Field label={t("pl_lot")} hint={t("pl_scan")}>
            <div className="row" style={{ gap: 6 }}>
              <input
                className="inp mono"
                style={{ minWidth: 0 }}
                defaultValue="AZ-2026-SMQ-0412"
              />
              <Btn icon="lookup" />
            </div>
          </Field>
          <Field label={t("pl_zone")}>
            <select className="inp">
              <option>Z-ZEROCO-01 — {t("m_zeroco")}</option>
              <option>Z-COLD-01 — {t("m_cold")}</option>
            </select>
          </Field>
          <Field label={t("pl_pos")}>
            <input className="inp mono" defaultValue="B-06" />
          </Field>
          <div className="hr" />
          <KV
            rows={[
              [t("w_net"), "4 200 kg"],
              [t("qc_g"), "A"],
              [t("z_temp"), "0.4 °C"],
            ]}
          />
          <Btn cls="btn-p" icon="box">
            {t("pl_place")}
          </Btn>
        </PanelCard>

        <PanelCard>
          <div className="t-label" style={{ marginBottom: 10 }}>
            Z-ZEROCO-01 · {t("pl_pos")}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8,1fr)",
              gap: 5,
            }}
          >
            {Array.from({ length: 32 }, (_, i) => {
              const id = `${"ABCD"[Math.floor(i / 8)]}-${String((i % 8) + 1).padStart(2, "0")}`;
              const taken = TAKEN.includes(i);
              const here = i === TARGET;
              return (
                <div
                  key={id}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "var(--r-xs)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 9,
                    fontFamily: "var(--fm)",
                    background: here
                      ? "var(--primary)"
                      : taken
                        ? "var(--surface-3)"
                        : "var(--surface-2)",
                    color: here ? "#fff" : "var(--ink-3)",
                    border: `1px solid ${here ? "var(--primary)" : "var(--line)"}`,
                    fontWeight: here ? 700 : 400,
                  }}
                >
                  {id}
                </div>
              );
            })}
          </div>
          <div className="row" style={{ marginTop: 12, gap: 14 }}>
            <span className="row t-xs muted" style={{ gap: 5 }}>
              <i
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: "var(--primary)",
                  display: "block",
                }}
              />
              {t("pl_place")}
            </span>
            <span className="row t-xs muted" style={{ gap: 5 }}>
              <i
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: "var(--surface-3)",
                  display: "block",
                }}
              />
              {t("z_full")}
            </span>
          </div>
        </PanelCard>
      </div>
    </>
  );
};

export default HubPlace;
