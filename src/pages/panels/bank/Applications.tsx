/**
 * B2 - the application queue.
 */

import { useNavigate } from "react-router-dom";

import { Btn, PageHead, Pill, Tbl } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const BankApplications = () => {
  const { FINAPPS } = usePanelData();
  const { t, money } = usePanelT();
  const navigate = useNavigate();

  return (
    <>
      <PageHead
        title={t("b_queue")}
        actions={<Btn icon="chev">{t("filter")}</Btn>}
      />
      <Tbl
        min={900}
        head={[
          [t("b_ref")],
          [t("b_appl")],
          [t("b_kind")],
          [t("b_amt"), true],
          [t("ba_ltv"), true],
          [t("b_date")],
          [t("b_st")],
          [""],
        ]}
      >
        {FINAPPS.map((a) => (
          <tr
            key={a.c}
            className="click"
            onClick={() => navigate(`/bank/application?a=${a.c}`)}
          >
            <td>
              <span className="lotid">{a.c}</span>
            </td>
            <td>{a.app}</td>
            <td>{t(`k_${a.kind}`)}</td>
            <td className="r">{money(a.amt, a.cur)}</td>
            <td className="r">{a.ltv ? `${a.ltv}%` : "—"}</td>
            <td className="mono">{a.date}</td>
            <td>
              <Pill s={a.st} />
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

export default BankApplications;
