/**
 * H8 - condition monitoring.
 *
 * One trace per zone against its threshold. The threshold line is what makes a
 * reading legible: 6.9 °C means nothing on its own, and everything once the
 * dashed 5.5 °C line is under it.
 */

import { Spark } from "@/components/panel/charts";
import { PageHead, PanelCard, Btn, Tag } from "@/components/panel/primitives";
import { isDeviating } from "@/components/panel/ZoneCard";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

/** Twenty-four hours of two-hourly readings per monitored zone. */
const TRACES: Record<string, number[]> = {
  "Z-ZEROCO-01": [0.4, 0.4, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.4, 0.3],
  "Z-COLD-01": [4.1, 4.2, 4.2, 4.0, 4.1, 4.3, 4.2, 4.1, 4.0, 4.2, 4.3, 4.2],
  "Z-COLD-02": [4.0, 4.3, 5.2, 6.1, 6.7, 6.9, 6.2, 5.4, 4.6, 4.1, 4.0, 4.0],
};

const HubConditions = () => {
  const { findZone } = usePanelData();
  const { t } = usePanelT();

  return (
    <>
      <PageHead
        title={t("c_title")}
        sub={t("c_sub")}
        actions={<Btn icon="chev">{t("c_24")}</Btn>}
      />

      <div className="grid g2">
        {Object.entries(TRACES).map(([code, vals]) => {
          const z = findZone(code);
          const dev = isDeviating(z);
          return (
            <PanelCard key={code}>
              <div
                className="between"
                style={{ alignItems: "flex-start", marginBottom: 6 }}
              >
                <div>
                  <div className="mono t-h3">{code}</div>
                  <div className="t-xs muted-2">
                    {t("c_sensor")} SENSOR-{code.slice(2, 6)}-A
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    className="t-h1 num"
                    style={dev ? { color: "var(--crit)" } : undefined}
                  >
                    {z.t} °C
                  </div>
                  <div className="t-xs muted-2">
                    {t("z_target")} {z.tt} °C
                  </div>
                </div>
              </div>

              <Spark
                vals={vals}
                color={dev ? "var(--crit)" : "var(--s-zeroco)"}
                thr={z.tt + 1.5}
              />

              <div className="between t-xs muted-2" style={{ marginTop: 4 }}>
                <span>{t("c_24")}</span>
                {dev ? (
                  <Tag cls="p-crit">{t("z_dev")}</Tag>
                ) : (
                  <Tag cls="p-good">{t("z_ok")}</Tag>
                )}
              </div>
            </PanelCard>
          );
        })}
      </div>
    </>
  );
};

export default HubConditions;
