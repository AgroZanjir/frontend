/**
 * H4 - QC inspection.
 *
 * The measurement fields carry their acceptable range as a hint rather than
 * validating silently: an inspector who knows why 5.2% failed will re-measure,
 * one who only sees a red border will re-type.
 *
 * Photographs are required. A grade without evidence is an opinion, and the
 * whole point of the record is that a buyer or an insurer can check it.
 */

import PanelIcon from "@/components/panel/icons";
import {
  Btn,
  Field,
  PageHead,
  PanelCard,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const HubQc = () => {
  const { QC } = usePanelData();
  const { t, pn } = usePanelT();

  return (
    <>
      <PageHead
        title={t("qc_title")}
        sub={t("qc_sub")}
        actions={<Btn icon="lab">{t("qc_lab")}</Btn>}
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,300px)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 15 }}>
          <div className="row" style={{ gap: 8 }}>
            <span className="lotid" style={{ fontSize: 14 }}>
              AZ-2026-SMQ-0412
            </span>
            <Tag>{pn("melon")}</Tag>
            <Tag cls="p-line">Torpeda</Tag>
          </div>

          <div className="grid g2" style={{ gap: 14 }}>
            <Field label={t("qc_stage")}>
              <select className="inp">
                <option>{t("q_intake")}</option>
              </select>
            </Field>
            <Field label={t("qc_by")}>
              <input className="inp" defaultValue="D. Yusupov" />
            </Field>
          </div>

          <div className="hr" />
          <div className="t-label">{t("qc_sub")}</div>

          <div className="grid g3" style={{ gap: 14 }}>
            <Field label={t("qc_brix")} required hint="6–18">
              <input className="inp" defaultValue="12.4" />
            </Field>
            <Field label={`${t("qc_cal")} (kg)`} required hint="1.4–3.2">
              <input className="inp" defaultValue="2.1" />
            </Field>
            <Field label={`${t("qc_firm")} (N)`}>
              <input className="inp" defaultValue="8.4" />
            </Field>
            <Field label={`${t("qc_def")} (%)`} hint="max 5.0">
              <input className="inp" defaultValue="1.8" />
            </Field>
            <Field label={t("qc_app")}>
              <select className="inp">
                <option>5 — {t("qc_pass")}</option>
                <option>4</option>
              </select>
            </Field>
            <Field label={t("qc_g")}>
              <select className="inp">
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </Field>
          </div>

          <div className="hr" />

          <div>
            <div className="between">
              <span className="t-label">
                {t("qc_photo")} <span className="reqd">*</span>
              </span>
              <span className="t-xs muted-2">{t("qc_photo_n")}</span>
            </div>
            <div className="row" style={{ marginTop: 8, gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 74,
                    height: 60,
                    borderRadius: "var(--r-sm)",
                    background: "var(--surface-3)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--ink-3)",
                  }}
                >
                  <PanelIcon name="cam" />
                </div>
              ))}
              <Btn sm icon="plus" style={{ height: 60 }}>
                {t("qc_add")}
              </Btn>
            </div>
          </div>

          <div className="row">
            <Btn cls="btn-p" icon="check">
              {t("qc_save")}
            </Btn>
            <Btn cls="btn-q">{t("cancel")}</Btn>
          </div>
        </PanelCard>

        <div>
          <PanelCard head={t("qc_hist")}>
            <Tbl head={[[t("qc_stage")], [t("qc_date")], [t("qc_g")]]}>
              {QC.map((r) => (
                <tr key={r.s}>
                  <td className="t-xs">{t(`q_${r.s}`)}</td>
                  <td className="mono">{r.d}</td>
                  <td>
                    <Tag cls="p-good">{r.g}</Tag>
                  </td>
                </tr>
              ))}
            </Tbl>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default HubQc;
