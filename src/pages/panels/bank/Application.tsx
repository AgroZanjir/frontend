/**
 * B3 - one application.
 *
 * The decision buttons sit beside the risk list, not under the amount: the
 * question a credit officer is answering is not "how much" but "against what".
 */

import { useNavigate } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import {
  Btn,
  KV,
  PageHead,
  PanelCard,
  Pill,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT, daysLeft } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const BankApplication = () => {
  const { FINAPPS, findLot } = usePanelData();
  const { t, nf, pn, money } = usePanelT();
  const navigate = useNavigate();

  // The application under review is what this screen is about - and one with
  // collateral, because the whole page is about what secures it. A pre-export
  // application with no lots yet is a real state and this is not the screen
  // that shows it.
  const a =
    FINAPPS.find((x) => x.st === "review" && x.lots.length) ??
    FINAPPS.find((x) => x.lots.length) ??
    FINAPPS[0];

  // Approving is not disbursing. The bank's own systems move the money; what
  // the platform records is the decision, which is what a lien is later hung
  // on - so neither button invents a payment.
  const decide = useAction(
    (status: string) =>
      api.post(`/finance/applications/${a.c}/decide/`, { status }),
    { success: "act_decided", capability: "decide" },
  );
  const l = a ? findLot(a.lots[0]) : undefined;

  return (
    <>
      <PageHead
        title={
          <>
            {t("ba_title")} ·{" "}
            <span className="mono" style={{ fontSize: 15 }}>
              {a.c}
            </span>
          </>
        }
        actions={
          <Btn
            cls="btn-p"
            icon="coll"
            onClick={() => navigate("/bank/collateral")}
          >
            {t("ba_inspect")}
          </Btn>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,320px)" }}
      >
        <div className="stack">
          <PanelCard head={t("ba_purpose")}>
            <div className="grid g2">
              <KV
                rows={[
                  [t("b_appl"), a.app],
                  [t("b_kind"), t(`k_${a.kind}`)],
                  [t("b_date"), <span className="mono">{a.date}</span>],
                ]}
              />
              <KV
                rows={[
                  [t("b_amt"), <b>{money(a.amt, a.cur)}</b>],
                  [
                    t("ba_ltv"),
                    <>
                      {a.ltv}%{" "}
                      <span className="t-xs muted-2">({t("b_ltv_d")})</span>
                    </>,
                  ],
                  [t("b_st"), <Pill s={a.st} />],
                ]}
              />
            </div>
          </PanelCard>

          <div>
            <div className="sec-h">
              <span className="t-h2">{t("ba_lots")}</span>
            </div>
            <Tbl
              head={[
                [t("n_lots")],
                [t("f_crop")],
                [t("pl_zone")],
                [t("g_est"), true],
                [t("ci_val"), true],
                [t("xs_win"), true],
              ]}
            >
              {l ? (
                <tr
                  className="click"
                  onClick={() => navigate("/bank/collateral")}
                >
                  <td>
                    <span className="lotid">{l.c}</span>
                  </td>
                  <td>{pn(l.p)}</td>
                  <td>
                    <span className="mono">{l.z}</span>{" "}
                    {l.z?.includes("ZEROCO") && (
                      <Tag cls="p-zeroco">ZEROCO</Tag>
                    )}
                  </td>
                  <td className="r">{nf(l.net)} kg</td>
                  <td className="r">{money(l.val)}</td>
                  <td className="r">
                    {daysLeft(l)} {t("days")}
                  </td>
                </tr>
              ) : (
                <tr>
                  {/* An application can exist before anything secures it -
                      a pre-export facility is applied for against a harvest
                      that is still in the field. */}
                  <td colSpan={6} className="muted-2 t-sm">
                    {t("ba_nocoll")}
                  </td>
                </tr>
              )}
            </Tbl>
          </div>
        </div>

        <div className="stack">
          <PanelCard head={t("ci_risk")}>
            <div className="stack" style={{ gap: 9 }}>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ color: "var(--good)" }}>
                  <PanelIcon name="check" />
                </span>
                <span className="t-sm">{t("ci_r3")}</span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ color: "var(--good)" }}>
                  <PanelIcon name="check" />
                </span>
                <span className="t-sm">{t("ci_intact")}</span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ color: "var(--warn)" }}>
                  <PanelIcon name="exc" />
                </span>
                <span className="t-sm">{t("ci_r1")}</span>
              </div>
            </div>
          </PanelCard>

          <PanelCard head={t("ba_decide")}>
            <div className="row" style={{ gap: 8 }}>
              <Btn
                cls="btn-p"
                icon="check"
                disabled={decide.disabled}
                onClick={() => void decide.run("approved")}
              >
                {t("ba_approve")}
              </Btn>
              <Btn
                cls="btn-q"
                disabled={decide.disabled}
                onClick={() => void decide.run("rejected")}
              >
                {t("ba_reject")}
              </Btn>
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default BankApplication;
