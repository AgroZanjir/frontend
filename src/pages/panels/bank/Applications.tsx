/**
 * B2 - the application queue.
 */

import { useNavigate } from "react-router-dom";

import { Btn, PageHead, Pill, Tbl } from "@/components/panel/primitives";
import { useState } from "react";

import { downloadCsv } from "@/lib/panel-download";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const BankApplications = () => {
  const { FINAPPS } = usePanelData();
  // An officer opens this to find the ones waiting on them.
  const [st, setSt] = useState("");
  const states = [...new Set(FINAPPS.map((a) => a.st))];
  const rows = st ? FINAPPS.filter((a) => a.st === st) : FINAPPS;
  const { t, money } = usePanelT();
  const navigate = useNavigate();

  return (
    <>
      <PageHead
        title={t("b_queue")}
        actions={
          <>
            <select
              className="inp"
              style={{ width: 170 }}
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
                  "applications",
                  [t("b_ref"), t("b_appl"), t("b_kind"), t("b_amt"), t("ba_ltv"), t("b_date"), t("b_st")],
                  rows.map((a) => [
                    a.c,
                    a.app,
                    t(`k_${a.kind}`),
                    a.amt,
                    a.ltv || "",
                    a.date,
                    t(`s_${a.st}`),
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
        {rows.map((a) => (
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
