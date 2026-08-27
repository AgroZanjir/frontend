/**
 * F5 - the lot passport.
 *
 * The one screen the whole platform exists to produce: identity, where it is,
 * what it has been through, and what is claimed against it, on one page. It
 * opens from the producer, hub, bank and export panels, and looks the same in
 * all four - a banker and a farmer disagreeing about a lot should be reading
 * the same page.
 *
 * The history tab is the event log itself, not a summary of it. That log is
 * append-only and hash-chained, which is what makes the passport evidence
 * rather than a report.
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import {
  Btn,
  KV,
  Note,
  PanelCard,
  Pill,
  Qr,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT, daysLeft, storageAge } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";
import { panelByPath } from "@/lib/panels";

type Tab = "over" | "hist" | "qc" | "fin";

/**
 * The demo dataset carries one fully-documented lot. Every lot row opens it,
 * exactly as the prototype does, rather than showing a half-empty passport for
 * a lot whose events were never invented.
 */
const FLAGSHIP = "AZ-2026-SMQ-0412";

const LotPassport = () => {
  const { EVENTS, FARMS, PRODUCTS, QC, findLot, findZone } = usePanelData();
  const { t, nf, pn, money, ev } = usePanelT();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [tab, setTab] = useState<Tab>("over");

  const l = findLot(FLAGSHIP);
  const z = findZone(l.z);
  const panel = panelByPath(pathname);
  const backTo =
    panel?.id === "f" ? "/farmer/lots" : (panel?.path ?? "/farmer");

  const tabs: Tab[] = ["over", "hist", "qc", "fin"];

  return (
    <>
      <Btn
        cls="btn-q"
        sm
        icon="back"
        style={{ marginBottom: 10 }}
        onClick={() => navigate(backTo)}
      >
        {t("back")}
      </Btn>

      <PanelCard style={{ marginBottom: 14 }}>
        <div
          className="between"
          style={{ alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}
        >
          <div>
            <div className="t-label">{t("n_lot")}</div>
            <div
              className="mono"
              style={{ fontSize: 21, fontWeight: 600, marginTop: 3 }}
            >
              {l.c}
            </div>
            <div className="chipset" style={{ marginTop: 9 }}>
              <Pill s={l.st} />
              <Tag>{pn(l.p)}</Tag>
              <Tag>Grade {l.g}</Tag>
              <Tag cls="p-zeroco">ZEROCO</Tag>
              <Tag cls="p-warn">{t("pledged")}</Tag>
              <Tag cls="p-cool">TR-MELON-01</Tag>
            </div>
          </div>
          <Qr seed={l.c} px={104} />
        </div>
      </PanelCard>

      <div className="tabs">
        {tabs.map((k) => (
          <button
            key={k}
            className={tab === k ? "on" : ""}
            onClick={() => setTab(k)}
          >
            {t(`t_${k}`)}
          </button>
        ))}
      </div>

      {tab === "over" && (
        <>
          <div className="grid g2">
            <PanelCard head={t("t_over")}>
              <KV
                rows={[
                  [t("f_crop"), `${pn(l.p)} · ${PRODUCTS[l.p].v}`],
                  [t("g_farm"), FARMS[l.f].n],
                  [t("w_net"), `${nf(l.net)} ${t("kg")}`],
                  [t("qc_g"), l.g],
                  [t("pp_harv"), l.h],
                  [t("ci_val"), money(l.val)],
                ]}
              />
            </PanelCard>
            <PanelCard head={t("pp_store")}>
              <KV
                rows={[
                  [
                    t("pl_zone"),
                    <>
                      <span className="mono">{l.z}</span>{" "}
                      <Tag cls="p-zeroco">ZEROCO</Tag>
                    </>,
                  ],
                  [t("pl_pos"), <span className="mono">{l.pos}</span>],
                  [t("z_temp"), `${z.t} °C / ${z.rh}% RH`],
                  [t("pl_place"), l.pl],
                  [t("ci_hist"), `${storageAge(l)} ${t("days")}`],
                  [
                    t("xs_win"),
                    <>
                      {l.u} ·{" "}
                      <b style={{ color: "var(--good)" }}>
                        {daysLeft(l)} {t("days")}
                      </b>
                    </>,
                  ],
                ]}
              />
            </PanelCard>
          </div>

          <div className="sec">
            <PanelCard head={t("gr_split")}>
              <pre
                className="mono"
                style={{ margin: 0, lineHeight: 1.9, overflowX: "auto" }}
              >
                {"AZ-2026-SMQ-0410   9 200 kg\n├── "}
                <b style={{ color: "var(--primary)" }}>AZ-2026-SMQ-0412</b>
                {"   4 200 kg   Grade A → Z-ZEROCO-01\n"}
                {"├── AZ-2026-SMQ-0411   3 000 kg   Grade A → Z-COLD-01\n"}
                {"└── AZ-2026-SMQ-0413   2 000 kg   Grade B → Z-COLD-01"}
              </pre>
              <p className="t-xs muted-2" style={{ margin: "10px 0 0" }}>
                {t("gr_note")}
              </p>
            </PanelCard>
          </div>
        </>
      )}

      {tab === "hist" && (
        <PanelCard
          head={t("t_hist")}
          tools={
            <Btn sm icon="check">
              {t("ci_verify")}
            </Btn>
          }
        >
          <div className="tl">
            {EVENTS.map((e) => (
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
                  <div className="tl-d">{e.by}</div>
                  <div className="tl-m">{ev(e)}</div>
                </div>
              </div>
            ))}
          </div>
          <Note style={{ marginTop: 14 }}>
            {t("ci_intact")} · {EVENTS.length} {t("ci_events")}
          </Note>
        </PanelCard>
      )}

      {tab === "qc" && (
        <Tbl
          head={[
            [t("qc_stage")],
            [t("qc_date")],
            [t("qc_by")],
            [t("qc_brix"), true],
            [t("qc_firm"), true],
            [t("qc_def"), true],
            [t("qc_g")],
            [t("qc_verdict")],
          ]}
        >
          {QC.map((r) => (
            <tr key={r.s}>
              <td>{t(`q_${r.s}`)}</td>
              <td className="mono">{r.d}</td>
              <td>{r.by}</td>
              <td className="r">{r.brix}</td>
              <td className="r">{r.firm}</td>
              <td className="r">{r.def}</td>
              <td>{r.g}</td>
              <td>
                <Tag cls="p-good">{t("qc_pass")}</Tag>
              </td>
            </tr>
          ))}
        </Tbl>
      )}

      {tab === "fin" && (
        <>
          <div className="grid g2">
            <PanelCard head={t("fin_app")}>
              <KV
                rows={[
                  ["№", <span className="mono">FA-2026-0117</span>],
                  [t("b_amt"), money(168_000_000)],
                  [t("b_appl"), "Agrobank ATB"],
                  [t("b_st"), <Pill s="disbursed" />],
                  [t("d_lien"), <Pill s="active" cls="p-warn" />],
                ]}
              />
            </PanelCard>
            <PanelCard head={t("i_pol")}>
              <KV
                rows={[
                  ["№", <span className="mono">POL-ST-2026-044</span>],
                  [t("i_kind"), t("k_storage")],
                  [t("ci_ins"), money(200_000_000)],
                  [
                    t("ic_evidence"),
                    <>
                      1 · <span className="mono">EXC-2026-0311</span>
                    </>,
                  ],
                ]}
              />
            </PanelCard>
          </div>
          <Note style={{ marginTop: 12 }}>{t("d_blocked_d")}</Note>
        </>
      )}
    </>
  );
};

export default LotPassport;
