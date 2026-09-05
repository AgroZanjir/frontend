/**
 * A8 - the audit log.
 *
 * Every entry carries the capability it was exercised under, not just the
 * action. "Viewed a lot" and "viewed a lot under a lender's collateral right"
 * are different events to anyone reviewing who saw what.
 */

import { Btn, PageHead, Tag, Tbl } from "@/components/panel/primitives";
import { useLabels } from "@/pages/panels/admin/helpers";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const AdminAudit = () => {
  const { capLabelKey } = useLabels();
  const { AUDIT } = usePanelData();
  const { t } = usePanelT();

  return (
    <>
      <PageHead
        title={t("al_title")}
        sub={t("al_sub")}
        actions={
          <>
            <Btn icon="chev">{t("filter")}</Btn>
            <Btn icon="down">{t("export")}</Btn>
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
        {AUDIT.map((a) => (
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
