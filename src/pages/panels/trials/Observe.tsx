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
import { usePanelT } from "@/lib/panel-format";

/** Observations already recorded for this arm. */
const RECORDED: [number, string, string][] = [
  [0, "4 200", "8.4"],
  [7, "4 171", "8.3"],
  [14, "4 141", "8.1"],
];

const TrialObserve = () => {
  const { t } = usePanelT();

  return (
    <>
      <PageHead title={t("o_title")} sub={t("o_sub")} />

      <div className="row" style={{ gap: 26, alignItems: "flex-start" }}>
        <div className="phone">
          <div className="phone-top">09:41</div>
          <div className="phone-b">
            <div className="row" style={{ gap: 7 }}>
              <Tag cls="p-zeroco">TR-MELON-01</Tag>
              <Tag cls="p-line">{t("t_armz")}</Tag>
            </div>
            <div className="lotid" style={{ fontSize: 13 }}>
              AZ-2026-SMQ-0412
            </div>

            <PanelCard bodyCls="stack" bodyStyle={{ gap: 11, padding: 13 }}>
              <Field label={t("o_dayidx")}>
                <input className="inp big" defaultValue="14" readOnly />
              </Field>
              <Field label={`${t("o_weight")} (kg)`} required>
                <input className="inp big" defaultValue="4 141" />
              </Field>
              <Field label={`${t("o_waste")} (kg)`}>
                <input className="inp" defaultValue="17" />
              </Field>
              <Field label={`${t("t_firm")} (N)`}>
                <input className="inp" defaultValue="8.1" />
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
