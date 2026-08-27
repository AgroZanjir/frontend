/**
 * One produce listing.
 *
 * The right column answers a buyer's questions in the order they ask them:
 * where from, what grade, how much, what code, what certification, and then
 * the season band. The section below says what travels with the goods -
 * because on this platform the paperwork is not assembled afterwards.
 */

import { useParams } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import { Note, Tag } from "@/components/panel/primitives";
import { Band, Eyebrow, SiteBtn } from "@/components/site/SiteShell";
import { PShot, ProduceCard, SeasonCalendar } from "@/components/site/produce";
import { usePanelT } from "@/lib/panel-format";
import { PRODUCE, findProduce } from "@/lib/site-data";
import NotFound from "@/pages/NotFound";

const DOC_ICONS = ["lot", "flask", "cond", "ship"];

const Product = () => {
  const { t } = usePanelT();
  const { id } = useParams<{ id: string }>();
  const p = id ? findProduce(id) : undefined;

  if (!p) return <NotFound />;

  return (
    <>
      <Band tight>
        <SiteBtn cls="btn-q" sm to="/showroom" style={{ marginBottom: 16 }}>
          <PanelIcon name="back" />
          {t("w_back")}
        </SiteBtn>

        <div className="split" style={{ gap: 34 }}>
          <div
            style={{
              borderRadius: "var(--rw)",
              overflow: "hidden",
              border: "1px solid var(--hair)",
            }}
          >
            <PShot p={p} big />
          </div>

          <div>
            <Eyebrow>{p.v}</Eyebrow>
            <h1 className="d2" style={{ marginTop: 8 }}>
              {t(p.k)}
            </h1>
            <div className="rule" style={{ margin: "20px 0" }} />

            <dl className="kv" style={{ fontSize: "13.5px", gap: "11px 20px" }}>
              <dt>{t("w_sr_region")}</dt>
              <dd>{p.regions.join(", ")}</dd>
              <dt>{t("w_sr_grade")}</dt>
              <dd>{p.grades}</dd>
              <dt>{t("w_sr_vol")}</dt>
              <dd className="mono">
                {p.vol} {t("w_sr_t_kg")}
              </dd>
              <dt>{t("w_sr_hs")}</dt>
              <dd className="mono">{p.hs}</dd>
              <dt>{t("w_sr_certs")}</dt>
              <dd>
                {p.certs.length ? (
                  p.certs.map((c) => (
                    <Tag key={c} cls="p-good">
                      {c}
                    </Tag>
                  ))
                ) : (
                  <Tag cls="p-line">{t("w_sr_none")}</Tag>
                )}
              </dd>
            </dl>

            <div style={{ marginTop: 20 }}>
              <div className="eyebrow" style={{ color: "var(--ink-3)" }}>
                {t("w_sr_season")}
              </div>
              <SeasonCalendar p={p} />
            </div>

            <div className="row" style={{ gap: 9, marginTop: 24 }}>
              <SiteBtn cls="btn-p" to="/contact" icon="arr">
                {t("w_sr_ask")}
              </SiteBtn>
              <SiteBtn to="/public">
                <PanelIcon name="lookup" />
                {t("w_sr_trace")}
              </SiteBtn>
            </div>

            <Note style={{ marginTop: 20 }}>{t("w_sr_note")}</Note>
          </div>
        </div>
      </Band>

      <Band soft>
        <Eyebrow>{t("w_sr_doc_e")}</Eyebrow>
        <h2 className="d2" style={{ margin: "10px 0 8px" }}>
          {t("w_sr_doc_t")}
        </h2>
        <p className="lede" style={{ marginBottom: 26 }}>
          {t("w_sr_doc_p")}
        </p>
        <div className="feats g4">
          {DOC_ICONS.map((icon, i) => (
            <div className="feat" key={icon}>
              <div className="feat-ic">
                <PanelIcon name={icon} />
              </div>
              <h3>{t(`w_sr_d${i + 1}`)}</h3>
              <p>{t(`w_sr_d${i + 1}d`)}</p>
            </div>
          ))}
        </div>
      </Band>

      <Band tight>
        <h2 className="d3" style={{ marginBottom: 18 }}>
          {t("w_sr_more")}
        </h2>
        <div className="produce">
          {PRODUCE.filter((x) => x.id !== p.id)
            .slice(0, 4)
            .map((x) => (
              <ProduceCard key={x.id} p={x} />
            ))}
        </div>
      </Band>
    </>
  );
};

export default Product;
