/**
 * The home page.
 *
 * The hero carries a real lot surface rather than an illustration: an
 * identifier, a state, a condition trace. It is faster than a paragraph at
 * saying what this actually is, and it is the same demo lot the operator
 * screens show - the website and the product are not describing two different
 * systems.
 *
 * The twelve-link rail underneath is the whole programme in one line, colour
 * -coded by how far each link is built.
 */

import PanelIcon from "@/components/panel/icons";
import { Spark } from "@/components/panel/charts";
import { Pill } from "@/components/panel/primitives";
import { Band, Eyebrow, SiteBtn } from "@/components/site/SiteShell";
import { ProduceCard } from "@/components/site/produce";
import { usePanelT, daysLeft } from "@/lib/panel-format";
import { useShowcaseLot } from "@/lib/site-api";
import { CHAIN12, PRODUCE } from "@/lib/site-data";

/** The lot's own 24-hour trace, in the ZEROCO band. */
const HERO_TEMPS = [0.9, 0.7, 0.8, 0.6, 0.5, 0.7, 0.6, 0.4, 0.5, 0.6, 0.5, 0.6];

const HeroCard = () => {
  const { t, nf, lang } = usePanelT();
  const l = useShowcaseLot();
  const left = l.sellBy ? daysLeft({ u: l.sellBy } as never) : null;

  return (
    <div className="hero-card">
      <div className="hc-top">
        <div className="hc-id">{l.code}</div>
        <Pill s="stored" />
      </div>

      <div className="hc-rows">
        <div className="hc-r">
          <span>{t("w_hc_prod")}</span>
          <b>{l.productName[lang] ?? l.product}</b>
        </div>
        <div className="hc-r">
          <span>{t("w_hc_zone")}</span>
          <b className="mono">{l.zone}</b>
        </div>
        <div className="hc-r">
          <span>{t("w_hc_qty")}</span>
          <b className="mono">{nf(l.netKg)} kg</b>
        </div>
        <div className="hc-r">
          <span>{t("w_hc_left")}</span>
          <b>{left != null ? `${left} ${t("w_hc_days")}` : "—"}</b>
        </div>
      </div>

      <div className="hc-foot">
        <div className="lb">{t("w_hc_temp")}</div>
        <div className="lb">{l.tempC ?? 0.6} °C</div>
      </div>
      <Spark vals={HERO_TEMPS} color="var(--cold-lift)" />
    </div>
  );
};

const STEPS: [string, string][] = [
  ["w_hw1", "w_hw1d"],
  ["w_hw2", "w_hw2d"],
  ["w_hw3", "w_hw3d"],
  ["w_hw4", "w_hw4d"],
];

export const Steps = () => {
  const { t } = usePanelT();
  return (
    <div className="steps">
      {STEPS.map(([k, d], i) => (
        <div className="step" key={k}>
          <div className="num">{String(i + 1).padStart(2, "0")}</div>
          <h4>{t(k)}</h4>
          <p>{t(d)}</p>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const { t } = usePanelT();

  return (
    <>
      <section className="hero">
        <div className="orbs">
          <i className="orb o1" />
          <i className="orb o2" />
          <i className="orb o3" />
        </div>
        <div className="grain" />

        <div className="hero-in">
          <div className="hero-grid">
            <div>
              <Eyebrow>{t("w_h_badge")}</Eyebrow>
              <h1 className="d1" style={{ marginTop: 20 }}>
                {t("w_h1")}
              </h1>
              <p className="hero-lede">{t("w_hlede")}</p>
              <div className="hero-cta">
                <SiteBtn cls="btn-light" to="/showroom" icon="arr">
                  {t("w_cta1")}
                </SiteBtn>
                <SiteBtn cls="btn-ghost" to="/services">
                  {t("w_cta2")}
                </SiteBtn>
              </div>
            </div>
            <HeroCard />
          </div>

          <div className="chainstrip">
            {CHAIN12.map(([k, state], i) => (
              <div
                key={k}
                className={`cs ${state === 1 ? "live" : state === 2 ? "zero" : ""}`}
                style={{ ["--i" as string]: i }}
              >
                <div className="n">{String(i + 1).padStart(2, "0")}</div>
                <div className="l">{t(k)}</div>
              </div>
            ))}
          </div>

          <div className="chain-key">
            <span>
              <i style={{ background: "var(--acc)" }} />
              {t("w_key_live")}
            </span>
            <span>
              <i style={{ background: "var(--cold)" }} />
              {t("w_key_zero")}
            </span>
            <span>
              <i style={{ background: "var(--deep-3)" }} />
              {t("w_key_next")}
            </span>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="band-in split">
          <div>
            <Eyebrow>{t("w_prob_e")}</Eyebrow>
            <h2 className="d2" style={{ marginTop: 10 }}>
              {t("w_prob_t")}
            </h2>
          </div>
          <div className="prose">
            <p>{t("w_prob_p")}</p>
          </div>
        </div>
      </section>

      <section className="band deep tight">
        <div className="band-in split">
          <div>
            <Eyebrow>{t("w_sol_e")}</Eyebrow>
            <h2
              className="d2"
              style={{ marginTop: 10, color: "var(--on-deep)" }}
            >
              {t("w_sol_t")}
            </h2>
          </div>
          <div className="prose" style={{ color: "var(--on-deep-2)" }}>
            <p>{t("w_sol_p")}</p>
          </div>
        </div>
      </section>

      <Band>
        <div className="sechead">
          <Eyebrow>{t("w_bn_e")}</Eyebrow>
          <h2 className="d2">{t("w_bn_t")}</h2>
          <p className="lede">{t("w_bn_p")}</p>
        </div>

        <div className="bento">
          <div
            className="bcell w4 dark tall"
            style={{ justifyContent: "space-between" }}
          >
            <div className="row" style={{ gap: 12, alignItems: "center" }}>
              <div className="bico">
                <PanelIcon name="lot" />
              </div>
              <div className="blot">
                <i />
                AZ-2026-SMQ-0412
              </div>
            </div>
            <div>
              <div className="bnum">
                1<span className="u">{t("w_bn_lot_u")}</span>
              </div>
              <h3 style={{ marginTop: 14 }}>{t("w_bn_lot")}</h3>
              <p style={{ marginTop: 7, maxWidth: "46ch" }}>{t("w_bn_lotd")}</p>
            </div>
          </div>

          <div className="bcell">
            <div className="bnum">12</div>
            <h3>{t("w_st1")}</h3>
            <p>{t("w_st1d")}</p>
          </div>
          <div className="bcell">
            <div className="bnum">13</div>
            <h3>{t("w_st2")}</h3>
            <p>{t("w_st2d")}</p>
          </div>
          <div className="bcell">
            <div className="bico">
              <PanelIcon name="lien" />
            </div>
            <h3>{t("w_bn_fin")}</h3>
            <p>{t("w_bn_find")}</p>
          </div>
          <div className="bcell">
            <div className="bico">
              <PanelIcon name="cond" />
            </div>
            <h3>{t("w_bn_cond")}</h3>
            <p>{t("w_bn_condd")}</p>
          </div>
          <div className="bcell">
            <div className="bnum">3</div>
            <h3>{t("w_bn_lang_u")}</h3>
            <p>{t("w_st3d")}</p>
          </div>
        </div>
      </Band>

      <Band soft>
        <div className="sechead">
          <Eyebrow>{t("w_how_e")}</Eyebrow>
          <h2 className="d2">{t("w_how_t")}</h2>
        </div>
        <Steps />
      </Band>

      <Band>
        <div
          className="between"
          style={{
            alignItems: "flex-end",
            marginBottom: 22,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <Eyebrow>{t("w_showroom")}</Eyebrow>
            <h2 className="d2" style={{ marginTop: 10 }}>
              {t("w_sr_t")}
            </h2>
          </div>
          <SiteBtn to="/showroom" icon="arr">
            {t("w_all")}
          </SiteBtn>
        </div>
        <div className="produce">
          {PRODUCE.slice(0, 4).map((p) => (
            <ProduceCard key={p.id} p={p} />
          ))}
        </div>
      </Band>

      <section className="band deep">
        <div className="band-in" style={{ textAlign: "center" }}>
          <h2
            className="d2"
            style={{
              color: "var(--on-deep)",
              maxWidth: "20ch",
              margin: "0 auto",
            }}
          >
            {t("w_cta_t")}
          </h2>
          <p className="hero-lede" style={{ margin: "14px auto 0" }}>
            {t("w_cta_p")}
          </p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <SiteBtn cls="btn-light" to="/contact" icon="arr">
              {t("w_ct_send")}
            </SiteBtn>
            <SiteBtn cls="btn-ghost" to="/partners">
              {t("w_partners")}
            </SiteBtn>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
