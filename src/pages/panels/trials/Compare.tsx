/**
 * Z2 - the controlled comparison.
 *
 * This screen is the business case, so it is also the screen most able to
 * mislead. Three rules hold it honest:
 *
 *   - Measured observations are solid; everything past the last one is dashed.
 *     The pilot has recorded two points of nine, and the chart says so.
 *   - The advantage figures are differences at day 28, labelled in percentage
 *     points, not percentages of each other.
 *   - The note under the charts states plainly that these are illustrative
 *     until the local pilot verifies them.
 *
 * A table view sits beside the charts because a lender's analyst will want the
 * numbers, not a picture of them.
 */

import { useState } from "react";

import { LineChart, TrialLegend } from "@/components/panel/charts";
import {
  Btn,
  Note,
  PageHead,
  PanelCard,
  Stat,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { downloadCsv } from "@/lib/panel-download";
import { usePanelData } from "@/lib/panel-data";
import { cn } from "@/lib/utils";

type Metric = "loss" | "waste" | "firm";

const METRICS: { k: Metric; label: string; unit: string; zero: boolean }[] = [
  { k: "loss", label: "t_loss", unit: "%", zero: true },
  { k: "waste", label: "t_waste", unit: "%", zero: true },
  { k: "firm", label: "t_firm", unit: "N", zero: false },
];

const TrialCompare = () => {
  const { TRIAL } = usePanelData();
  const { t, nf } = usePanelT();
  const [view, setView] = useState<"chart" | "table">("chart");

  const T = TRIAL;
  const i28 = T.days.indexOf(28);
  // Differences in percentage points, and firmness the other way round -
  // for firmness, more is better.
  const dLoss = (T.s.loss.c[i28] - T.s.loss.z[i28]).toFixed(1);
  const dWaste = (T.s.waste.c[i28] - T.s.waste.z[i28]).toFixed(1);
  const dFirm = (T.s.firm.z[i28] - T.s.firm.c[i28]).toFixed(1);

  return (
    <>
      <PageHead
        title={
          <>
            {t("t_title")} ·{" "}
            <span className="mono" style={{ fontSize: 15 }}>
              {T.code}
            </span>
          </>
        }
        sub={t("t_sub")}
        actions={
          <>
            <div className="seg">
              <button
                className={cn(view === "chart" && "on")}
                onClick={() => setView("chart")}
              >
                {t("t_chart")}
              </button>
              <button
                className={cn(view === "table" && "on")}
                onClick={() => setView("table")}
              >
                {t("t_table")}
              </button>
            </div>
            <Btn
            icon="down"
            onClick={() =>
              downloadCsv(
                `trial-${T.code}`,
                [
                  t("t_day"),
                  `${t("t_loss")} · ${t("t_armz")}`,
                  `${t("t_loss")} · ${t("t_armc")}`,
                  `${t("t_waste")} · ${t("t_armz")}`,
                  `${t("t_waste")} · ${t("t_armc")}`,
                  `${t("t_firm")} · ${t("t_armz")}`,
                  `${t("t_firm")} · ${t("t_armc")}`,
                ],
                T.days.map((d, i) => [
                  d,
                  T.s.loss.z[i],
                  T.s.loss.c[i],
                  T.s.waste.z[i],
                  T.s.waste.c[i],
                  T.s.firm.z[i],
                  T.s.firm.c[i],
                ]),
              )
            }
          >
            {t("export")}
          </Btn>
          </>
        }
      />

      <div className="grid g2" style={{ marginBottom: 14 }}>
        <PanelCard style={{ borderLeft: "3px solid var(--s-zeroco)" }}>
          <div className="t-label">{t("t_armz")}</div>
          <div className="lotid" style={{ fontSize: 13, marginTop: 3 }}>
            {T.z.lot}
          </div>
          <div className="t-xs muted-2" style={{ marginTop: 2 }}>
            {T.z.zone} · {nf(T.z.qty)} {t("kg")}
          </div>
        </PanelCard>
        <PanelCard style={{ borderLeft: "3px solid var(--s-control)" }}>
          <div className="t-label">{t("t_armc")}</div>
          <div className="lotid" style={{ fontSize: 13, marginTop: 3 }}>
            {T.c.lot}
          </div>
          <div className="t-xs muted-2" style={{ marginTop: 2 }}>
            {T.c.zone} · {nf(T.c.qty)} {t("kg")}
          </div>
        </PanelCard>
      </div>

      <div className="grid g3" style={{ marginBottom: 16 }}>
        <Stat
          k={`${t("t_loss")} · ${t("t_d28")}`}
          v={
            <>
              −{dLoss}
              <small> pp</small>
            </>
          }
          d={t("t_adv")}
          color="var(--s-zeroco)"
        />
        <Stat
          k={`${t("t_waste")} · ${t("t_d28")}`}
          v={
            <>
              −{dWaste}
              <small> pp</small>
            </>
          }
          d={t("t_adv")}
          color="var(--s-zeroco)"
        />
        <Stat
          k={`${t("t_firm")} · ${t("t_d28")}`}
          v={
            <>
              +{dFirm}
              <small> N</small>
            </>
          }
          d={t("t_adv")}
          color="var(--s-zeroco)"
        />
      </div>

      {view === "chart" ? (
        <div className="grid g3">
          {METRICS.map((m) => (
            <PanelCard key={m.k} bodyStyle={{ padding: "13px 14px 9px" }}>
              <div
                className="between"
                style={{ alignItems: "baseline", marginBottom: 2 }}
              >
                <span className="t-h3">{t(m.label)}</span>
                <span className="t-xs muted-2">
                  {m.unit} · {t("t_day")}
                </span>
              </div>
              <LineChart
                xs={T.days}
                sa={T.s[m.k].z}
                sb={T.s[m.k].c}
                zero={m.zero}
                observed={T.observed}
                unit={m.unit === "N" ? " N" : "%"}
                aria={t(m.label)}
              />
              <TrialLegend />
            </PanelCard>
          ))}
        </div>
      ) : (
        <Tbl
          min={820}
          head={[
            [t("t_metric")],
            [t("t_arm")],
            ...T.days.map(
              (d) => [`${d} ${t("t_day")}`, true] as [string, boolean],
            ),
          ]}
        >
          {METRICS.flatMap((m) =>
            (["z", "c"] as const).map((arm) => (
              <tr key={`${m.k}-${arm}`}>
                <td>{t(m.label)}</td>
                <td>
                  <Tag cls={arm === "z" ? "p-zeroco" : "p-control"}>
                    {arm === "z" ? t("t_armz") : t("t_armc")}
                  </Tag>
                </td>
                {T.s[m.k][arm].map((v, i) => (
                  <td key={i} className="r num">
                    {v.toFixed(1)}
                  </td>
                ))}
              </tr>
            )),
          )}
        </Tbl>
      )}

      <Note style={{ marginTop: 14 }}>
        <b>{t("t_measured")}</b> {t("t_solid")} · <b>{t("t_proj")}</b>{" "}
        {t("t_dash")}
        <br />
        {t("t_note")}
      </Note>
    </>
  );
};

export default TrialCompare;
