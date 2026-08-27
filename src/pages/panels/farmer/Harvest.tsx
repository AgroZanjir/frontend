/**
 * F3 - harvest declaration.
 *
 * Declaring a harvest books a slot at the gate. That is the whole point of the
 * screen: the hub knows what is arriving and when, so the weighbridge queue is
 * a schedule rather than a morning of guesswork.
 */

import {
  Btn,
  Field,
  KV,
  Note,
  PageHead,
  PanelCard,
  Tag,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const FarmerHarvest = () => {
  const { FARMS } = usePanelData();
  const { t, pn } = usePanelT();

  return (
    <>
      <PageHead title={t("f_harv_t")} sub={t("f_harv_s")} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,340px)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 14 }}>
          <div className="grid g2" style={{ gap: 14 }}>
            <Field label={t("f_crop")} required>
              <select className="inp" defaultValue="pom">
                <option value="pom">{pn("pom")} · Qizil</option>
                <option value="grape">{pn("grape")} · Husayni</option>
              </select>
            </Field>
            <Field label={t("f_qty")} required>
              <input className="inp" defaultValue="5 600 kg" />
            </Field>
            <Field label={t("f_hdate")}>
              <input className="inp" defaultValue="2026-08-25" />
            </Field>
            <Field label={t("f_hub")}>
              <select className="inp">
                <option>Samarqand Hub</option>
                <option>Farg‘ona Hub</option>
              </select>
            </Field>
            <Field label={t("f_slot")}>
              <select className="inp">
                <option>2026-08-27 · 08:30</option>
                <option>2026-08-27 · 09:00</option>
              </select>
            </Field>
            <Field label={t("f_veh")}>
              <input className="inp" defaultValue="01 D 552 MN" />
            </Field>
          </div>

          <Note>{t("f_slotnote")}</Note>

          <div className="row">
            <Btn cls="btn-p" icon="check">
              {t("f_submit")}
            </Btn>
            <Btn cls="btn-q">{t("cancel")}</Btn>
          </div>
        </PanelCard>

        <div className="stack">
          <PanelCard head={t("g_farm")}>
            <KV
              rows={[
                [t("f_farm"), FARMS[0].n],
                [t("f_district"), "Payariq, Samarqand"],
                [t("f_certs"), <Tag cls="p-good">GlobalGAP</Tag>],
              ]}
            />
          </PanelCard>
          <PanelCard>
            <div className="t-sm muted">{t("pl_sugg")}</div>
            <div className="t-h2" style={{ marginTop: 4 }}>
              Z-ZEROCO-02
            </div>
            <div className="t-xs muted-2" style={{ marginTop: 2 }}>
              {t("pl_why")}
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default FarmerHarvest;
