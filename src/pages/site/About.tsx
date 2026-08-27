/**
 * About.
 *
 * The governance section names committees, not executives. The programme is
 * run by the participating organisations, and inventing officers for a real
 * body would misrepresent it.
 */

import PanelIcon from "@/components/panel/icons";
import { Note } from "@/components/panel/primitives";
import { Band, Eyebrow, SiteBtn } from "@/components/site/SiteShell";
import { usePanelT } from "@/lib/panel-format";
import { GOVERNANCE } from "@/lib/site-data";

const PRINCIPLE_ICONS = ["check", "flask", "box", "port", "lien", "lot"];

const About = () => {
  const { t } = usePanelT();

  return (
    <>
      <Band deep>
        <Eyebrow>{t("w_about")}</Eyebrow>
        <h1 className="d1" style={{ marginTop: 12, maxWidth: "16ch" }}>
          {t("w_ab_t")}
        </h1>
        <p className="hero-lede">{t("w_ab_lede")}</p>
      </Band>

      <section className="band">
        <div className="band-in split">
          <div>
            <Eyebrow>{t("w_ab_mis_e")}</Eyebrow>
            <h2 className="d2" style={{ marginTop: 10 }}>
              {t("w_ab_mis_t")}
            </h2>
          </div>
          <div className="prose">
            <p>{t("w_ab_mis_p1")}</p>
            <p>{t("w_ab_mis_p2")}</p>
          </div>
        </div>
      </section>

      <Band soft>
        <Eyebrow>{t("w_ab_prin_e")}</Eyebrow>
        <h2 className="d2" style={{ margin: "10px 0 26px" }}>
          {t("w_ab_prin_t")}
        </h2>
        <div className="feats">
          {PRINCIPLE_ICONS.map((icon, i) => (
            <div className="feat" key={icon}>
              <div className="feat-ic">
                <PanelIcon name={icon} />
              </div>
              <h3>{t(`w_ab_pr${i + 1}`)}</h3>
              <p>{t(`w_ab_pr${i + 1}d`)}</p>
            </div>
          ))}
        </div>
      </Band>

      <Band>
        <Eyebrow>{t("w_ab_gov_e")}</Eyebrow>
        <h2 className="d2" style={{ margin: "10px 0 8px" }}>
          {t("w_ab_gov_t")}
        </h2>
        <p className="lede" style={{ marginBottom: 24 }}>
          {t("w_ab_gov_p")}
        </p>
        <div className="steps">
          {GOVERNANCE.map(([k, d], i) => (
            <div className="step" key={k}>
              <div className="num">{String(i + 1).padStart(2, "0")}</div>
              <h4>{t(k)}</h4>
              <p>{t(d)}</p>
            </div>
          ))}
        </div>
        <Note style={{ marginTop: 24 }}>{t("w_ab_note")}</Note>
      </Band>

      <section className="band deep tight">
        <div className="band-in cta-c">
          <h2 className="d2">{t("w_ab_cta_t")}</h2>
          <p className="hero-lede" style={{ margin: "14px auto 0" }}>
            {t("w_ab_cta_p")}
          </p>
          <div className="hero-cta">
            <SiteBtn cls="btn-light" to="/careers" icon="arr">
              {t("w_careers")}
            </SiteBtn>
            <SiteBtn cls="btn-ghost" to="/contact">
              {t("w_contact")}
            </SiteBtn>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
