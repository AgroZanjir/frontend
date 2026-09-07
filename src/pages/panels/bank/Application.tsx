/**
 * B3 - one application.
 *
 * The decision buttons sit beside the risk list, not under the amount: the
 * question a credit officer is answering is not "how much" but "against what".
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import {
  Btn,
  KV,
  Note,
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

/**
 * The application this browser had open last.
 *
 * Wrapped because storage throws rather than returns null where it is turned
 * off, and a screen must not fail to render over a bookmark.
 */
const LAST = "az.bank.application";

const recall = (): string | null => {
  try {
    return localStorage.getItem(LAST);
  } catch {
    return null;
  }
};

const remember = (code: string): void => {
  try {
    localStorage.setItem(LAST, code);
  } catch {
    /* nothing to do: the next visit starts from the queue instead */
  }
};

const BankApplication = () => {
  const [params] = useSearchParams();
  const { FINAPPS, findLot } = usePanelData();
  const { t, nf, pn, money } = usePanelT();
  const navigate = useNavigate();

  // Whichever application was opened. It used to pick the one in review, so
  // every row on the list opened the same page - and worse, approving it moved
  // it out of review, so the screen quietly switched to a different
  // application and the decision looked like it had not happened.
  //
  // Arriving from the sidebar names none, and then the right answer is the one
  // this reader had open last: an approver works through a file over several
  // visits, and being returned to whatever the queue happens to sort first
  // means finding their place again every time. Only if there is no last one -
  // a new browser, cleared storage - does it fall back to one awaiting a
  // decision, and one with collateral first, because the page is about what
  // secures it.
  const asked = params.get("a");
  const a =
    FINAPPS.find((x) => x.c === asked) ??
    FINAPPS.find((x) => x.c === recall()) ??
    FINAPPS.find((x) => x.st === "review" && x.lots.length) ??
    FINAPPS.find((x) => x.lots.length) ??
    FINAPPS[0];

  // Remembered per browser, not per account: it is a bookmark, not a decision,
  // and it is only ever used to choose between applications this session is
  // already allowed to read.
  useEffect(() => {
    if (a) remember(a.c);
  }, [a?.c]);

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
            {/* A credit officer holds `transact` and not `decide` - the
                approval is a separate person on purpose. Saying so is the
                point: the buttons used to be grey and silent, which reads as
                a broken screen rather than as somebody else's decision. */}
            {decide.missing && (
              <Note style={{ marginBottom: 10 }}>
                {t("act_no_cap_n")}
              </Note>
            )}
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
