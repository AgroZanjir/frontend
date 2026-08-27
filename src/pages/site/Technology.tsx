/**
 * ZEROCO technology.
 *
 * The most load-bearing page on the site, and the one most able to mislead,
 * so it is built to be honest first: the description is attributed, the
 * charts are drawn entirely dashed with `observed: 0` because not one point
 * has been measured, and the caption says so in words as well.
 *
 * The decision criterion at the bottom is the actual argument. ZEROCO is not
 * scaled because it stores for longer; it is scaled where the value of the
 * extra sales beats what it costs to run.
 */

import PanelIcon from "@/components/panel/icons";
import { LineChart, TrialLegend } from "@/components/panel/charts";
import { Note, PanelCard } from "@/components/panel/primitives";
import { Band, Eyebrow } from "@/components/site/SiteShell";
import { usePanelT } from "@/lib/panel-format";
import { useShowcaseTrial } from "@/lib/site-api";

const KPI_ICONS = ["cond", "weigh", "grade", "qc", "box", "port"];

const Technology = () => {
  const trial = useShowcaseTrial();
  const { t } = usePanelT();

  return (
    <>
      <Band deep>
        <Eyebrow>{t("w_tech")}</Eyebrow>
        <h1 className="d1" style={{ marginTop: 12, maxWidth: "16ch" }}>
          {t("w_tc_t")}
        </h1>
        <p className="hero-lede">{t("w_tc_lede")}</p>
      </Band>

      <section className="band">
        <div className="band-in split">
          <div>
            <h2 className="d2">{t("w_tc_how_t")}</h2>
          </div>
          <div className="prose">
            <p>{t("w_tc_how_p")}</p>
          </div>
        </div>
      </section>

      <section className="band soft">
        <div className="band-in split">
          <div>
            <h2 className="d2">{t("w_tc_pilot_t")}</h2>
          </div>
          <div className="prose">
            <p>{t("w_tc_pilot_p")}</p>
            <div className="quote" style={{ marginTop: 20 }}>
              {t("w_tc_gate_p")}
            </div>
          </div>
        </div>
      </section>

      <Band soft>
        <Eyebrow>{t("w_tc_ch_e")}</Eyebrow>
        <h2 className="d2" style={{ margin: "10px 0 8px" }}>
          {t("w_tc_ch_t")}
        </h2>
        <p className="lede" style={{ marginBottom: 24 }}>
          {t("w_tc_ch_p")}
        </p>

        <div className="feats g2">
          {(
            [
              ["loss", "w_tc_ch_loss"],
              ["waste", "w_tc_ch_waste"],
            ] as const
          ).map(([metric, label]) => (
            <PanelCard key={metric} head={t(label)}>
              {/* observed: 0 - every segment past day zero is dashed,
                  because the pilot has not measured any of it yet. */}
              <LineChart
                xs={trial.days}
                sa={trial.zeroco[metric] ?? []}
                sb={trial.control[metric] ?? []}
                zero
                observed={0}
                aria={t(label)}
              />
              <TrialLegend />
            </PanelCard>
          ))}
        </div>

        <Note style={{ marginTop: 20 }}>{t("w_tc_ch_cap")}</Note>
      </Band>

      <Band>
        <h2 className="d2" style={{ marginBottom: 24 }}>
          {t("w_tc_kpi_t")}
        </h2>
        <div className="feats">
          {KPI_ICONS.map((icon, i) => (
            <div className="feat" key={icon}>
              <div className="feat-ic">
                <PanelIcon name={icon} />
              </div>
              <h3>{t(`w_tc_k${i + 1}`)}</h3>
            </div>
          ))}
        </div>
        <Note style={{ marginTop: 26 }}>{t("w_tc_disc")}</Note>
      </Band>
    </>
  );
};

export default Technology;
