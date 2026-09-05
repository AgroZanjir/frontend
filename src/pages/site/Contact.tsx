/**
 * Contact.
 *
 * The form sends. It used to say under itself that it did not, which was
 * honest and still left a website collecting nothing.
 *
 * Nothing here is an identity: the enquiry names no organisation on the
 * platform and creates no account. It is a message somebody at the operator
 * reads, which is why the reply carries nothing back but the fact that it
 * arrived.
 */

import { useState } from "react";

import { Band, Eyebrow, SiteBtn } from "@/components/site/SiteShell";
import { Field, KV, Note, PanelCard } from "@/components/panel/primitives";
import { sendEnquiry } from "@/lib/site-api";
import { usePanelT } from "@/lib/panel-format";

const TOPICS = ["w_ct_t1", "w_ct_t2", "w_ct_t3", "w_ct_t4"];

const EMPTY = {
  name: "",
  organisation: "",
  email: "",
  phone: "",
  topic: TOPICS[0],
  message: "",
};

const Contact = () => {
  const { t } = usePanelT();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (field: keyof typeof EMPTY) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    // The message under a field is about what was in it; typing makes it
    // stale, so it goes.
    setErrors(({ [field]: _gone, ...rest }) => rest);
  };

  const send = async () => {
    setSending(true);
    const failed = await sendEnquiry(form);
    setSending(false);
    if (failed) {
      setErrors(failed);
      return;
    }
    setForm(EMPTY);
    setErrors({});
    setSent(true);
  };

  // Which of the two things went wrong at the top: too many, or the request
  // itself. Field errors sit on their fields instead.
  const overall = errors.__all__?.[0];

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
              <Field label={t("w_ct_name")} required error={errors.name?.[0]}>
                <input
                  className="inp"
                  value={form.name}
                  onChange={(e) => set("name")(e.target.value)}
                />
              </Field>
              <Field label={t("w_ct_org")}>
                <input
                  className="inp"
                  value={form.organisation}
                  onChange={(e) => set("organisation")(e.target.value)}
                />
              </Field>
              <Field label={t("w_ct_email")} required error={errors.email?.[0]}>
                <input
                  className="inp"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                />
              </Field>
              <Field label={t("w_ct_phone")}>
                <input
                  className="inp mono"
                  value={form.phone}
                  placeholder="+998 __ ___ __ __"
                  onChange={(e) => set("phone")(e.target.value)}
                />
              </Field>
            </div>

            <Field label={t("w_ct_topic")}>
              <select
                className="inp"
                value={form.topic}
                onChange={(e) => set("topic")(e.target.value)}
              >
                {TOPICS.map((k) => (
                  <option key={k} value={k}>
                    {t(k)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t("w_ct_msg")} required error={errors.message?.[0]}>
              <textarea
                className="inp"
                rows={5}
                value={form.message}
                onChange={(e) => set("message")(e.target.value)}
              />
            </Field>

            {sent && <Note>{t("w_ct_sent")}</Note>}
            {overall && (
              <Note>
                {t(overall === "throttled" ? "w_ct_toomany" : "act_failed")}
              </Note>
            )}

            <div className="row">
              <SiteBtn
                cls="btn-p"
                icon="arr"
                disabled={sending}
                onClick={() => void send()}
              >
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
