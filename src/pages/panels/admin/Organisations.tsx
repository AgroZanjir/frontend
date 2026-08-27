/**
 * A2 - the organisation register.
 *
 * Who verified an organisation, and when, is in the table rather than buried
 * in the detail screen. Verification is a decision a named person made, and an
 * auditor asking "who admitted this carrier" should not have to open nine
 * records to find out.
 */

import { useNavigate } from "react-router-dom";

import { Btn, PageHead, Tbl } from "@/components/panel/primitives";
import { ORG_STATUS_CLASS, useLabels } from "@/pages/panels/admin/helpers";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const AdminOrganisations = () => {
  const { orgTypeKey } = useLabels();
  const { ORGS } = usePanelData();
  const { t } = usePanelT();
  const navigate = useNavigate();

  return (
    <>
      <PageHead
        title={t("ao_title")}
        sub={t("ao_sub")}
        actions={
          <>
            <Btn icon="chev">{t("filter")}</Btn>
            <Btn icon="down">{t("export")}</Btn>
          </>
        }
      />
      <Tbl
        min={1020}
        head={[
          [t("ao_title")],
          [t("ao_type")],
          [t("ao_tin")],
          [t("ao_region")],
          [t("ao_users"), true],
          [t("ao_st")],
          [t("ao_since")],
          [""],
        ]}
      >
        {ORGS.map((o) => (
          <tr
            key={o.c}
            className="click"
            onClick={() => navigate("/admin/organisation")}
          >
            <td>
              <div style={{ fontWeight: 500 }}>{o.n}</div>
              <div className="t-xs muted-2 mono">{o.c}</div>
            </td>
            <td>{t(orgTypeKey(o.t))}</td>
            <td className="mono">{o.tin}</td>
            <td>{o.r}</td>
            <td className="r">{o.users}</td>
            <td>
              <span className={`pill ${ORG_STATUS_CLASS[o.st]}`}>
                <span className="dot" />
                {t(`s_${o.st}`)}
              </span>
            </td>
            <td>
              {o.since ? (
                <>
                  <span className="mono t-xs">{o.since}</span>
                  <div className="t-xs muted-2">{o.by}</div>
                </>
              ) : (
                <span className="muted-2">—</span>
              )}
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

export default AdminOrganisations;
