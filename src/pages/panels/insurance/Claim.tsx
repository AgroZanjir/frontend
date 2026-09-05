/**
 * I2 - one claim.
 *
 * A storage claim is settled against the excursion that caused it, so the
 * event sits on the same page as the amount. The adjuster is not being asked
 * to trust the claimant's account of what happened - the sensor trace, the
 * threshold and the affected lot are all here.
 */

import { useNavigate, useSearchParams } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import { Spark } from "@/components/panel/charts";
import {
  Btn,
  KV,
  PageHead,
  PanelCard,
  Pill,
} from "@/components/panel/primitives";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const InsuranceClaim = () => {
  const [params] = useSearchParams();
  const { CLAIMS, EXCURSION, findLot } = usePanelData();
  const { t, nf, money, dur } = usePanelT();

  // One claim, and the one that was opened. This screen used to read `CLAIMS[0]`
  // for everything it displayed and act on `find(st === "review")` - so with a
  // second claim in the list, the approve button decided a claim the reader was
  // not looking at. The fallback is the one awaiting a decision, which is the
  // right landing when the sidebar brought you here rather than a row.
  const asked = params.get("c");
  const c =
    CLAIMS.find((x) => x.c === asked) ??
    CLAIMS.find((x) => x.st === "review") ??
    CLAIMS[0];

  // Approving sends the claimed figure through as the assessed one, because
  // this screen has no adjuster's field yet. That is a gap, not a rule: the
  // API takes an assessed amount precisely because the two differ.
  const decide = useAction(
    (status: string) =>
      api.post(`/finance/claims/${c.c}/decide/`, {
        status,
        assessed_minor: status === "approved" ? Math.round(c.amt * 100) : 0,
      }),
    { success: "act_decided", capability: "decide" },
  );
  const navigate = useNavigate();

  const e = EXCURSION;
  const l = findLot(c.lot);
  const contents = ["e_c1", "e_c2", "e_c3", "e_c4", "e_c5"];

  return (
    <>
      <PageHead
        title={
          <>
            {t("ic_title")} ·{" "}
            <span className="mono" style={{ fontSize: 15 }}>
              {c.c}
            </span>
          </>
        }
        actions={
          <Btn
            cls="btn-p"
            icon="evid"
            onClick={() => navigate("/insurance/evidence")}
          >
            {t("ic_evidence")}
          </Btn>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,320px)" }}
      >
        <div className="stack">
          <PanelCard head={t("ic_title")}>
            <div className="grid g2">
              <KV
                rows={[
                  [t("i_pol"), <span className="mono">{c.pol}</span>],
                  [t("i_kind"), t(`k_${c.kind}`)],
                  [t("i_holder"), c.holder],
                ]}
              />
              <KV
                rows={[
                  [t("i_amt"), <b>{money(c.amt)}</b>],
                  [t("i_date"), <span className="mono">{c.date}</span>],
                  [t("i_st"), <Pill s={c.st} />],
                ]}
              />
            </div>
          </PanelCard>

          <PanelCard head={t("ic_event")}>
            <div
              className="row"
              style={{ gap: 10, alignItems: "flex-start", marginBottom: 10 }}
            >
              <span className="pill p-crit" style={{ padding: 6 }}>
                <PanelIcon name="exc" />
              </span>
              <div>
                <div className="t-h3">
                  <span className="mono">{e.c}</span> · {e.zone}
                </div>
                <div className="t-xs muted-2" style={{ marginTop: 2 }}>
                  {e.from} → {e.to} · {dur(e.durMin)}
                </div>
              </div>
            </div>

            <Spark vals={e.trace} color="var(--crit)" thr={e.thr} />
            <div className="hr" />
            <KV
              rows={[
                [
                  t("e_peak"),
                  <b style={{ color: "var(--crit)" }}>{e.peak} °C</b>,
                ],
                [t("e_thr"), `${e.thr} °C`],
                [
                  t("i_lot"),
                  <>
                    <span className="lotid">{l.c}</span> · {nf(l.net)} kg
                  </>,
                ],
              ]}
            />
          </PanelCard>
        </div>

        <div className="stack">
          <PanelCard head={t("ic_evidence")}>
            <div className="stack" style={{ gap: 8 }}>
              {contents.map((k) => (
                <div
                  key={k}
                  className="row"
                  style={{ gap: 8, alignItems: "flex-start" }}
                >
                  <span
                    style={{ color: "var(--good)", flex: "none", marginTop: 1 }}
                  >
                    <PanelIcon name="check" />
                  </span>
                  <span className="t-sm">{t(k)}</span>
                </div>
              ))}
            </div>
          </PanelCard>

          <PanelCard head={t("ic_assess")}>
            <p className="t-xs muted-2" style={{ margin: "0 0 11px" }}>
              {t("ic_note")}
            </p>
            <div className="row" style={{ gap: 8 }}>
              <Btn
                cls="btn-p"
                icon="check"
                disabled={decide.disabled}
                onClick={() => void decide.run("approved")}
              >
                {t("ic_approve")}
              </Btn>
              <Btn
                cls="btn-q"
                disabled={decide.disabled}
                onClick={() => void decide.run("declined")}
              >
                {t("ic_reject")}
              </Btn>
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default InsuranceClaim;
