/**
 * One news article.
 *
 * Narrow measure, no sidebar: the only job here is to be read.
 */

import { Link, useParams } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import { Band, SiteBtn } from "@/components/site/SiteShell";
import { Thumb, useArticleDate } from "@/pages/site/News";
import { usePanelT } from "@/lib/panel-format";
import { NEWS, findArticle } from "@/lib/site-data";
import NotFound from "@/pages/NotFound";

const Article = () => {
  const { t } = usePanelT();
  const date = useArticleDate();
  const { id } = useParams<{ id: string }>();
  const n = id ? findArticle(id) : undefined;

  if (!n) return <NotFound />;

  return (
    <>
      <section className="band tight">
        <div className="band-in" style={{ maxWidth: 760 }}>
          <SiteBtn cls="btn-q" sm to="/news" style={{ marginBottom: 16 }}>
            <PanelIcon name="back" />
            {t("w_back")}
          </SiteBtn>

          <div className="nmeta">
            {date(n.d)} · {t(n.tag)}
          </div>
          <h1 className="d2" style={{ marginTop: 10 }}>
            {t(n.k)}
          </h1>

          <Thumb n={n} style={{ margin: "24px 0", aspectRatio: "21/9" }} />

          <div className="prose">
            <p>
              <strong>{t(`${n.k}x`)}</strong>
            </p>
            <p>{t(`w_${n.id}a`)}</p>
            <p>{t(`w_${n.id}b`)}</p>
          </div>

          <div className="rule" />

          <div className="row" style={{ gap: 8 }}>
            <SiteBtn sm>{t("w_nw_share")}</SiteBtn>
            <SiteBtn sm cls="btn-q" to="/news" icon="arr">
              {t("w_nw_related")}
            </SiteBtn>
          </div>
        </div>
      </section>

      <Band soft tight>
        <h2 className="d3" style={{ marginBottom: 18 }}>
          {t("w_nw_related")}
        </h2>
        <div className="news">
          {NEWS.filter((x) => x.id !== n.id)
            .slice(0, 3)
            .map((x) => (
              <Link className="narticle" to={`/news/${x.id}`} key={x.id}>
                <Thumb n={x} />
                <div className="nmeta">
                  {date(x.d)} · {t(x.tag)}
                </div>
                <h3>{t(x.k)}</h3>
              </Link>
            ))}
        </div>
      </Band>
    </>
  );
};

export default Article;
