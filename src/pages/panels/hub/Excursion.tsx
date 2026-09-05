/**
 * H9 - excursion and evidence bundle.
 *
 * An excursion is where three institutions meet: the hub caused it, the
 * insurer pays for it, and the bank holds collateral affected by it. So the
 * screen's main action is not "acknowledge" - it is exporting the bundle that
 * turns a sensor reading into something a claims adjuster can act on.
 */

import { useNavigate } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import { Spark } from "@/components/panel/charts";
import {
  AlertBox,
  Btn,
  KV,
  PageHead,
  PanelCard,
  Tbl,
} from "@/components/panel/primitives";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { downloadJson } from "@/lib/panel-download";
import { usePanelData } from "@/lib/panel-data";

const HubExcursion = () => {
  const { EXCURSION, findLot } = usePanelData();
  const { t, nf, pn, money, dur } = usePanelT();
  const navigate = useNavigate();
  const e = EXCURSION;

  // Acknowledging writes the resolution into the log of every lot the
  // excursion touched: the insurer's evidence bundle is assembled from those
  // events, so an acknowledgement that only changed a flag would leave the
  // bundle saying the breach was never closed.
  const resolve = useAction(
    () => api.post(`/storage/excursions/${e.c}/resolve/`),
    { success: "act_resolved", capability: "approve" },
  );

  const contents = ["e_c1", "e_c2", "e_c3", "e_c4", "e_c5"];

  return (
    <>
      <PageHead
        title={
          <>
            {t("e_title")} ·{" "}
            <span className="mono" style={{ fontSize: 15 }}>
              {e.c}
            </span>
          </>
        }
        sub={t("e_sub")}
        actions={
          <>
            {/* What an insurer is sent: the breach, its threshold, the trace
                that crossed it, and which lots were inside. A file, because
                the point of it is that it leaves the platform. */}
            <Btn cls="btn-p" icon="down" onClick={() =>
                downloadJson(`evidence-${e.c}`, {
                  excursion: e.c,
                  zone: e.zone,
                  sensor: e.sensor,
                  metric: e.metric,
                  threshold: e.thr,
                  peak: e.peak,
                  from: e.from,
                  to: e.to,
                  duration_minutes: e.durMin,
                  severity: e.sev,
                  resolved: e.resolved,
                  lots_affected: e.lots,
                  readings: e.trace,
                })
              }>
              {t("e_bundle")}
            </Btn>
            <Btn
              icon="check"
              disabled={resolve.disabled || e.resolved}
              onClick={() => void resolve.run()}
            >
              {e.resolved ? t("ev_resolved") : t("e_ack")}
            </Btn>
          </>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,320px)" }}
      >
        <div className="stack">
          <AlertBox
            lvl="crit"
            title={
              <>
                {t("e_critical")} · <span className="mono">{e.zone}</span>
              </>
            }
            desc={`${e.peak} °C · ${t("e_thr")} ${e.thr} °C · ${dur(e.durMin)}`}
          />

          <PanelCard>
            <Spark vals={e.trace} color="var(--crit)" thr={e.thr} />
            <div className="between t-xs muted-2" style={{ marginTop: 4 }}>
              <span className="mono">{e.from}</span>
              <span className="mono">{e.to}</span>
            </div>
            <div className="hr" />
            <div className="grid g3">
              <KV
                rows={[
                  [t("e_zone"), <span className="mono">{e.zone}</span>],
                  [t("e_metric"), t("z_temp")],
                ]}
              />
              <KV
                rows={[
                  [
                    t("e_peak"),
                    <b style={{ color: "var(--crit)" }}>{e.peak} °C</b>,
                  ],
                  [t("e_thr"), `${e.thr} °C`],
                ]}
              />
              <KV
                rows={[
                  [t("e_dur"), dur(e.durMin)],
                  [t("c_sensor"), <span className="mono">{e.sensor}</span>],
                ]}
              />
            </div>
          </PanelCard>

          <div>
            <div className="sec-h">
              <span className="t-h2">{t("e_affected")}</span>
            </div>
            <Tbl
              head={[
                [t("n_lots")],
                [t("f_crop")],
                [t("pl_zone")],
                [t("g_est"), true],
                [t("ci_val"), true],
              ]}
            >
              {e.lots.map((code) => {
                const l = findLot(code);
                return (
                  <tr
                    key={code}
                    className="click"
                    onClick={() => navigate(`/hub/lot?l=${l.c}`)}
                  >
                    <td>
                      <span className="lotid">{l.c}</span>
                    </td>
                    <td>{pn(l.p)}</td>
                    <td className="mono">{l.z}</td>
                    <td className="r">{nf(l.net)} kg</td>
                    <td className="r">{money(l.val)}</td>
                  </tr>
                );
              })}
            </Tbl>
          </div>
        </div>

        <div>
          <PanelCard head={t("e_contents")}>
            <div className="stack" style={{ gap: 9 }}>
              {contents.map((k) => (
                <div
                  key={k}
                  className="row"
                  style={{ gap: 8, alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      color: "var(--good)",
                      flex: "none",
                      marginTop: 1,
                    }}
                  >
                    <PanelIcon name="check" />
                  </span>
                  <span className="t-sm">{t(k)}</span>
                </div>
              ))}
            </div>
            <div className="hr" />
            <p className="t-xs muted-2" style={{ margin: 0 }}>
              {t("ic_note")}
            </p>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default HubExcursion;
