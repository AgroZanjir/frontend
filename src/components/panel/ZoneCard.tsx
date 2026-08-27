/**
 * A storage zone: how full it is and whether it is holding its band.
 *
 * A zone off its target temperature is the single most expensive thing on the
 * hub floor, so deviation is stated three ways - a red pill, a red reading and
 * a red left edge - rather than left for the reader to compute from the target
 * beside it.
 */

import { Bar, Tag } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import type { Zone } from "@/lib/panel-types";
import { usePanelData } from "@/lib/panel-data";
import { cn } from "@/lib/utils";

/** More than 1.5 °C off target is a deviation, not drift. */
export const isDeviating = (z: Zone) => Math.abs(z.t - z.tt) > 1.5;

const ZoneCard = ({ z, detail }: { z: Zone; detail?: boolean }) => {
  const { LOTS } = usePanelData();
  const { t, nf } = usePanelT();
  const pct = Math.round((z.used / z.cap) * 100);
  const dev = isDeviating(z);
  const n = LOTS.filter((l) => l.z === z.c).length;

  return (
    <div className={cn("zone", z.m === "zeroco" && "zc", dev && "dev")}>
      <div className="between" style={{ alignItems: "flex-start" }}>
        <div>
          <div
            className="mono"
            style={{ fontWeight: 600, fontSize: detail ? "12.5px" : "12px" }}
          >
            {z.c}
          </div>
          <div className="t-xs muted-2">
            {t(`m_${z.m}`)} · {n} {t("z_lots")}
          </div>
        </div>
        {dev ? (
          <Tag cls="p-crit">{t("z_dev")}</Tag>
        ) : (
          <Tag cls="p-good">{t("z_ok")}</Tag>
        )}
      </div>

      <div>
        <div className="between t-xs muted">
          <span>{t("z_cap")}</span>
          <span>
            {detail ? `${nf(z.used)} / ${nf(z.cap)} kg · ${pct}%` : `${pct}%`}
          </span>
        </div>
        <Bar pct={pct} cls={pct > 80 ? "w" : undefined} />
      </div>

      {detail ? (
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <div>
            <div className="t-xs muted-2">{t("z_temp")}</div>
            <div
              className="t-h3 num"
              style={dev ? { color: "var(--crit)" } : undefined}
            >
              {z.t} °C
            </div>
            <div className="t-xs muted-2">
              {t("z_target")} {z.tt} °C
            </div>
          </div>
          <div>
            <div className="t-xs muted-2">{t("z_rh")}</div>
            <div className="t-h3 num">{z.rh}%</div>
            <div className="t-xs muted-2">
              {t("z_target")} {z.rt}%
            </div>
          </div>
        </div>
      ) : (
        <div className="row t-xs muted" style={{ gap: 14 }}>
          <span>
            {t("z_temp")}{" "}
            <b style={dev ? { color: "var(--crit)" } : undefined}>{z.t} °C</b>
          </span>
          <span>
            {t("z_rh")} <b>{z.rh}%</b>
          </span>
        </div>
      )}
    </div>
  );
};

export default ZoneCard;
