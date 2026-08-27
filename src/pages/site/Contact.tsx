/**
 * Contact.
 *
 * The form does not send anything in this build, and the line under it says
 * so rather than letting someone type a real enquiry into a void.
 */

import { Band, Eyebrow, SiteBtn } from "@/components/site/SiteShell";
import { Field, KV, PanelCard } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";

const TOPICS = ["w_ct_t1", "w_ct_t2", "w_ct_t3", "w_ct_t4"];

const Contact = () => {
  const { t } = usePanelT();

  return (
    <>
      <Band tight>
        <Eyebrow>{t("w_contact")}</Eyebrow>
        <h1 className="d1" style={{ marginTop: 12, maxWidth: "12ch" }}>
          {t("w_ct_t")}
        </h1>
        <p className="lede">{t("w_ct_lede")}</p>
      </Band>

      <section className="band tight" style={{ paddingTop: 0 }}>
        <div className="band-in contact">
          <PanelCard bodyCls="stack" bodyStyle={{ gap: 14 }}>
            <div className="grid g2" style={{ gap: 14 }}>
              <Field label={t("w_ct_name")} required>
                <input className="inp" />
              </Field>
              <Field label={t("w_ct_org")}>
                <input className="inp" />
              </Field>
              <Field label={t("w_ct_email")} required>
                <input className="inp" type="email" />
              </Field>
              <Field label={t("w_ct_phone")}>
                <input className="inp mono" defaultValue="+998 __ ___ __ __" />
              </Field>
            </div>

            <Field label={t("w_ct_topic")}>
              <select className="inp">
                {TOPICS.map((k) => (
                  <option key={k}>{t(k)}</option>
                ))}
              </select>
            </Field>

            <Field label={t("w_ct_msg")}>
              <textarea className="inp" rows={5} />
            </Field>

            <div className="row">
              <SiteBtn cls="btn-p" icon="arr">
                {t("w_ct_send")}
              </SiteBtn>
            </div>
            <p className="t-xs muted-2" style={{ margin: 0 }}>
              {t("w_ct_note")}
            </p>
          </PanelCard>

          <div className="stack">
            <PanelCard head={t("w_ct_reach")}>
              <KV
                rows={[
                  [t("w_ct_addr_l"), t("w_ct_addr")],
                  [t("w_ct_hours"), t("w_ct_hours_v")],
                  [t("w_ct_email"), "info@agrozanjir.uz"],
                  [
                    t("w_ct_phone"),
                    <span className="mono">+998 71 000 00 00</span>,
                  ],
                ]}
              />
            </PanelCard>

            <PanelCard head={t("w_pt_join_t")}>
              <p className="t-sm muted" style={{ margin: "0 0 12px" }}>
                {t("w_pt_join_p")}
              </p>
              <SiteBtn sm to="/partners" icon="arr">
                {t("w_partners")}
              </SiteBtn>
            </PanelCard>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
