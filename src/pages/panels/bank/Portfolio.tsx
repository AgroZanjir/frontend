/**
 * B1 - the lender's portfolio.
 *
 * What is out, what secures it, and which piece of collateral is running out
 * of shelf life. The sales-window alert is the whole reason a bank would take
 * produce as collateral at all: the risk is not default, it is the crop
 * spoiling before it can be sold.
 */

import { Link, useNavigate } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import {
  AlertBox,
  Btn,
  PageHead,
  PanelCard,
  Pill,
  Stat,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT, daysLeft } from "@/lib/panel-format";
import { downloadCsv } from "@/lib/panel-download";
import { usePanelData } from "@/lib/panel-data";

const BankPortfolio = () => {
  const { FINAPPS, LOTS } = usePanelData();
  const { t, pn, mln } = usePanelT();
  const navigate = useNavigate();

  const out = FINAPPS.filter((a) => a.st === "disbursed").reduce(
    (s, a) => s + a.amt,
    0,
  );
  const pledged = LOTS.filter((l) => l.pledge);
  const coll = pledged.reduce((s, l) => s + l.val, 0);

  return (
    <>
      <PageHead
        title={t("b_title")}
        sub={t("b_sub")}
        actions={
          <Btn
            icon="down"
            onClick={() =>
              downloadCsv(
                "portfolio",
                [t("b_ref"), t("b_appl"), t("b_kind"), t("b_amt"), t("ba_ltv"), t("b_date"), t("b_st")],
                FINAPPS.map((a) => [
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
        }
      />

      <div className="grid g4">
        <Stat
          k={t("b_out")}
          v={
            <>
              {mln(out)} <small>{t("uzs")}</small>
            </>
          }
          d={t("b_out_d")}
          acc
        />
        <Stat
          k={t("b_coll")}
          v={
            <>
              {mln(coll)} <small>{t("uzs")}</small>
            </>
          }
          d={t("b_coll_d")}
        />
        <Stat
          k={t("ba_ltv")}
          v={
            <>
              62<small>%</small>
            </>
          }
          d={t("b_ltv_d")}
        />
        <Stat k={t("b_risk")} v={1} d={t("b_risk_d")} color="var(--warn)" />
      </div>

      <div
        className="sec grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,300px)" }}
      >
        <div>
          <div className="sec-h">
            <span className="t-h2">{t("b_queue")}</span>
            <Link to="/bank/applications">
              <Btn cls="btn-q" sm>
                {t("more")}
                <PanelIcon name="arr" />
              </Btn>
            </Link>
          </div>
          <Tbl
            min={740}
            head={[
              [t("b_ref")],
              [t("b_appl")],
              [t("b_kind")],
              [t("b_amt"), true],
              [t("ba_ltv"), true],
              [t("b_st")],
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
                <td className="r">{mln(a.amt)}</td>
                <td className="r">{a.ltv ? `${a.ltv}%` : "—"}</td>
                <td>
                  <Pill s={a.st} />
                </td>
              </tr>
            ))}
          </Tbl>
        </div>

        <div className="stack">
          <PanelCard head={t("li_title")}>
            <div className="stack" style={{ gap: 10 }}>
              {pledged.map((l, i) => (
                <div key={l.c}>
                  {i > 0 && <div className="hr" style={{ margin: 0 }} />}
                  <div className="between">
                    <span className="lotid">{l.c}</span>
                    <span className="t-sm num">{mln(l.val)}</span>
                  </div>
                  <div className="t-xs muted-2">
                    {pn(l.p)} · {l.z} · {daysLeft(l)} {t("days")}
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
          <AlertBox
            lvl="warn"
            title={<span className="mono">AZ-2026-SMQ-0396</span>}
            desc={t("nt_win")}
          />
        </div>
      </div>
    </>
  );
};

export default BankPortfolio;
