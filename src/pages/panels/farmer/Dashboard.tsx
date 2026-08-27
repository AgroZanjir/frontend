/**
 * F1 - producer dashboard.
 *
 * Four numbers the farmer actually asks: what is mine, how much of it is in
 * store, what is pledged against it, and what has settled. Then the two things
 * that need doing today.
 */

import { Link } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import LotRow from "@/components/panel/LotRow";
import {
  Btn,
  PageHead,
  PanelCard,
  Stat,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

/** The farmer's own next actions. Dated, because "soon" is not a plan. */
const TASKS: {
  lvl: "warn" | "info" | "good";
  icon: string;
  date: string;
  key: string;
}[] = [
  { lvl: "warn", icon: "harvest", date: "2026-08-27", key: "f_task_deliver" },
  { lvl: "info", icon: "lab", date: "2026-08-28", key: "f_task_obs" },
  { lvl: "good", icon: "lien", date: "2026-09-05", key: "f_task_repay" },
];

const FarmerDashboard = () => {
  const { LOTS } = usePanelData();
  const { t, nf, mln } = usePanelT();

  const mine = LOTS.filter((l) => l.f === 0);
  const active = mine.filter((l) => ["stored", "reserved"].includes(l.st));
  const volume = active.reduce((s, l) => s + l.net, 0);

  return (
    <>
      <PageHead
        title={t("f_title")}
        sub={t("f_sub")}
        actions={
          <Link to="/farmer/harvest">
            <Btn cls="btn-p" icon="plus">
              {t("f_harv_t")}
            </Btn>
          </Link>
        }
      />

      <div className="grid g4">
        <Stat k={t("f_lots")} v={active.length} d={t("f_lots_d")} acc />
        <Stat
          k={t("f_stored")}
          v={
            <>
              {nf(volume)} <small>{t("kg")}</small>
            </>
          }
          d={t("f_stored_d")}
        />
        <Stat
          k={t("f_credit")}
          v={
            <>
              {mln(168_000_000)} <small>{t("uzs")}</small>
            </>
          }
          d={t("f_credit_d")}
        />
        <Stat
          k={t("f_income")}
          v={
            <>
              {mln(288_000_000)} <small>{t("uzs")}</small>
            </>
          }
          d={t("f_income_d")}
        />
      </div>

      <div
        className="sec grid"
        style={{ gridTemplateColumns: "minmax(0,1.15fr) minmax(0,.85fr)" }}
      >
        <div>
          <div className="sec-h">
            <span className="t-h2">{t("f_mylots")}</span>
          </div>
          <Tbl
            head={[
              [t("n_lots")],
              [t("f_crop")],
              [t("g_est"), true],
              [t("qc_g")],
              [t("b_st")],
              [t("xs_win"), true],
            ]}
          >
            {mine.slice(0, 5).map((l) => (
              <LotRow key={l.c} l={l} />
            ))}
          </Tbl>
        </div>

        <div>
          <div className="sec-h">
            <span className="t-h2">{t("f_next")}</span>
          </div>
          <PanelCard bodyCls="stack">
            {TASKS.map((task) => (
              <div
                key={task.key}
                className="row"
                style={{ alignItems: "flex-start", gap: 10 }}
              >
                <span className={`pill p-${task.lvl}`} style={{ padding: 5 }}>
                  <PanelIcon name={task.icon} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="t-sm" style={{ fontWeight: 600 }}>
                    {t(task.key)}
                  </div>
                  <div className="t-xs muted-2 mono">{task.date}</div>
                </div>
              </div>
            ))}
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default FarmerDashboard;
