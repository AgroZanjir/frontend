/**
 * The panel charts.
 *
 * Two marks only, and both are lines: the trial screens compare two arms over
 * the same days, and the condition screens trace one sensor. Anything else the
 * panels need is a number, a bar or a table - which is why there is no chart
 * library in here.
 *
 * The two-arm series colours (`--s-zeroco`, `--s-control`) are chart series,
 * never status colours, and the reverse also holds: a green line would read as
 * "good" rather than "ZEROCO".
 */

import { useState } from "react";

import { usePanelT } from "@/lib/panel-format";

/* ---------- axis ticks that land on round numbers ---------- */

export function niceScale(lo: number, hi: number, n = 4) {
  const raw = (hi - lo) / (n - 1) || 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const q = raw / mag;
  const step =
    (q <= 1 ? 1 : q <= 2 ? 2 : q <= 2.5 ? 2.5 : q <= 5 ? 5 : 10) * mag;
  const a = Math.floor(lo / step) * step;
  const b = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = a; v <= b + step * 1e-6; v += step) ticks.push(+v.toFixed(6));
  return { ticks, lo: a, hi: b };
}

interface LineChartProps {
  /** X labels - trial day numbers. */
  xs: number[];
  /** Primary series. Two arms means this is the ZEROCO one. */
  sa: number[];
  /** Optional comparison arm, drawn in the control colour. */
  sb?: number[];
  /** Force the axis to start at zero, for loss and waste. */
  zero?: boolean;
  /**
   * Index of the last observation actually recorded. Everything past it is
   * drawn dashed: it is a projection, and the pilot has not measured it yet.
   */
  observed?: number;
  /** Unit shown in the tooltip. */
  unit?: string;
  /** Label for the comparison arm in the tooltip. */
  compareLabel?: string;
  aria?: string;
}

export const LineChart = ({
  xs,
  sa,
  sb,
  zero,
  observed,
  unit = "%",
  compareLabel,
  aria,
}: LineChartProps) => {
  const { t } = usePanelT();
  const [hover, setHover] = useState<number | null>(null);

  const W = 340;
  const H = 142;
  const mL = 32;
  const mR = 10;
  const mT = 8;
  const mB = 20;

  const all = [...sa, ...(sb ?? [])];
  const scale = niceScale(zero ? 0 : Math.min(...all), Math.max(...all), 4);
  const lo = scale.lo;
  const hi = scale.hi;

  const X = (i: number) => mL + (i / (xs.length - 1)) * (W - mL - mR);
  const Y = (v: number) => mT + (1 - (v - lo) / (hi - lo)) * (H - mT - mB);
  const seg = (a: number[], from: number, to: number) =>
    a
      .slice(from, to + 1)
      .map(
        (v, j) =>
          `${j ? "L" : "M"}${X(from + j).toFixed(1)} ${Y(v).toFixed(1)}`,
      )
      .join(" ");

  const ob = observed ?? xs.length - 1;
  const hotWidth = (W - mL - mR) / (xs.length - 1);

  const line = (a: number[], c: string, key: string) => (
    <g key={key}>
      <path
        d={seg(a, 0, ob)}
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {ob < xs.length - 1 && (
        <path
          d={seg(a, ob, xs.length - 1)}
          fill="none"
          stroke={c}
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity=".75"
          strokeLinecap="round"
        />
      )}
    </g>
  );

  const dots = (a: number[], c: string, key: string) => (
    <g key={key}>
      {a.map((v, i) =>
        i <= ob ? (
          <circle
            key={i}
            cx={X(i).toFixed(1)}
            cy={Y(v).toFixed(1)}
            r="3"
            fill={c}
            stroke="var(--surface)"
            strokeWidth="1.5"
          />
        ) : null,
      )}
    </g>
  );

  const tipLeft =
    hover === null ? 0 : Math.max(2, Math.min(W - 130, X(hover) - 64));

  return (
    <div className="chart-wrap" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria ?? ""}>
        {scale.ticks.map((v) => (
          <g key={v}>
            <line
              x1={mL}
              y1={Y(v).toFixed(1)}
              x2={W - mR}
              y2={Y(v).toFixed(1)}
              stroke="var(--line)"
              strokeWidth="1"
            />
            <text
              x={mL - 5}
              y={(Y(v) + 3.4).toFixed(1)}
              textAnchor="end"
              fontSize="9"
              fill="var(--ink-3)"
              fontFamily="var(--fm)"
            >
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </text>
          </g>
        ))}

        {hover !== null && (
          <line
            x1={X(hover)}
            y1={mT}
            x2={X(hover)}
            y2={H - mB}
            stroke="var(--line-2)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {sb && line(sb, "var(--s-control)", "lc")}
        {line(sa, sb ? "var(--s-zeroco)" : "var(--primary)", "la")}
        {sb && dots(sb, "var(--s-control)", "dc")}
        {dots(sa, sb ? "var(--s-zeroco)" : "var(--primary)", "da")}

        {xs.map((d, i) =>
          i % 2 === 0 ? (
            <text
              key={i}
              x={X(i).toFixed(1)}
              y={H - 5}
              textAnchor="middle"
              fontSize="9"
              fill="var(--ink-3)"
              fontFamily="var(--fm)"
            >
              {d}
            </text>
          ) : null,
        )}

        {xs.map((_, i) => (
          <rect
            key={i}
            x={(X(i) - hotWidth / 2).toFixed(1)}
            y={mT}
            width={hotWidth.toFixed(1)}
            height={H - mT - mB}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onTouchStart={() => setHover(i)}
          />
        ))}
      </svg>

      {hover !== null && (
        <div
          className="tip on"
          style={{ left: `${(tipLeft / W) * 100}%`, top: 2 }}
        >
          <div className="tt">
            {xs[hover]} {t("t_day")}
          </div>
          <div className="tr">
            <span>
              <i
                style={{
                  background: sb ? "var(--s-zeroco)" : "var(--primary)",
                }}
              />
              {sb ? t("t_armz") : ""}
            </span>
            <b>
              {sa[hover].toFixed(1)}
              {unit}
            </b>
          </div>
          {sb && (
            <div className="tr">
              <span>
                <i style={{ background: "var(--s-control)" }} />
                {compareLabel ?? t("t_armc")}
              </span>
              <b>
                {sb[hover].toFixed(1)}
                {unit}
              </b>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** The two-arm legend that sits under a comparison chart. */
export const TrialLegend = () => {
  const { t } = usePanelT();
  return (
    <div className="legend">
      <span>
        <i style={{ background: "var(--s-zeroco)" }} />
        {t("t_armz")}
      </span>
      <span>
        <i style={{ background: "var(--s-control)" }} />
        {t("t_armc")}
      </span>
    </div>
  );
};

/**
 * A sensor trace. `thr` draws the threshold the reading must stay under, so an
 * excursion is visible as the line crossing it rather than as a number the
 * reader has to compare in their head.
 */
export const Spark = ({
  vals,
  color,
  thr,
}: {
  vals: number[];
  color: string;
  thr?: number;
}) => {
  const W = 300;
  const H = 48;
  const mT = 4;
  const mB = 4;
  const lo = Math.min(...vals, thr ?? Infinity) - 0.5;
  const hi = Math.max(...vals, thr ?? -Infinity) + 0.5;
  const X = (i: number) => (i / (vals.length - 1)) * W;
  const Y = (v: number) => mT + (1 - (v - lo) / (hi - lo)) * (H - mT - mB);
  const d = vals
    .map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: 48 }}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {thr != null && (
        <line
          x1="0"
          y1={Y(thr).toFixed(1)}
          x2={W}
          y2={Y(thr).toFixed(1)}
          stroke="var(--crit)"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity=".8"
        />
      )}
      <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={color} opacity=".10" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};
