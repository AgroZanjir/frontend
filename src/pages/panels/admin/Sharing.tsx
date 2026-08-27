/**
 * A9 - data-sharing grants.
 *
 * Who may see whose data, on what basis, and until when. The basis column
 * separates the two kinds of access that are constantly confused: a grant the
 * data's owner gave, which they can revoke, and one that rests on law, which
 * they cannot. The revoke action only appears on the first kind.
 */

import { Btn, Note, PageHead, Tag, Tbl } from "@/components/panel/primitives";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const AdminSharing = () => {
  const { GRANTS } = usePanelData();

  // Revoking sets the state and keeps the row: "who could see this in August?"
  // is a question a farmer asks later, and a deleted row cannot answer it. A
  // statutory grant has no revoke button at all - consent is the owner's to
  // withdraw, a reporting duty is not - and the API refuses one anyway.
  const revoke = useAction(
    (id: string) => api.post(`/governance/grants/${id}/revoke/`),
    { success: "act_revoked", capability: "administer" },
  );
  const { t } = usePanelT();

  return (
    <>
      <PageHead
        title={t("ag_title")}
        sub={t("ag_sub")}
        actions={<Btn icon="plus">{t("save")}</Btn>}
      />
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
