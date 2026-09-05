/**
 * A8 - the audit log.
 *
 * Every entry carries the capability it was exercised under, not just the
 * action. "Viewed a lot" and "viewed a lot under a lender's collateral right"
 * are different events to anyone reviewing who saw what.
 */

import { Btn, PageHead, Tag, Tbl } from "@/components/panel/primitives";
import { useLabels } from "@/pages/panels/admin/helpers";
import { useState } from "react";

import { usePanelT } from "@/lib/panel-format";
import { downloadCsv } from "@/lib/panel-download";
import { usePanelData } from "@/lib/panel-data";

const AdminAudit = () => {
  const { capLabelKey } = useLabels();
  const { AUDIT } = usePanelData();
  const { t } = usePanelT();

  // Which capability the entries were exercised under. That is the question an
  // audit log is opened with - who has been reading, who has been deciding -
  // and the button beside it used to be a chevron that did nothing.
  const [cap, setCap] = useState("");
  const caps = [...new Set(AUDIT.map((a) => a.k))].sort();
  const rows = cap ? AUDIT.filter((a) => a.k === cap) : AUDIT;

  return (
    <>
      <PageHead
        title={t("al_title")}
        sub={t("al_sub")}
        actions={
          <>
            <select
              className="inp"
              style={{ width: 190 }}
              value={cap}
              onChange={(e) => setCap(e.target.value)}
            >
              <option value="">{t("filter")}: {t("all")}</option>
              {caps.map((c) => (
                <option key={c} value={c}>
                  {t(capLabelKey(c))}
                </option>
              ))}
            </select>
            <Btn
              icon="down"
              onClick={() =>
                downloadCsv(
                  "audit-log",
                  [t("al_when"), t("al_who"), t("au_org"), t("al_action"), t("al_object"), t("ar_caps")],
                  rows.map((a) => [
                    a.at,
                    a.who,
                    a.org,
                    t(a.act),
                    a.obj,
                    t(capLabelKey(a.k)),
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
        min={960}
        head={[
          [t("al_when")],
          [t("al_who")],
          [t("au_org")],
          [t("al_action")],
          [t("al_object")],
          [t("ar_caps")],
        ]}
      >
        {rows.map((a) => (
          // A read and the write it led to land in the same second on the
          // same object, so neither the time nor the pair identifies a row.
          <tr key={a.id}>
            <td className="mono t-xs">{a.at}</td>
            <td style={{ fontWeight: 500 }}>{a.who}</td>
            <td className="t-sm muted">{a.org}</td>
            <td>{t(a.act)}</td>
            <td>
              <span className="mono t-xs">{a.obj}</span>
            </td>
            <td>
              <Tag cls="p-cool">{t(capLabelKey(a.k))}</Tag>
            </td>
          </tr>
        ))}
      </Tbl>
    </>
  );
};

export default AdminAudit;
