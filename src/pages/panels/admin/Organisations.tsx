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
import { useState } from "react";

import { downloadCsv } from "@/lib/panel-download";
import { usePanelData } from "@/lib/panel-data";

const AdminOrganisations = () => {
  const { orgTypeKey } = useLabels();
  const { ORGS } = usePanelData();
  // The queue is what this screen is opened for, so it can be narrowed to it.
  const [st, setSt] = useState("");
  const states = [...new Set(ORGS.map((o) => o.st))];
  const rows = st ? ORGS.filter((o) => o.st === st) : ORGS;
  const { t } = usePanelT();
  const navigate = useNavigate();

  return (
    <>
      <PageHead
        title={t("ao_title")}
        sub={t("ao_sub")}
        actions={
          <>
            <select
              className="inp"
              style={{ width: 180 }}
              value={st}
              onChange={(e) => setSt(e.target.value)}
            >
              <option value="">
                {t("filter")}: {t("all")}
              </option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {t(`s_${s}`)}
                </option>
              ))}
            </select>
            <Btn
              icon="down"
              onClick={() =>
                downloadCsv(
                  "organisations",
                  [t("ao_title"), t("ao_type"), t("ao_tin"), t("ao_region"), t("ao_users"), t("ao_st"), t("ao_since")],
                  rows.map((o) => [
                    o.n,
                    t(orgTypeKey(o.t)),
                    o.tin,
                    o.r,
                    o.users,
                    t(`s_${o.st}`),
                    o.since ?? "",
                  ]),
                )
              }
            >
              {t("export")}
            </Btn>
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
        {rows.map((o) => (
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
