/**
 * A5 - one user.
 *
 * The capability chips are the honest version of "role": rather than asking an
 * administrator to remember what "QC inspector" is allowed to do, the screen
 * lists the primitives that role actually carries.
 */

import {
  Btn,
  KV,
  PageHead,
  PanelCard,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { useLabels } from "@/pages/panels/admin/helpers";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const AdminUser = () => {
  const { roleLabelKey, capLabelKey, roleCaps } = useLabels();
  const { AUDIT, ORGS, USERS } = usePanelData();
  const { t } = usePanelT();

  const u = USERS[2];
  const o = ORGS[u.org];
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
            <Btn icon="lien">{t("au_reset")}</Btn>
            <Btn cls="btn-q">{t("au_suspend")}</Btn>
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
