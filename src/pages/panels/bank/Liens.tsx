/**
 * B5 - the lien register.
 *
 * Released liens stay in the register with their release date. A register that
 * only shows what is currently encumbered cannot answer the question a lender
 * asks second: what has this borrower pledged before, and did it come back?
 */

import { Btn, Note, PageHead, Pill, Tbl } from "@/components/panel/primitives";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const BankLiens = () => {
  const { LIENS } = usePanelData();
  const { t, money } = usePanelT();

  // Releasing is an event, never a deletion: the row stays and gains a release
  // date, and the lot's own log records it. "Was this ever pledged?" is the
  // question a bank asks six months later.
  const release = useAction(
    (id: string) => api.post(`/finance/liens/${id}/release/`),
    { success: "act_released", capability: "decide" },
  );

  return (
    <>
      <PageHead title={t("li_title")} sub={t("li_sub")} />
      <Tbl
        min={760}
        head={[
          [t("li_lot")],
          [t("li_fa")],
          [t("li_amt"), true],
          [t("li_since")],
          [t("li_st")],
          [""],
        ]}
      >
        {LIENS.map((x) => (
          <tr key={x.lot}>
            <td>
              <span className="lotid">{x.lot}</span>
            </td>
            <td>
              <span className="mono">{x.fa}</span>
            </td>
            <td className="r">{money(x.amt)}</td>
            <td className="mono">{x.since}</td>
            <td>
              {x.st === "active" ? (
                <Pill s="active" cls="p-crit" />
              ) : (
                <Pill s="released" />
              )}
            </td>
            <td className="r">
              {x.st === "active" ? (
                <Btn
                  sm
                  cls="btn-p"
                  disabled={release.disabled}
                  onClick={() => void release.run(x.id)}
                >
                  {t("li_release")}
                </Btn>
              ) : (
                <span className="t-xs muted-2 mono">{x.rel}</span>
              )}
            </td>
          </tr>
        ))}
      </Tbl>
      <Note style={{ marginTop: 12 }}>{t("li_note")}</Note>
    </>
  );
};

export default BankLiens;
