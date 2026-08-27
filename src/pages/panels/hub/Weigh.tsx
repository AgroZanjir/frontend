/**
 * H3 - weigh and register.
 *
 * This is where a lot is born, and where the platform's base unit shows: gross
 * minus tare, in kilograms, with the net field carrying the accent because it
 * is the number every later screen inherits.
 *
 * The offline note is not a disclaimer. The gate loses connectivity, and a
 * capture screen that silently fails there costs a whole morning's intake.
 */

import {
  Btn,
  Field,
  KV,
  Note,
  PageHead,
  PanelCard,
} from "@/components/panel/primitives";
import PanelIcon from "@/components/panel/icons";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const HubWeigh = () => {
  const { FARMS } = usePanelData();
  const { t, pn } = usePanelT();

  return (
    <>
      <PageHead title={t("w_title")} sub={t("w_sub")} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,320px)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 16 }}>
          <div className="grid g3" style={{ gap: 14 }}>
            <Field label={t("w_gross")}>
              <input className="inp big" defaultValue="4 310" />
            </Field>
            <Field label={t("w_tare")}>
              <input className="inp big" defaultValue="110" />
            </Field>
            <Field label={t("w_net")}>
              <input
                className="inp big"
                defaultValue="4 200"
                style={{
                  color: "var(--primary)",
                  borderColor: "var(--primary)",
                }}
              />
            </Field>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <span className="pill p-good">
              <span className="dot" />
              GATE-01 · {t("w_live")}
            </span>
            <span className="t-xs muted-2 mono">4 310.4 kg · 06:41:22</span>
          </div>

          <div className="hr" />

          <div className="grid g2" style={{ gap: 14 }}>
            <Field label={t("w_supplier")}>
              <select className="inp">
                <option>{FARMS[0].n}</option>
                <option>{FARMS[1].n}</option>
              </select>
            </Field>
            <Field label={t("g_prod")}>
              <select className="inp">
                <option>{pn("melon")} · Torpeda</option>
              </select>
            </Field>
            <Field label={t("g_veh")}>
              <input className="inp" defaultValue="01 A 234 BC" />
            </Field>
            <Field label={t("pl_pos")}>
              <input className="inp" defaultValue="—" />
            </Field>
          </div>

          <Note>{t("w_note")}</Note>

          <div className="row">
            <Btn cls="btn-p" icon="print">
              {t("w_create")}
            </Btn>
            <Btn cls="btn-q">{t("cancel")}</Btn>
          </div>
        </PanelCard>

        <div className="stack">
          <PanelCard>
            <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
              <span className="pill p-info" style={{ padding: 5 }}>
                <PanelIcon name="cond" />
              </span>
              <div className="t-sm">{t("w_offline")}</div>
            </div>
          </PanelCard>
          <PanelCard>
            <div className="t-label">{t("pl_sugg")}</div>
            <div className="t-h1 mono" style={{ marginTop: 5 }}>
              Z-ZEROCO-01
            </div>
            <div className="t-xs muted-2" style={{ marginTop: 3 }}>
              {t("pl_why")}
            </div>
            <div className="hr" />
            <KV
              rows={[
                [t("z_temp"), "0.4 °C"],
                [t("z_rh"), "97.6%"],
                [t("z_cap"), "74%"],
              ]}
            />
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default HubWeigh;
