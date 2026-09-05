/**
 * A3 - organisation verification.
 *
 * Six checks, five of them read straight out of a state register. Which checks
 * apply depends on what kind of entity this is: a carrier has no land rights,
 * a farmer needs no transport licence. Checks that do not apply are dimmed and
 * marked as not applicable rather than shown as passed - a check reported
 * green that was never run is exactly what a compliance officer catches.
 *
 * Only the sector licence is manual, which is what the whole flow is designed
 * around: verification carries legal weight for a lender, so one person signs
 * for it, and everything else is automated so that person is not the queue.
 */

import { useSearchParams } from "react-router-dom";

import {
  Btn,
  KV,
  Note,
  PageHead,
  PanelCard,
  Tag,
} from "@/components/panel/primitives";
import {
  ORG_STATUS_CLASS,
  VRESULT,
  useLabels,
} from "@/pages/panels/admin/helpers";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

/** The organisation currently under review in the demo dataset. */
const UNDER_REVIEW = "ORG-00563";

/** `[i18n key, format, size]` - what the applicant uploaded. */
const DOCS: [string, string, string][] = [
  ["doc_charter", "PDF", "1.2 MB"],
  ["doc_cert", "PDF", "340 KB"],
  ["doc_licence", "PDF", "—"],
];

const AdminOrganisation = () => {
  const [params] = useSearchParams();
  const { orgTypeKey } = useLabels();
  const { ORGS, VCHECKS, VLIC, VREQ, VSTATE } = usePanelData();
  const { t } = usePanelT();
  // Whichever organisation was opened. Falling back to one in review is right
  // for arriving from the sidebar: that is the one with a decision waiting.
  // Pinning the code meant the screen died the moment that organisation was
  // verified - which is the one thing this screen exists to do to it.
  const asked = params.get("o");
  const o =
    ORGS.find((x) => x.c === asked) ??
    ORGS.find((x) => x.c === UNDER_REVIEW) ??
    ORGS.find((x) => x.st === "review" || x.st === "pending") ??
    ORGS[0];

  // Recording one check. The API refuses a check that does not apply to this
  // kind of organisation - a carrier has no land rights - so the screen does
  // not have to police that twice.
  //
  // Declared before the early return below: a hook that runs on one render and
  // not the next is how a component starts reading somebody else's state.
  const record = useAction(
    (check: string, result: string) =>
      api.post(`/organisations/${o?.c}/checks/`, { check, result }),
    { success: "act_verified", capability: "verify" },
  );

  const required: string[] = o ? (VREQ[o.t] ?? []) : [];
  // The licence is the one check a person makes; if it is there, a rejection
  // lands on it rather than on somebody's identity.
  const failing = required.includes("licence") ? "licence" : required[0];

  const decideAll = async (result: string) => {
    for (const check of required) {
      const done = await record.run(check, result);
      if (!done) return;
    }
  };

  // Nothing to verify: a platform with no organisations is a fresh install,
  // not an error.
  if (!o) return null;

  return (
    <>
      <PageHead
        title={
          <>
            {o.n} ·{" "}
            <span className="mono" style={{ fontSize: 14 }}>
              {o.c}
            </span>
          </>
        }
        sub={t("av_sub")}
        actions={
          // The same two decisions as the card at the foot of the page. Two
          // places, one handler: a header button that looked identical and did
          // nothing was worse than no header button.
          <>
            <Btn
              icon="apps"
              disabled={record.disabled}
              onClick={() => void decideAll("review")}
            >
              {t("av_request")}
            </Btn>
            <Btn
              cls="btn-p"
              icon="check"
              disabled={record.disabled}
              onClick={() => void decideAll("pass")}
            >
              {t("av_approve")}
            </Btn>
          </>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,330px)" }}
      >
        <div className="stack">
          <PanelCard head={t("n_org")}>
            <div className="grid g2">
              <KV
                rows={[
                  [t("ao_type"), t(orgTypeKey(o.t))],
                  [t("ao_tin"), <span className="mono">{o.tin}</span>],
                  [t("ao_region"), o.r],
                ]}
              />
              <KV
                rows={[
                  [t("ao_users"), o.users],
                  [
                    t("ao_st"),
                    <span className={`pill ${ORG_STATUS_CLASS[o.st]}`}>
                      <span className="dot" />
                      {t(`s_${o.st}`)}
                    </span>,
                  ],
                  [t("ao_since"), <span className="muted-2">—</span>],
                ]}
              />
            </div>
          </PanelCard>

          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>{t("av_check")}</th>
                  <th>{t("av_source")}</th>
                  <th>{t("av_method")}</th>
                  <th>{t("av_result")}</th>
                </tr>
              </thead>
              <tbody>
                {VCHECKS.map(([key, label, source, method]) => {
                  const applies = VREQ[o.t].includes(key);
                  const result = applies ? (VSTATE[key] ?? "review") : "na";
                  const [resKey, resCls] = VRESULT[result];
                  return (
                    <tr
                      key={key}
                      style={applies ? undefined : { opacity: 0.55 }}
                    >
                      <td style={{ fontWeight: 500 }}>{t(label)}</td>
                      <td className="mono t-xs">
                        {applies ? (source ?? VLIC[o.t] ?? "—") : "—"}
                      </td>
                      <td>
                        {applies ? (
                          method === "auto" ? (
                            <Tag cls="p-cool">{t("av_auto")}</Tag>
                          ) : (
                            <Tag cls="p-line">{t("av_manual")}</Tag>
                          )
                        ) : (
                          <span className="muted-2">—</span>
                        )}
                      </td>
                      <td>
                        {applies ? (
                          // One check, one decision. The organisation's status
                          // is recomputed from these rows by the API - it is a
                          // cache of the checks, and a cache written by hand is
                          // how the two stop agreeing.
                          <select
                            className="inp"
                            style={{ padding: "3px 7px", fontSize: 11.5 }}
                            value={result}
                            disabled={record.disabled}
                            onChange={(e) =>
                              void record.run(key, e.target.value)
                            }
                            aria-label={t(label)}
                          >
                            <option value="pending">{t("v_pending")}</option>
                            <option value="review">{t("s_review")}</option>
                            <option value="pass">{t("v_pass")}</option>
                            <option value="fail">{t("v_fail")}</option>
                          </select>
                        ) : (
                          <span className={`pill ${resCls}`}>
                            <span className="dot" />
                            {t(resKey)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Note>{t("av_note")}</Note>
        </div>

        <div className="stack">
          <PanelCard head={t("av_docs")}>
            <div className="stack" style={{ gap: 8 }}>
              {DOCS.map(([key, ext, size]) => (
                <div className="between" key={key}>
                  <div className="row" style={{ gap: 8, minWidth: 0 }}>
                    <Tag
                      cls="p-line"
                      style={{ fontFamily: "var(--fm)", fontSize: 9 }}
                    >
                      {ext}
                    </Tag>
                    <span className="t-sm">{t(key)}</span>
                  </div>
                  <span className="t-xs muted-2 mono">{size}</span>
                </div>
              ))}
            </div>
          </PanelCard>

          <PanelCard head={t("av_decision")}>
            <div className="stack" style={{ gap: 9 }}>
              {/* Approving is passing every check that applies, one call each -
                  not a flag set beside them. The organisation's status follows
                  from the checks, so this button and the rows above cannot
                  disagree. */}
              <Btn
                cls="btn-p"
                icon="check"
                disabled={record.disabled}
                onClick={() => void decideAll("pass")}
              >
                {t("av_approve")}
              </Btn>
              <Btn
                icon="apps"
                disabled={record.disabled}
                onClick={() => void decideAll("review")}
              >
                {t("av_request")}
              </Btn>
              <Btn
                cls="btn-q"
                disabled={record.disabled}
                onClick={() => void record.run(failing, "fail")}
              >
                {t("av_reject")}
              </Btn>
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default AdminOrganisation;
