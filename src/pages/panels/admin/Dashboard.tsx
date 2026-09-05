/**
 * A1 - administration dashboard.
 *
 * Administration's real job on this platform is the verification queue: until
 * an organisation is verified, nothing it records is worth anything to a bank.
 * So the queue is the main column and the role model - 13 org types, 37 roles,
 * 10 capabilities - sits beside it as reference.
 */

import { Link, useNavigate } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import {
  AlertBox,
  Btn,
  PageHead,
  PanelCard,
  Stat,
  Tbl,
} from "@/components/panel/primitives";
import { ORG_STATUS_CLASS, useLabels } from "@/pages/panels/admin/helpers";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const AdminDashboard = () => {
  const { orgTypeKey } = useLabels();
  const { AUDIT, CAPS, GRANTS, ORGS, ORGTYPES, ROLE_COUNT, USERS } =
    usePanelData();
  const { t } = usePanelT();
  const navigate = useNavigate();

  const queue = ORGS.filter((o) => ["review", "pending"].includes(o.st));
  const active = USERS.filter((u) => u.st === "active").length;

  return (
    <>
      <PageHead
        title={t("ad_title")}
        sub={t("ad_sub")}
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

      <div className="grid g4">
        <Stat
          k={t("ad_orgs")}
          v={ORGS.filter((o) => o.st === "verified").length}
          d={t("ad_orgs_d")}
          acc
        />
        <Stat k={t("ad_users")} v={active} d={t("ad_users_d")} />
        <Stat
          k={t("ad_pending")}
          v={queue.length}
          d={t("ad_pending_d")}
          color="var(--warn)"
        />
        <Stat k={t("ad_grants")} v={GRANTS.length} d={t("ad_grants_d")} />
      </div>

      <div
        className="sec grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,330px)" }}
      >
        <div>
          <div className="sec-h">
            <span className="t-h2">{t("ad_queue")}</span>
            <Link to="/admin/organisations">
              <Btn cls="btn-q" sm>
                {t("more")}
                <PanelIcon name="arr" />
              </Btn>
            </Link>
          </div>
          <Tbl
            head={[
              [t("ao_title")],
              [t("ao_type")],
              [t("ao_tin")],
              [t("ao_users"), true],
              [t("ao_st")],
              [""],
            ]}
          >
            {queue.map((o) => (
              <tr
                key={o.c}
                className="click"
                onClick={() => navigate(`/admin/organisation?o=${o.c}`)}
              >
                <td>
                  <div style={{ fontWeight: 500 }}>{o.n}</div>
                  <div className="t-xs muted-2 mono">{o.c}</div>
                </td>
                <td>{t(orgTypeKey(o.t))}</td>
                <td className="mono">{o.tin}</td>
                <td className="r">{o.users}</td>
                <td>
                  <span className={`pill ${ORG_STATUS_CLASS[o.st]}`}>
                    <span className="dot" />
                    {t(`s_${o.st}`)}
                  </span>
                </td>
                <td className="r">
                  <Btn sm cls="btn-p">
                    {t("open")}
                  </Btn>
                </td>
              </tr>
            ))}
          </Tbl>

          <div className="sec">
            <div className="sec-h">
              <span className="t-h2">{t("ad_recent")}</span>
              <Link to="/admin/audit">
                <Btn cls="btn-q" sm>
                  {t("more")}
                  <PanelIcon name="arr" />
                </Btn>
              </Link>
            </div>
            <Tbl
              head={[
                [t("al_when")],
                [t("al_who")],
                [t("al_action")],
                [t("al_object")],
              ]}
            >
              {AUDIT.slice(0, 5).map((a) => (
                <tr key={a.id}>
                  <td className="mono t-xs">{a.at}</td>
                  <td>
                    {a.who}
                    <div className="t-xs muted-2">{a.org}</div>
                  </td>
                  <td>{t(a.act)}</td>
                  <td>
                    <span className="mono t-xs">{a.obj}</span>
                  </td>
                </tr>
              ))}
            </Tbl>
          </div>
        </div>

        <div className="stack">
          <PanelCard head={t("n_roles")}>
            <div className="stack" style={{ gap: 9 }}>
              {(
                [
                  [t("n_orgtypes"), ORGTYPES.length],
                  [t("n_rolecount"), ROLE_COUNT],
                  [t("n_capcount"), CAPS.length],
                ] as [string, number][]
              ).map(([k, v]) => (
                <div className="between" key={k}>
                  <span className="t-sm">{k}</span>
                  <span className="t-h2 num">{v}</span>
                </div>
              ))}
            </div>
            <div className="hr" />
            <p className="t-xs muted-2" style={{ margin: 0 }}>
              {t("ar_sub")}
            </p>
            <div style={{ marginTop: 10 }}>
              <Btn sm icon="arr" onClick={() => navigate("/admin/roles")}>
                {t("n_roles")}
              </Btn>
            </div>
          </PanelCard>

          <AlertBox lvl="info" title="OneID" desc={t("au_sub")} />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
