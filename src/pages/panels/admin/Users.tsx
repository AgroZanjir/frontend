/**
 * A4 - users.
 *
 * OneID and E-IMZO are separate columns because they answer different
 * questions: OneID says the person is who they claim, E-IMZO says they can
 * sign something that binds their organisation. Plenty of people need the
 * first and must not have the second.
 */

import { useNavigate } from "react-router-dom";

import { Btn, PageHead, Tag, Tbl } from "@/components/panel/primitives";
import { useLabels } from "@/pages/panels/admin/helpers";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const STATUS_CLASS: Record<string, string> = {
  active: "p-good",
  suspended: "p-crit",
  invited: "p-warn",
  pending: "p-warn",
};

const AdminUsers = () => {
  const { roleLabelKey } = useLabels();
  const { ORGS, USERS } = usePanelData();
  const { t } = usePanelT();
  const navigate = useNavigate();

  return (
    <>
      <PageHead
        title={t("au_title")}
        sub={t("au_sub")}
        actions={
          <Btn
            cls="btn-p"
            icon="plus"
            onClick={() => navigate("/admin/invite")}
          >
            {t("au_invite")}
          </Btn>
        }
      />
      <Tbl
        min={1060}
        head={[
          [t("au_name")],
          [t("au_org")],
          [t("au_role")],
          [t("au_oneid")],
          [t("au_eimzo")],
          [t("au_last")],
          [t("au_st")],
          [""],
        ]}
      >
        {USERS.map((u) => (
          <tr
            key={u.n}
            className="click"
            onClick={() => navigate("/admin/user")}
          >
            <td>
              <div className="row" style={{ gap: 8 }}>
                <span
                  className="avatar"
                  style={{ width: 24, height: 24, fontSize: 10 }}
                >
                  {u.ini}
                </span>
                <span style={{ fontWeight: 500 }}>{u.n}</span>
              </div>
            </td>
            <td>{ORGS[u.org].n}</td>
            <td>{t(roleLabelKey(u.role))}</td>
            <td>
              {u.oneid ? <Tag cls="p-good">✓</Tag> : <Tag cls="p-line">—</Tag>}
            </td>
            <td>
              {u.eimzo ? <Tag cls="p-good">✓</Tag> : <Tag cls="p-line">—</Tag>}
            </td>
            <td className="mono t-xs">
              {u.last ?? <span className="muted-2">{t("au_never")}</span>}
            </td>
            <td>
              <span className={`pill ${STATUS_CLASS[u.st] ?? "p-neut"}`}>
                <span className="dot" />
                {t(`s_${u.st}`)}
              </span>
            </td>
            <td className="r">
              <Btn sm cls="btn-q">
                {t("open")}
              </Btn>
            </td>
          </tr>
        ))}
      </Tbl>
    </>
  );
};

export default AdminUsers;
