/**
 * A5 - one user.
 *
 * The capability chips are the honest version of "role": rather than asking an
 * administrator to remember what "QC inspector" is allowed to do, the screen
 * lists the primitives that role actually carries.
 *
 * The person is named in the query string rather than the path because the
 * screen is also a nav item, and a nav link cannot fill in a path parameter.
 * Arriving from the sidebar with nobody named shows the first person on the
 * list, which is a starting point rather than a wrong answer - but the two
 * buttons here change somebody, so they act on whoever is actually shown.
 */

import { useSearchParams } from "react-router-dom";
import { useState } from "react";

import {
  Btn,
  KV,
  PageHead,
  PanelCard,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { useLabels } from "@/pages/panels/admin/helpers";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const AdminUser = () => {
  const { roleLabelKey, capLabelKey, roleCaps } = useLabels();
  const { AUDIT, ORGS, ROLES, USERS } = usePanelData();
  const { t } = usePanelT();
  const [params] = useSearchParams();

  const asked = params.get("u");
  const u = USERS.find((x) => x.id === asked) ?? USERS[0];
  // Nobody on the platform at all is a fresh install, not an error.
  const o = u ? ORGS[u.org] : undefined;

  // Held here rather than derived from `u` so the select does not snap back
  // while the change is in flight and the panel data is refetching.
  const [role, setRole] = useState<string | null>(null);
  const chosen = role ?? u?.role ?? "";

  const setStatus = useAction(
    (id: string, status: string) =>
      api.post(`/users/${id}/status/`, { status }),
    { success: "act_status", capability: "administer" },
  );
  const setRoleOnServer = useAction(
    (id: string, next: string) => api.post(`/users/${id}/role/`, { role: next }),
    { success: "act_role", capability: "administer" },
  );

  if (!u || !o) return null;
  // Their own entries first; the tail keeps the panel from looking empty for a
  // person who has not acted today.
  const trail = AUDIT.filter((a) => a.who === u.n)
    .concat(AUDIT.slice(0, 2))
    .slice(0, 4);

  return (
    <>
      <PageHead
        title={u.n}
        actions={
          <>
            {/* Changing a role is picking one and applying it, in that order.
                A bare "change role" button had nowhere to say what to. */}
            <select
              className="inp"
              style={{ width: 210 }}
              value={chosen}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((group) => (
                <optgroup key={group.g} label={t(group.g)}>
                  {group.items.map((r) => (
                    <option key={r[0]} value={r[0]}>
                      {t(r[1])}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <Btn
              icon="lien"
              disabled={setRoleOnServer.disabled || chosen === u.role}
              onClick={() => void setRoleOnServer.run(u.id, chosen)}
            >
              {t("au_reset")}
            </Btn>
            <Btn
              cls="btn-q"
              disabled={setStatus.disabled}
              onClick={() =>
                void setStatus.run(
                  u.id,
                  u.st === "suspended" ? "active" : "suspended",
                )
              }
            >
              {u.st === "suspended" ? t("au_restore") : t("au_suspend")}
            </Btn>
          </>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,330px)" }}
      >
        <div className="stack">
          <PanelCard head={t("n_user")}>
            <div
              className="row"
              style={{ gap: 14, alignItems: "center", marginBottom: 12 }}
            >
              <span
                className="avatar"
                style={{ width: 44, height: 44, fontSize: 16 }}
              >
                {u.ini}
              </span>
              <div>
                <div className="t-h2">{u.n}</div>
                <div className="t-sm muted">
                  {t(roleLabelKey(u.role))} · {o.n}
                </div>
              </div>
            </div>
            <div className="hr" />
            <div className="grid g2">
              <KV
                rows={[
                  [t("au_org"), o.n],
                  [t("au_role"), t(roleLabelKey(u.role))],
                  [t("ai_scope"), <span className="mono">HUB-SMQ</span>],
                ]}
              />
              <KV
                rows={[
                  [
                    t("au_oneid"),
                    u.oneid ? (
                      <Tag cls="p-good">{t("av_pass")}</Tag>
                    ) : (
                      <Tag cls="p-line">—</Tag>
                    ),
                  ],
                  [
                    t("au_eimzo"),
                    u.eimzo ? (
                      <Tag cls="p-good">{t("av_pass")}</Tag>
                    ) : (
                      <Tag cls="p-line">{t("av_na")}</Tag>
                    ),
                  ],
                  [t("au_last"), <span className="mono t-xs">{u.last}</span>],
                ]}
              />
            </div>
          </PanelCard>

          <PanelCard head={t("ar_caps")}>
            <div className="chipset">
              {roleCaps(u.role).map((c) => (
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

        <div>
          <PanelCard head={t("al_title")}>
            <Tbl head={[[t("al_when")], [t("al_action")]]}>
              {trail.map((a, i) => (
                <tr key={`${a.at}-${i}`}>
                  <td className="mono t-xs">{a.at}</td>
                  <td className="t-sm">
                    {t(a.act)}
                    <div className="t-xs muted-2 mono">{a.obj}</div>
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

export default AdminUser;
