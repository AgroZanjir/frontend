/**
 * A7 - invite a person into an organisation.
 *
 * Facility scope is on the form, not an afterthought: a gate operator at the
 * Samarqand hub has no business capturing weights at Farg'ona, and the moment
 * to say so is when the invitation is written.
 */

import {
  Btn,
  Field,
  Note,
  PageHead,
  PanelCard,
  Tag,
} from "@/components/panel/primitives";
import { useLabels } from "@/pages/panels/admin/helpers";
import { useState } from "react";

import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const AdminInvite = () => {
  const { capLabelKey } = useLabels();
  const { ORGS, ROLES } = usePanelData();
  const { t } = usePanelT();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [org, setOrg] = useState(ORGS[0]?.c ?? "");
  const [role, setRole] = useState("gate_operator");
  const [scope, setScope] = useState("HUB-SMQ");

  // Every role, grouped as the role model groups them: an invitation to a bank
  // is not an invitation to a hub, and the list was showing hub roles whatever
  // organisation was chosen.
  const groups = ROLES;
  const previewed =
    ROLES.flatMap((g) => g.items).find((r) => r[0] === role) ??
    ROLES[0].items[0];

  const invite = useAction(
    () =>
      api.post("/users/invite/", {
        display_name: name,
        // Whoever is invited signs in through OneID; the username is what the
        // password door needs until then, and it has to be something a person
        // can be told over a phone.
        username: username || email.split("@")[0] || phone.replace(/\D/g, ""),
        email,
        phone,
        party: org,
        role,
        facility_codes: scope === "all" ? [] : [scope],
      }),
    { success: "act_invited", capability: "administer" },
  );

  const send = async () => {
    const done = await invite.run();
    if (done) {
      setName("");
      setUsername("");
      setEmail("");
      setPhone("");
    }
  };

  return (
    <>
      <PageHead title={t("ai_title")} sub={t("ai_sub")} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,330px)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 14 }}>
          <div className="grid g2" style={{ gap: 14 }}>
            <Field label={t("ai_name")} required>
              <input
                className="inp"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label={t("ai_user")} required hint={t("ai_user_hint")}>
              <input
                className="inp mono"
                value={username}
                placeholder="n.familya"
                onChange={(e) => setUsername(e.target.value.trim())}
              />
            </Field>
            <Field label={t("ai_phone")}>
              <input
                className="inp mono"
                value={phone}
                placeholder="+998 90 123 45 67"
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label={t("ai_email")}>
              <input
                className="inp"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label={t("au_org")} required>
              <select
                className="inp"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
              >
                {ORGS.map((o) => (
                  <option key={o.c} value={o.c}>
                    {o.n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("au_role")} required>
              <select
                className="inp"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {groups.map((group) => (
                  <optgroup key={group.g} label={t(group.g)}>
                    {group.items.map((r) => (
                      <option key={r[0]} value={r[0]}>
                        {t(r[1])}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label={t("ai_scope")}>
              <select
                className="inp"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="HUB-SMQ">HUB-SMQ — Samarqand Hub</option>
                <option value="HUB-FRG">HUB-FRG — Farg‘ona Hub</option>
                <option value="all">{t("ai_all")}</option>
              </select>
            </Field>
          </div>

          <Note>{t("ai_note")}</Note>

          <div className="row">
            <Btn
              cls="btn-p"
              icon="arr"
              disabled={
                invite.disabled || !name || !(username || email || phone)
              }
              onClick={() => void send()}
            >
              {t("ai_send")}
            </Btn>
            <Btn
              cls="btn-q"
              onClick={() => {
                setName("");
                setUsername("");
                setEmail("");
                setPhone("");
              }}
            >
              {t("cancel")}
            </Btn>
          </div>
        </PanelCard>

        <div>
          <PanelCard head={t("ar_caps")}>
            <div className="chipset">
              {previewed[2].map((c) => (
                <Tag key={c} cls="p-cool">
                  {t(capLabelKey(c))}
                </Tag>
              ))}
            </div>
            <p className="t-xs muted-2" style={{ margin: "11px 0 0" }}>
              {t("ar_legend")}
            </p>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default AdminInvite;
