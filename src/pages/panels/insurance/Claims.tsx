/**
 * I1 - the claims queue.
 */

import { useNavigate } from "react-router-dom";

import { Btn, PageHead, Pill, Tbl } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const InsuranceClaims = () => {
  const { CLAIMS } = usePanelData();
  const { t, money } = usePanelT();
  const navigate = useNavigate();

  return (
    <>
      <PageHead
        title={t("i_title")}
        sub={t("i_sub")}
        actions={<Btn icon="down">{t("export")}</Btn>}
      />
      <Tbl
        min={920}
        head={[
          [t("i_ref")],
          [t("i_kind")],
          [t("i_holder")],
          [t("i_lot")],
          [t("i_amt"), true],
          [t("i_date")],
          [t("i_st")],
          [""],
        ]}
      >
        {CLAIMS.map((c) => (
          <tr
            key={c.c}
            className="click"
            onClick={() => navigate("/insurance/claim")}
          >
            <td>
              <span className="lotid">{c.c}</span>
            </td>
            <td>{t(`k_${c.kind}`)}</td>
            <td>{c.holder}</td>
            <td>
              <span className="mono">{c.lot}</span>
            </td>
            <td className="r">{money(c.amt)}</td>
            <td className="mono">{c.date}</td>
            <td>
              <Pill s={c.st} />
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

export default InsuranceClaims;
