/**
 * Services.
 *
 * Every link of the chain also works as a service on its own - which is the
 * commercial point, because nobody adopts twelve modules at once. Each card
 * names who it is for, so a reader finds their own row rather than reading
 * all six.
 */

import PanelIcon from "@/components/panel/icons";
import { Tag } from "@/components/panel/primitives";
import { Band, Eyebrow, SiteBtn } from "@/components/site/SiteShell";
import { Steps } from "@/pages/site/Home";
import { usePanelT } from "@/lib/panel-format";
import { SERVICES } from "@/lib/site-data";

const AUDIENCE_ICONS = ["lot", "box", "lien", "ship"];

const Services = () => {
  const { t } = usePanelT();

  return (
    <>
      <Band deep>
        <Eyebrow>{t("w_services")}</Eyebrow>
        <h1 className="d1" style={{ marginTop: 12, maxWidth: "14ch" }}>
          {t("w_sv_t")}
        </h1>
        <p className="hero-lede">{t("w_sv_lede")}</p>
      </Band>

      <Band>
        <div className="svcs">
          {SERVICES.map(([k, d, icon], i) => (
            <div className="svc" key={k}>
              <div className="svc-hd">
                <div className="feat-ic">
                  <PanelIcon name={icon} />
                </div>
                <div>
                  <div className="svc-n">{String(i + 1).padStart(2, "0")}</div>
                  <h3>{t(k)}</h3>
                </div>
              </div>
              <p>{t(d)}</p>
              <div className="who">
                {t(`w_sv${i + 1}_for`)
                  .split("|")
                  .map((x) => (
                    <Tag key={x} cls="p-line">
                      {x.trim()}
                    </Tag>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Band>

      <Band soft>
        <Eyebrow>{t("w_sv_who")}</Eyebrow>
        <h2 className="d2" style={{ margin: "10px 0 8px" }}>
          {t("w_sv_who_t")}
        </h2>
        <p className="lede" style={{ marginBottom: 26 }}>
          {t("w_sv_who_p")}
        </p>
        <div className="feats g4">
          {AUDIENCE_ICONS.map((icon, i) => (
            <div className="feat" key={icon}>
              <div className="feat-ic">
                <PanelIcon name={icon} />
              </div>
              <h3>{t(`w_sv_a${i + 1}`)}</h3>
              <p>{t(`w_sv_a${i + 1}d`)}</p>
            </div>
          ))}
        </div>
      </Band>

      <Band>
        <div className="sechead">
          <Eyebrow>{t("w_how_e")}</Eyebrow>
          <h2 className="d2">{t("w_how_t")}</h2>
        </div>
        <Steps />
      </Band>

      <section className="band deep tight">
        <div className="band-in cta-c">
          <h2 className="d2">{t("w_sv_cta_t")}</h2>
          <p className="hero-lede" style={{ margin: "14px auto 0" }}>
            {t("w_sv_cta_p")}
          </p>
          <div className="hero-cta">
            <SiteBtn cls="btn-light" to="/contact" icon="arr">
              {t("w_ct_send")}
            </SiteBtn>
            <SiteBtn cls="btn-ghost" to="/showroom">
              {t("w_showroom")}
            </SiteBtn>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
