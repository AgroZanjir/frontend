/**
 * B4 - collateral inspection.
 *
 * The screen the whole platform is arguing for. A lender lending against
 * produce needs four answers, and they are the four cards here: where it
 * physically is, what conditions it has been held at, whether the record has
 * been tampered with, and what could still go wrong. The event log is shown
 * directly rather than summarised, because a summary is exactly what a lender
 * cannot verify.
 *
 * The trace shows the 2.9 °C spike that the chain also records. Hiding it
 * would make the collateral look better and the system worth less.
 */

import PanelIcon from "@/components/panel/icons";
import { Spark } from "@/components/panel/charts";
import {
  Btn,
  KV,
  PageHead,
  PanelCard,
  Pill,
  Tag,
} from "@/components/panel/primitives";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import api from "@/lib/api";
import { usePanelT, daysLeft, storageAge } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

/** The pledged lot's own 24-hour trace, spike included. */
const TRACE = [0.4, 0.4, 0.5, 0.4, 2.9, 0.5, 0.4, 0.4, 0.3, 0.4, 0.4, 0.4];

const BankCollateral = () => {
  const { EVENTS, FARMS, findLot, findZone } = usePanelData();
  const { t, nf, pn, mln, ev } = usePanelT();
  const l = findLot("AZ-2026-SMQ-0412");
  const z = findZone(l.z);
  const [checkedAt, setCheckedAt] = useState("");

  /**
   * The one action on this screen, and it is a real one: the backend walks the
   * lot's log, recomputes every hash against the row before it, and answers.
   * A collateral inspector who cannot re-verify the chain themselves is being
   * asked to take the platform's word for it, which is the opposite of the
   * point.
   */
  const verify = useMutation({
    mutationFn: () =>
      api.get<{ chain_intact: boolean; events: number }>(
        `/lots/${l.c}/verify-chain/`,
      ),
    onSuccess: () => setCheckedAt(new Date().toLocaleTimeString()),
  });

  return (
    <>
      <PageHead
        title={t("ci_title")}
        sub={t("ci_sub")}
        actions={
          <Btn
            cls="btn-p"
            icon="check"
            disabled={verify.isPending}
            onClick={() => verify.mutate()}
          >
            {t("ci_verify")}
          </Btn>
        }
      />

      <PanelCard style={{ marginBottom: 14 }}>
        <div
          className="between"
          style={{ flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}
        >
          <div>
            <div className="mono" style={{ fontSize: 19, fontWeight: 600 }}>
              {l.c}
            </div>
            <div className="chipset" style={{ marginTop: 8 }}>
              <Pill s={l.st} />
              <Tag>{pn(l.p)}</Tag>
              <Tag>Grade {l.g}</Tag>
              <Tag cls="p-zeroco">ZEROCO</Tag>
              <Tag cls="p-warn">{t("pledged")}</Tag>
            </div>
          </div>
          <div className="row" style={{ gap: 22 }}>
            <div>
              <div className="t-label">{t("ci_val")}</div>
              <div className="t-h1 num">
                {mln(l.val)} <span className="t-sm muted">{t("uzs")}</span>
              </div>
            </div>
            <div>
              <div className="t-label">{t("ci_win")}</div>
              <div className="t-h1 num" style={{ color: "var(--good)" }}>
                {daysLeft(l)} <span className="t-sm muted">{t("days")}</span>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,300px)",
        }}
      >
        <PanelCard head={t("ci_where")}>
          <KV
            rows={[
              [t("pl_zone"), <span className="mono">{l.z}</span>],
              [t("pl_pos"), <span className="mono">{l.pos}</span>],
              [t("g_farm"), FARMS[l.f].n],
              [t("pp_region"), `${FARMS[l.f].d}, ${FARMS[l.f].r}`],
              [t("w_net"), `${nf(l.net)} kg`],
              [t("ci_hist"), `${storageAge(l)} ${t("days")}`],
            ]}
          />
        </PanelCard>

        <PanelCard head={t("ci_cond")}>
          <Spark vals={TRACE} color="var(--s-zeroco)" thr={2.5} />
          <div className="hr" />
          <KV
            rows={[
              [
                t("z_temp"),
                <>
                  {z.t} °C{" "}
                  <span className="t-xs muted-2">
                    ({t("z_target")} {z.tt})
                  </span>
                </>,
              ],
              [
                t("z_rh"),
                <>
                  {z.rh}%{" "}
                  <span className="t-xs muted-2">
                    ({t("z_target")} {z.rt})
                  </span>
                </>,
              ],
              [
                t("ci_ins"),
                <>
                  <Tag cls="p-good">{t("s_active")}</Tag>{" "}
                  <span className="mono t-xs">POL-ST-2026-044</span>
                </>,
              ],
            ]}
          />
        </PanelCard>

        <div className="stack">
          <PanelCard head={t("ci_integrity")}>
            <div className="row" style={{ gap: 9, alignItems: "flex-start" }}>
              <span
                className={`pill ${verify.data?.chain_intact === false ? "p-crit" : "p-good"}`}
                style={{ padding: 6 }}
              >
                <PanelIcon
                  name={verify.data?.chain_intact === false ? "alert" : "check"}
                />
              </span>
              <div>
                <div className="t-h3">
                  {verify.data?.chain_intact === false
                    ? t("ci_broken")
                    : t("ci_intact")}
                </div>
                <div className="t-xs muted-2" style={{ marginTop: 2 }}>
                  {verify.data?.events ?? EVENTS.length} {t("ci_events")} ·
                  hash-chained
                </div>
                {checkedAt && (
                  <div className="t-xs muted-2" style={{ marginTop: 2 }}>
                    {t("ci_checked")} {checkedAt}
                  </div>
                )}
                {verify.isError && (
                  <div className="t-xs" style={{ color: "var(--crit)" }}>
                    {t("err_generic")}
                  </div>
                )}
              </div>
            </div>
          </PanelCard>

          <PanelCard head={t("ci_risk")}>
            <div className="stack" style={{ gap: 8 }}>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ color: "var(--warn)" }}>
                  <PanelIcon name="exc" />
                </span>
                <span className="t-sm">{t("ci_r1")}</span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ color: "var(--good)" }}>
                  <PanelIcon name="check" />
                </span>
                <span className="t-sm">
                  {t("ci_r2")} {daysLeft(l)} {t("days")}
                </span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ color: "var(--good)" }}>
                  <PanelIcon name="check" />
                </span>
                <span className="t-sm">{t("ci_r3")}</span>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>

      <div className="sec">
        <PanelCard head={t("ci_hist")}>
          <div className="tl">
            {EVENTS.slice(0, 5).map((e) => (
              <div className="tl-row" key={e.at}>
                <div
                  className={`tl-dot ${e.acc ? "acc" : ""}${e.warn ? " wr" : ""}`}
                >
                  <PanelIcon name={e.ic} className="" />
                </div>
                <div>
                  <div className="tl-t">
                    {t(`ev_${e.t}`)}
                    <span className="tl-w">{e.at}</span>
                  </div>
                  <div className="tl-m">{ev(e)}</div>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </>
  );
};

export default BankCollateral;
