/**
 * Careers.
 */

import PanelIcon from "@/components/panel/icons";
import { Band, Eyebrow, SiteBtn } from "@/components/site/SiteShell";
import { usePanelT } from "@/lib/panel-format";
import { JOBS } from "@/lib/site-data";

const WHY_ICONS = ["box", "apps", "pub"];

const Careers = () => {
  const { t } = usePanelT();

  return (
    <>
      <Band deep>
        <Eyebrow>{t("w_careers")}</Eyebrow>
        <h1 className="d1" style={{ marginTop: 12, maxWidth: "14ch" }}>
          {t("w_cr_t")}
        </h1>
        <p className="hero-lede">{t("w_cr_lede")}</p>
      </Band>

      <Band>
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          {t("w_cr_open")}
        </div>
        <div className="jobs">
          {JOBS.map((j) => (
            <div className="job" key={j.k}>
              <div>
                <h4>{t(j.k)}</h4>
                <div className="jm">
                  {t(j.team)} · {j.loc} · {t(j.type)}
                </div>
              </div>
              <SiteBtn sm to="/contact">
                {t("w_cr_apply")}
              </SiteBtn>
            </div>
          ))}
        </div>
      </Band>

      <Band soft>
        <h2 className="d2" style={{ marginBottom: 26 }}>
          {t("w_cr_why_t")}
        </h2>
        <div className="feats">
          {WHY_ICONS.map((icon, i) => (
            <div className="feat" key={icon}>
              <div className="feat-ic">
                <PanelIcon name={icon} />
              </div>
              <h3>{t(`w_cr_why${i + 1}`)}</h3>
              <p>{t(`w_cr_why${i + 1}d`)}</p>
            </div>
          ))}
        </div>
      </Band>
    </>
  );
};

export default Careers;
