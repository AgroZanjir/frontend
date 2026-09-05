/**
 * The panel component set.
 *
 * These are the prototype's shared components - `stat`, `card`, `kvList`,
 * `tbl`, `phead`, `pill` - as React components over the same class names, so
 * a screen ported from the prototype reads almost line for line against it.
 *
 * They are deliberately not shadcn components. The panels are one designed
 * surface with its own tokens in `styles/panels.css`; wrapping half of it in a
 * second system would leave the product looking like two products.
 */

import type { ReactNode } from "react";

import PanelIcon from "@/components/panel/icons";
import { usePanelT } from "@/lib/panel-format";
import { cn } from "@/lib/utils";

/* ===== status pills ===== */

/** Status value to pill class. A status never borrows a chart series colour. */
export const PILL_CLASS: Record<string, string> = {
  stored: "p-cool",
  reserved: "p-warn",
  dispatched: "p-neut",
  settled: "p-good",
  written_off: "p-crit",
  registered: "p-neut",
  graded: "p-neut",
  queued: "p-neut",
  weighing: "p-info",
  running: "p-good",
  planned: "p-neut",
  completed: "p-cool",
  submitted: "p-neut",
  review: "p-warn",
  approved: "p-good",
  disbursed: "p-good",
  repaid: "p-cool",
  rejected: "p-crit",
  paid: "p-good",
  active: "p-warn",
  released: "p-neut",
  issued: "p-good",
  pending: "p-warn",
  signed: "p-cool",
  in_progress: "p-info",
  shipped: "p-good",
  loading: "p-info",
};

/** A translated status value: `s_stored`, `s_review`, and so on. */
export const Pill = ({ s, cls }: { s: string; cls?: string }) => {
  const { t } = usePanelT();
  return (
    <span className={cn("pill", cls ?? PILL_CLASS[s] ?? "p-neut")}>
      <span className="dot" />
      {t(`s_${s}`)}
    </span>
  );
};

/** A pill with literal text - a certificate name, a lot code, a variety. */
export const Tag = ({
  children,
  cls = "p-neut",
  style,
}: {
  children: ReactNode;
  cls?: string;
  style?: React.CSSProperties;
}) => (
  <span className={cn("pill", cls)} style={style}>
    {children}
  </span>
);

/* ===== stat tile ===== */

export const Stat = ({
  k,
  v,
  d,
  acc,
  color,
}: {
  k: string;
  v: ReactNode;
  d?: ReactNode;
  /** Accent rule down the left edge, for the tile that matters most. */
  acc?: boolean;
  color?: string;
}) => (
  <div className={cn("stat", acc && "acc")}>
    <span className="k">{k}</span>
    <span className="v" style={color ? { color } : undefined}>
      {v}
    </span>
    <span className="d">{d ?? ""}</span>
  </div>
);

/** The unit that trails a stat value at a smaller size. */
export const Unit = ({ children }: { children: ReactNode }) => (
  <small>{children}</small>
);

/* ===== card ===== */

export const PanelCard = ({
  head,
  tools,
  foot,
  cls,
  bodyCls,
  style,
  bodyStyle,
  children,
}: {
  head?: ReactNode;
  tools?: ReactNode;
  foot?: ReactNode;
  cls?: string;
  bodyCls?: string;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  children: ReactNode;
}) => (
  <div className={cn("card", cls)} style={style}>
    {head && (
      <div className="card-h">
        <span className="t-h2">{head}</span>
        {tools}
      </div>
    )}
    <div className={cn("card-b", bodyCls)} style={bodyStyle}>
      {children}
    </div>
    {foot && <div className="card-f">{foot}</div>}
  </div>
);

/* ===== key / value list ===== */

export type KVRow = [ReactNode, ReactNode];

export const KV = ({ rows }: { rows: KVRow[] }) => (
  <dl className="kv">
    {rows.map(([k, v], i) => (
      <div key={i} style={{ display: "contents" }}>
        <dt>{k}</dt>
        <dd>{v}</dd>
      </div>
    ))}
  </dl>
);

/* ===== table ===== */

/** `[heading]`, or `[heading, true]` for a right-aligned numeric column. */
export type Head = [ReactNode] | [ReactNode, boolean];

export const Tbl = ({
  head,
  min,
  children,
}: {
  head: Head[];
  /** Minimum width in px before the wrapper scrolls sideways. */
  min?: number;
  children: ReactNode;
}) => (
  <div className="tw">
    <table style={min ? { minWidth: `${min}px` } : undefined}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i} className={h[1] ? "r" : undefined}>
              {h[0]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

/* ===== page header ===== */

export const PageHead = ({
  title,
  sub,
  actions,
}: {
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="phead">
    <div className="phead-l">
      <h1 className="t-h1">{title}</h1>
      {sub && <p className="psub">{sub}</p>}
    </div>
    {actions && <div className="actions">{actions}</div>}
  </div>
);

/* ===== button ===== */

export const Btn = ({
  children,
  icon,
  cls,
  sm,
  disabled,
  onClick,
  style,
  type = "button",
}: {
  children?: ReactNode;
  icon?: string;
  cls?: string;
  sm?: boolean;
  disabled?: boolean;
  // The event is passed through because a button inside a clickable row
  // has to be able to stop the row's own handler.
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    className={cn("btn", cls, sm && "btn-sm")}
    disabled={disabled}
    onClick={onClick}
    style={style}
  >
    {icon && <PanelIcon name={icon} />}
    {children}
  </button>
);

/* ===== progress bar ===== */

export const Bar = ({ pct, cls }: { pct: number; cls?: string }) => (
  <div className="bar">
    <i className={cls} style={{ width: `${Math.min(100, pct)}%` }} />
  </div>
);

/* ===== alert ===== */

export const AlertBox = ({
  lvl,
  title,
  desc,
}: {
  lvl: "crit" | "warn" | "good" | "info";
  title: ReactNode;
  desc: ReactNode;
}) => (
  <div className={`alert a-${lvl}`}>
    <PanelIcon name="exc" />
    <div>
      <div className="at">{title}</div>
      <div className="ad">{desc}</div>
    </div>
  </div>
);

/** A quiet aside: why a screen behaves the way it does. */
export const Note = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) => (
  <p className="note" style={style}>
    {children}
  </p>
);

/* ===== form field ===== */

export const Field = ({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  /** What the server said about this value. Replaces the hint while it holds. */
  error?: ReactNode;
  children: ReactNode;
}) => (
  <div className="field">
    <label>
      {label} {required && <span className="reqd">*</span>}
    </label>
    {children}
    {(error || hint) && (
      <span className={error ? "hint hint-err" : "hint"}>{error ?? hint}</span>
    )}
  </div>
);

/* ===== QR stand-in ===== */

/**
 * A deterministic QR-shaped matrix. It is a visual stand-in, not a scannable
 * code: the real one is generated server-side from the lot's public URL, and
 * printing a decorative pattern that looks scannable but is not would be worse
 * than printing nothing.
 */
export const Qr = ({ seed, px = 110 }: { seed: string; px?: number }) => {
  const N = 25;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h ^= h << 13;
    h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5;
    h >>>= 0;
    return h / 4294967296;
  };
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x > N - 8 && y < 7) || (x < 7 && y > N - 8);

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (finder(x, y)) continue;
      if (rand() > 0.52) cells.push({ x, y });
    }

  const eye = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <path
        d={`M${x} ${y}h7v7h-7z`}
        fill="none"
        stroke="#111D19"
        strokeWidth="1"
      />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );

  return (
    <div className="qr" style={{ width: px, height: px }}>
      <svg
        viewBox={`0 0 ${N} ${N}`}
        shapeRendering="crispEdges"
        fill="#111D19"
        role="img"
        aria-label={seed}
      >
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="1" height="1" />
        ))}
        {eye(0, 0)}
        {eye(N - 7, 0)}
        {eye(0, N - 7)}
      </svg>
    </div>
  );
};
