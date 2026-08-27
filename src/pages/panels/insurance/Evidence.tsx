/**
 * I3 - the evidence bundle.
 *
 * What the hub exported, as the adjuster receives it: the raw sensor series
 * first, because everything else in the bundle is derived from it. Readings
 * over the threshold are marked in the table as well as on the trace - the
 * same fact, in the form each reader will check.
 */

import { Spark } from "@/components/panel/charts";
import {
  Btn,
  PageHead,
  PanelCard,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

/** `[i18n key, format, size, selected]`. */
const FILES: [string, string, string, boolean][] = [
  ["e_c1", "CSV", "412 KB", true],
  ["e_c2", "JSON", "3 KB", false],
  ["e_c3", "PDF", "96 KB", false],
  ["e_c4", "PDF", "188 KB", false],
  ["e_c5", "PDF", "44 KB", false],
];

const InsuranceEvidence = () => {
  const { EXCURSION } = usePanelData();
  const { t } = usePanelT();
  const e = EXCURSION;

  return (
    <>
      <PageHead
        title={
          <>
            {t("ic_evidence")} ·{" "}
            <span className="mono" style={{ fontSize: 15 }}>
              {e.c}
            </span>
          </>
        }
        sub={t("ic_note")}
        actions={
          <>
            <Btn cls="btn-p" icon="down">
              {t("e_bundle")}
            </Btn>
            <Btn icon="print">{t("print")}</Btn>
          </>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,320px) minmax(0,1fr)" }}
      >
        <PanelCard>
          <div className="t-label" style={{ marginBottom: 9 }}>
            {t("e_contents")}
          </div>
          <div className="stack" style={{ gap: 2 }}>
            {FILES.map(([k, ext, size, on]) => (
              <div
                key={k}
                className="row between"
                style={{
                  padding: "7px 8px",
                  borderRadius: "var(--r-sm)",
                  background: on ? "var(--primary-soft)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <div className="row" style={{ gap: 8, minWidth: 0 }}>
                  <Tag
                    cls="p-line"
                    style={{ fontFamily: "var(--fm)", fontSize: 9 }}
                  >
                    {ext}
                  </Tag>
                  <span
                    className="t-sm"
                    style={on ? { fontWeight: 600 } : undefined}
                  >
                    {t(k)}
                  </span>
                </div>
                <span className="t-xs muted-2 mono">{size}</span>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard>
          <div className="between" style={{ marginBottom: 9 }}>
            <span className="t-h3">{t("e_c1")}</span>
            <span className="t-xs muted-2 mono">{e.sensor}</span>
          </div>
          <Spark vals={e.trace} color="var(--crit)" thr={e.thr} />
          <div className="hr" />
          <Tbl
            head={[["ts"], [t("z_temp"), true], [t("z_rh"), true], [t("b_st")]]}
          >
            {e.trace.slice(0, 7).map((v, i) => {
              const hh = String(1 + Math.floor(i / 3)).padStart(2, "0");
              const mm = String((i * 15) % 60).padStart(2, "0");
              const bad = v > e.thr;
              return (
                <tr key={i}>
                  <td className="mono">
                    2026-08-24 {hh}:{mm}
                  </td>
                  <td
                    className="r num"
                    style={
                      bad
                        ? { color: "var(--crit)", fontWeight: 600 }
                        : undefined
                    }
                  >
                    {v.toFixed(1)}
                  </td>
                  <td className="r num">{(84 + i * 0.3).toFixed(1)}</td>
                  <td>
                    {bad ? (
                      <Tag cls="p-crit">{t("z_dev")}</Tag>
                    ) : (
                      <Tag cls="p-good">{t("z_ok")}</Tag>
                    )}
                  </td>
                </tr>
              );
            })}
          </Tbl>
        </PanelCard>
      </div>
    </>
  );
};

export default InsuranceEvidence;
