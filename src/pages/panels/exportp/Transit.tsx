/**
 * E6 - in transit.
 *
 * The cold chain does not stop at the hub gate, so neither does the record.
 * The same trace, the same threshold, the same evidence - now on a truck.
 */

import { Spark } from "@/components/panel/charts";
import {
  Btn,
  KV,
  PageHead,
  PanelCard,
  Pill,
  Stat,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { downloadCsv } from "@/lib/panel-download";
import { usePanelData } from "@/lib/panel-data";

/** Route progress, as a percentage of the total distance. */
const PROGRESS = 65;

const ExportTransit = () => {
  const { SHIPMENT } = usePanelData();
  const { t, nf } = usePanelT();
  const s = SHIPMENT;

  return (
    <>
      <PageHead
        title={t("tr_title")}
        sub={t("tr_sub")}
        actions={
          /* The reason anyone exports this screen is a dispute about the cold
             chain, so the file is the readings themselves, in order. */
          <Btn
            icon="down"
            onClick={() =>
              downloadCsv(
                `transit-${s.c}`,
                [t("c_sensor"), t("tr_now")],
                s.temps.map((temp, i) => [`${i + 1}`, temp]),
              )
            }
          >
            {t("export")}
          </Btn>
        }
      />

      <div className="grid g3" style={{ marginBottom: 14 }}>
        <Stat
          k={t("tr_now")}
          v={
            <>
              {s.temps[s.temps.length - 1].toFixed(1)} <small>°C</small>
            </>
          }
          d={t("tr_within")}
          acc
          color="var(--s-zeroco)"
        />
        <Stat
          k={t("sh_set")}
          v={
            <>
              {s.set.toFixed(1)} <small>°C</small>
            </>
          }
          d="± 2.0 °C"
        />
        <Stat
          k={t("tr_left")}
          v={
            <>
              {nf(412)} <small>km</small>
            </>
          }
          d={`${t("sh_eta")} ${s.eta.slice(11)}`}
        />
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,330px)" }}
      >
        <PanelCard head={t("sh_route")} tools={<Pill s="in_progress" />}>
          <Spark vals={s.temps} color="var(--s-zeroco)" thr={s.set + 2} />
          <div className="between t-xs muted-2" style={{ marginTop: 4 }}>
            <span className="mono">{s.dep}</span>
            <span>{t("c_24")}</span>
          </div>

          <div className="hr" />

          <div style={{ position: "relative", height: 34 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 16,
                height: 3,
                borderRadius: 2,
                background: "var(--surface-3)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                width: `${PROGRESS}%`,
                top: 16,
                height: 3,
                borderRadius: 2,
                background: "var(--s-zeroco)",
              }}
            />
            {(
              [
                [0, "Samarqand"],
                [PROGRESS, ""],
                [100, "Almaty"],
              ] as [number, string][]
            ).map(([p, label]) => (
              <div
                key={p}
                style={{
                  position: "absolute",
                  left: `${p}%`,
                  top: 11,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    background:
                      p <= PROGRESS ? "var(--s-zeroco)" : "var(--surface-3)",
                    border: "2.5px solid var(--surface)",
                  }}
                />
                {label && (
                  <div
                    className="t-xs muted-2"
                    style={{
                      marginTop: 3,
                      whiteSpace: "nowrap",
                      transform: `translateX(${p === 0 ? "0" : "-50%"})`,
                      position: "relative",
                      left: p === 0 ? 0 : 6,
                    }}
                  >
                    {label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </PanelCard>

        <div className="stack">
          <PanelCard head={t("sh_title")}>
            <KV
              rows={[
                [t("sh_carrier"), s.carrier],
                [t("sh_veh"), <span className="mono">{s.veh}</span>],
                [t("tr_pos"), "Qyzylorda, KZ"],
                [t("sh_eta"), <span className="mono">{s.eta}</span>],
              ]}
            />
          </PanelCard>
          <PanelCard head={t("sh_lots")}>
            <div className="between">
              <span className="lotid">{s.lots[0].c}</span>
              <span className="t-sm num">{nf(s.lots[0].qty)} kg</span>
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default ExportTransit;
