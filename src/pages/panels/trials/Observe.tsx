/**
 * Z3 - observation entry, on the phone it will actually be used on.
 *
 * Trial observations are taken standing in a cold room, so the screen is
 * shown in its real frame: two big fields, two photographs, one button. The
 * sync line is the honest part - the chamber has no signal, and the capture
 * has to survive that.
 */

import PanelIcon from "@/components/panel/icons";
import {
  Btn,
  Field,
  PageHead,
  PanelCard,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { useState } from "react";

import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelData } from "@/lib/panel-data";
import { usePanelT } from "@/lib/panel-format";

/** Observations already recorded for this arm. */
const RECORDED: [number, string, string][] = [
  [0, "4 200", "8.4"],
  [7, "4 171", "8.3"],
  [14, "4 141", "8.1"],
];

const TrialObserve = () => {
  const { t, nf } = usePanelT();
  const { TRIAL } = usePanelData();

  // The next sampling day, not an arbitrary one: the schedule is the protocol,
  // and an observation on day 9 of a seven-day schedule is not a measurement
  // anyone can compare.
  const next = TRIAL.days[TRIAL.observed] ?? TRIAL.days.at(-1) ?? 0;
  const [arm, setArm] = useState<"zeroco" | "control">("zeroco");
  const [weight, setWeight] = useState("");
  const [waste, setWaste] = useState("");
  const [firmness, setFirmness] = useState("");

  const side = arm === "zeroco" ? TRIAL.z : TRIAL.c;
  // Weight loss is what the trial compares, and it is a percentage of what
  // went in - so the tablet takes the kilograms a person can actually weigh
  // and does the arithmetic here.
  const lossPct =
    side.qty > 0 && Number(weight) > 0
      ? Math.max(((side.qty - Number(weight)) / side.qty) * 100, 0)
      : 0;
  const wastePct =
    side.qty > 0 && Number(waste) > 0 ? (Number(waste) / side.qty) * 100 : 0;

  const record = useAction(
    () =>
      api.post(`/quality/trials/${TRIAL.code}/observations/`, {
        arm,
        day_index: next,
        observed_on: new Date().toISOString().slice(0, 10),
        weight_loss_pct: Number(lossPct.toFixed(2)),
        waste_pct: Number(wastePct.toFixed(2)),
        // Left out rather than sent empty: a measurement nobody took is
        // absent, and absent is not the same as zero on a chart the whole
        // business case rests on.
        ...(Number(firmness) > 0 ? { firmness_n: Number(firmness) } : {}),
      }),
    { success: "act_observed", capability: "capture" },
  );

  const save = async () => {
    const done = await record.run();
    if (done) {
      setWeight("");
      setWaste("");
      setFirmness("");
    }
  };

  return (
    <>
      <PageHead title={t("o_title")} sub={t("o_sub")} />

      <div className="row" style={{ gap: 26, alignItems: "flex-start" }}>
        <div className="phone">
          <div className="phone-top">09:41</div>
          <div className="phone-b">
            <div className="row" style={{ gap: 7 }}>
              <Tag cls="p-zeroco">{TRIAL.code}</Tag>
              <select
                className="inp"
                style={{ padding: "3px 6px", fontSize: 11 }}
                value={arm}
                onChange={(e) => setArm(e.target.value as "zeroco" | "control")}
                aria-label={t("t_arms")}
              >
                <option value="zeroco">{t("t_armz")}</option>
                <option value="control">{t("t_armc")}</option>
              </select>
            </div>
            <div className="lotid" style={{ fontSize: 13 }}>
              {side.lot}
            </div>

            <PanelCard bodyCls="stack" bodyStyle={{ gap: 11, padding: 13 }}>
              <Field label={t("o_dayidx")} hint={t("o_day_hint")}>
                <input className="inp big" value={next} readOnly />
              </Field>
              <Field
                label={`${t("o_weight")} (kg)`}
                required
                hint={`${t("o_started")} ${nf(side.qty)} kg`}
              >
                <input
                  className="inp big"
                  inputMode="decimal"
                  placeholder={String(side.qty)}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Field>
              <Field
                label={`${t("o_waste")} (kg)`}
                hint={wastePct ? `${wastePct.toFixed(1)}%` : undefined}
              >
                <input
                  className="inp"
                  inputMode="decimal"
                  value={waste}
                  onChange={(e) => setWaste(e.target.value)}
                />
              </Field>
              <Field
                label={`${t("t_firm")} (N)`}
                hint={
                  lossPct ? `${t("t_loss")} ${lossPct.toFixed(1)}%` : undefined
                }
              >
                <input
                  className="inp"
                  inputMode="decimal"
                  value={firmness}
                  onChange={(e) => setFirmness(e.target.value)}
                />
              </Field>
            </PanelCard>

            <PanelCard bodyStyle={{ padding: 12 }}>
              <div className="t-label" style={{ marginBottom: 7 }}>
                {t("o_photo")} <span className="reqd">*</span>
              </div>
              <div className="row" style={{ gap: 7 }}>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 56,
                      height: 48,
                      borderRadius: "var(--r-sm)",
                      background: "var(--surface-3)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--ink-3)",
                    }}
                  >
                    <PanelIcon name="cam" />
                  </div>
                ))}
                <div
                  style={{
                    width: 56,
                    height: 48,
                    borderRadius: "var(--r-sm)",
                    border: "1px dashed var(--line-2)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--ink-3)",
                  }}
                >
                  <PanelIcon name="plus" />
                </div>
              </div>
            </PanelCard>

            <Btn
              cls="btn-p"
              icon="check"
              style={{ justifyContent: "center", padding: 11 }}
              disabled={record.disabled || !weight}
              onClick={() => void save()}
            >
              {t("o_save")}
            </Btn>

            <div
              className="row t-xs muted-2"
              style={{ gap: 6, justifyContent: "center" }}
            >
              <PanelIcon name="cond" />
              <span>{t("o_sync")}</span>
            </div>
          </div>
        </div>

        <div className="stack" style={{ flex: 1, minWidth: 260 }}>
          <PanelCard head={t("o_sub")}>
            <p className="t-sm muted" style={{ margin: 0 }}>
              {t("w_offline")}
            </p>
          </PanelCard>
          <PanelCard head={t("t_obs")}>
            <Tbl
              head={[
                [t("o_dayidx"), true],
                [t("o_weight"), true],
                [t("t_firm"), true],
              ]}
            >
              {RECORDED.map(([d, w, f]) => (
                <tr key={d}>
                  <td className="r num">{d}</td>
                  <td className="r num">{w}</td>
                  <td className="r num">{f}</td>
                </tr>
              ))}
            </Tbl>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default TrialObserve;
