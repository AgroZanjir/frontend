/**
 * News.
 *
 * The lead story gets the wide treatment and the rest run three across.
 * Dates are written with the month by name - an ISO date is for the database,
 * not for a reader.
 */

import { Link } from "react-router-dom";

import { Band, Eyebrow } from "@/components/site/SiteShell";
import { useMonths } from "@/components/site/produce";
import { usePanelT } from "@/lib/panel-format";
import { NEWS, type NewsItem } from "@/lib/site-data";

/** ISO in, readable out. English puts the month between day and year. */
export const useArticleDate = () => {
  const { lang } = usePanelT();
  const mon = useMonths();
  return (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return lang === "en" ? `${d} ${mon(m)} ${y}` : `${d}-${mon(m)} ${y}`;
  };
};

export const Thumb = ({
  n,
  style,
}: {
  n: NewsItem;
  style?: React.CSSProperties;
}) => (
  <div
    className="nthumb"
    style={{
      background: `linear-gradient(140deg,${n.c[0]},${n.c[1]})`,
      ...style,
    }}
  />
);

const News = () => {
  const { t } = usePanelT();
  const date = useArticleDate();
  const [lead, ...rest] = NEWS;

  return (
    <>
      <Band tight>
        <Eyebrow>{t("w_news")}</Eyebrow>
        <h1 className="d1" style={{ marginTop: 12, maxWidth: "12ch" }}>
          {t("w_nw_t")}
        </h1>
        <p className="lede">{t("w_nw_lede")}</p>
      </Band>

      <Band tight style={{ paddingTop: 0 }}>
        <Link className="narticle lead" to={`/news/${lead.id}`}>
          <Thumb n={lead} />
          <div>
            <div className="nmeta">
              {date(lead.d)} · {t(lead.tag)}
            </div>
            <h3 style={{ fontSize: 27 }}>{t(lead.k)}</h3>
            <p className="lede" style={{ fontSize: "1rem", marginTop: 12 }}>
              {t(`${lead.k}x`)}
            </p>
            <p
              className="t-sm"
              style={{
                color: "var(--primary-ink)",
                fontWeight: 600,
                margin: "14px 0 0",
              }}
            >
              {t("w_more")} →
            </p>
          </div>
        </Link>

        <div className="rule" />

        <div className="news">
          {rest.map((n) => (
            <Link className="narticle" to={`/news/${n.id}`} key={n.id}>
              <Thumb n={n} />
              <div className="nmeta">
                {date(n.d)} · {t(n.tag)}
              </div>
              <h3>{t(n.k)}</h3>
              <p className="t-sm muted">{t(`${n.k}x`)}</p>
            </Link>
          ))}
        </div>
      </Band>
    </>
  );
};

export default News;
