/**
 * A9 - data-sharing grants.
 *
 * Who may see whose data, on what basis, and until when. The basis column
 * separates the two kinds of access that are constantly confused: a grant the
 * data's owner gave, which they can revoke, and one that rests on law, which
 * they cannot. The revoke action only appears on the first kind.
 */

import { useState } from "react";

import {
  Btn,
  Field,
  Note,
  PageHead,
  PanelCard,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

/** The vocabularies the register is written in, as the seeded grants use them. */
const SCOPES = ["g_covered", "g_pledged", "g_contract", "g_region", "g_national"];
const FIELDSETS = ["g_f_trace", "g_f_cond", "g_f_coll", "g_f_agg", "g_f_anon"];

const AdminSharing = () => {
  const { GRANTS, ORGS } = usePanelData();

  // Revoking sets the state and keeps the row: "who could see this in August?"
  // is a question a farmer asks later, and a deleted row cannot answer it. A
  // statutory grant has no revoke button at all - consent is the owner's to
  // withdraw, a reporting duty is not - and the API refuses one anyway.
  const revoke = useAction(
    (id: string) => api.post(`/governance/grants/${id}/revoke/`),
    { success: "act_revoked", capability: "administer" },
  );
  const { t } = usePanelT();

  // Granting one, which the plus button used to only look like it did. The
  // endpoint has been there all along; this is the form it never had.
  const [adding, setAdding] = useState(false);
  const [org, setOrg] = useState(ORGS[0]?.c ?? "");
  const [scope, setScope] = useState(SCOPES[0]);
  const [fields, setFields] = useState(FIELDSETS[0]);
  const [basis, setBasis] = useState("owner");
  const [until, setUntil] = useState("");

  const grant = useAction(
    () =>
      api.post("/governance/grants/", {
        grantee_party: org,
        scope_key: scope,
        fields_key: fields,
        basis,
        ...(until ? { expires_on: until } : {}),
      }),
    { success: "act_granted", capability: "administer" },
  );

  const create = async () => {
    if (await grant.run()) setAdding(false);
  };

  return (
    <>
      <PageHead
        title={t("ag_title")}
        sub={t("ag_sub")}
        actions={
          <Btn
            icon="plus"
            cls={adding ? "btn-q" : undefined}
            onClick={() => setAdding((was) => !was)}
          >
            {adding ? t("cancel") : t("ag_new")}
          </Btn>
        }
      />
      {adding && (
        <PanelCard style={{ marginBottom: 14 }} bodyCls="stack">
          <div className="grid g3" style={{ gap: 14 }}>
            <Field label={t("ag_who")} required>
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
            <Field label={t("ag_scope")} required>
              <select
                className="inp"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                {SCOPES.map((k) => (
                  <option key={k} value={k}>
                    {t(k)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("ag_fields")} required>
              <select
                className="inp"
                value={fields}
                onChange={(e) => setFields(e.target.value)}
              >
                {FIELDSETS.map((k) => (
                  <option key={k} value={k}>
                    {t(k)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("ag_basis")} required>
              <select
                className="inp"
                value={basis}
                onChange={(e) => setBasis(e.target.value)}
              >
                <option value="owner">{t("g_by_owner")}</option>
                <option value="law">{t("g_by_law")}</option>
                <option value="contract">{t("g_by_contract")}</option>
              </select>
            </Field>
            {/* A grant with no end is a grant nobody revisits, so the field is
                here rather than buried - but it stays optional, because a
                statutory one genuinely has no end. */}
            <Field label={t("ag_until")} hint={t("ag_unlimited")}>
              <input
                className="inp mono"
                type="date"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
              />
            </Field>
          </div>
          <div className="row">
            <Btn
              cls="btn-p"
              icon="check"
              disabled={grant.disabled}
              onClick={() => void create()}
            >
              {t("save")}
            </Btn>
          </div>
        </PanelCard>
      )}

      <Tbl
        min={940}
        head={[
          [t("ag_who")],
          [t("ag_scope")],
          [t("ag_fields")],
          [t("ag_until")],
          [t("ag_basis")],
          [""],
        ]}
      >
        {GRANTS.map((g) => (
          <tr key={`${g.org}-${g.scope}`}>
            <td style={{ fontWeight: 500 }}>{g.org}</td>
            <td>{t(g.scope)}</td>
            <td className="t-sm muted">{t(g.fields)}</td>
            <td className="mono t-xs">
              {g.until ?? <span className="muted-2">{t("ag_unlimited")}</span>}
            </td>
            <td>
              {g.by === "g_by_law" ? (
                <Tag cls="p-info">{t("g_by_law")}</Tag>
              ) : (
                <Tag cls="p-good">{t("g_by_owner")}</Tag>
              )}
            </td>
            <td className="r">
              {g.by === "g_by_law" ? (
                <span className="t-xs muted-2">—</span>
              ) : (
                <Btn
                  sm
                  cls="btn-q"
                  disabled={revoke.disabled || g.st !== "active"}
                  onClick={() => void revoke.run(g.id)}
                >
                  {g.st === "active" ? t("ag_revoke") : t(`s_${g.st}`)}
                </Btn>
              )}
            </td>
          </tr>
        ))}
      </Tbl>
      <Note style={{ marginTop: 12 }}>{t("av_note")}</Note>
    </>
  );
};

export default AdminSharing;
