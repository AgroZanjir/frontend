/**
 * Partners.
 *
 * Grouped by what each partner actually does for the chain rather than by
 * prominence: a laboratory and a bank are not competing for the same row.
 */

import { Band, Eyebrow, SiteBtn } from "@/components/site/SiteShell";
import { usePanelT } from "@/lib/panel-format";
import { PARTNERS } from "@/lib/site-data";

const Partners = () => {
  const { t } = usePanelT();

  return (
    <>
      <Band deep>
        <Eyebrow>{t("w_partners")}</Eyebrow>
        <h1 className="d1" style={{ marginTop: 12, maxWidth: "14ch" }}>
          {t("w_pt_t")}
        </h1>
        <p className="hero-lede">{t("w_pt_lede")}</p>
      </Band>

      <section className="band">
        <div className="band-in stack" style={{ gap: 30 }}>
          {PARTNERS.map((group) => (
            <div className="pgroup" key={group.g}>
              <Eyebrow>{t(group.g)}</Eyebrow>
              <div className="logos">
                {group.items.map(([name, role]) => (
                  <div className="logo" key={name}>
                    <div className="nm">{name}</div>
                    <div className="rl">{t(role)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="band soft tight">
        <div className="band-in split">
          <div>
            <h2 className="d2">{t("w_pt_join_t")}</h2>
          </div>
          <div>
            <p className="prose" style={{ marginBottom: 18 }}>
              {t("w_pt_join_p")}
            </p>
            <SiteBtn cls="btn-p" to="/contact" icon="arr">
              {t("w_ct_send")}
            </SiteBtn>
          </div>
        </div>
      </section>
    </>
  );
};

export default Partners;
