/**
 * The showroom catalogue.
 *
 * Three filters, and the one that matters most is the month: a buyer's first
 * question is not what is grown here but what is available in March. The
 * count line under the filters is there so an empty result reads as a filter
 * outcome rather than an empty catalogue.
 *
 * Filter state lives in the URL, so a filtered catalogue can be sent to
 * someone.
 */

import { useSearchParams } from "react-router-dom";

import { Note } from "@/components/panel/primitives";
import { Band, SiteBtn, Eyebrow } from "@/components/site/SiteShell";
import { ProduceCard, useMonths } from "@/components/site/produce";
import { usePanelT } from "@/lib/panel-format";
import { CERTS, PRODUCE, REGIONS, inSeason } from "@/lib/site-data";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

const Showroom = () => {
  const { t } = usePanelT();
  const mon = useMonths();
  const [params, setParams] = useSearchParams();

  const region = params.get("region") ?? "";
  const cert = params.get("cert") ?? "";
  const month = Number(params.get("month") ?? 0);

  const set = (field: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(field, value);
    else next.delete(field);
    // Replace, not push: filtering is not a place in history a reader wants
    // the back button to walk them through one chip at a time.
    setParams(next, { replace: true });
  };

  const rows = PRODUCE.filter(
    (p) =>
      (!region || p.regions.includes(region)) &&
      (!cert || p.certs.includes(cert)) &&
      (!month || inSeason(p, month)),
  );

  const chips = (
    field: string,
    current: string,
    options: Option[],
    allLabel: string,
  ) => (
    <div className="chips">
      <button
        className={cn("chip", !current && "on")}
        onClick={() => set(field, "")}
      >
        {allLabel}
      </button>
      {options.map((o) => (
        <button
          key={o.value}
          className={cn("chip", current === o.value && "on")}
          onClick={() => set(field, o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Band tight>
        <Eyebrow>{t("w_showroom")}</Eyebrow>
        <h1 className="d1" style={{ marginTop: 12, maxWidth: "14ch" }}>
          {t("w_sr_t")}
        </h1>
        <p className="lede">{t("w_sr_lede")}</p>
      </Band>

      <Band tight style={{ paddingTop: 0 }}>
        <div className="filters">
          <div className="fg">
            <label>{t("w_sr_region")}</label>
            {chips(
              "region",
              region,
              REGIONS.map((r) => ({ value: r, label: r })),
              t("w_sr_all"),
            )}
          </div>
          <div className="fg">
            <label>{t("w_sr_certs")}</label>
            {chips(
              "cert",
              cert,
              CERTS.map((c) => ({ value: c, label: c })),
              t("w_sr_all"),
            )}
          </div>
          <div className="fg">
            <label>{t("w_sr_month")}</label>
            {chips(
              "month",
              month ? String(month) : "",
              Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1),
                label: mon(i + 1),
              })),
              t("w_sr_anytime"),
            )}
          </div>
          <div className="fcount">
            {t("w_sr_count").replace("{n}", String(rows.length))}
          </div>
        </div>

        {rows.length ? (
          <div className="produce">
            {rows.map((p) => (
              <ProduceCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="empty-res">{t("w_sr_empty")}</div>
        )}

        <Note style={{ marginTop: 22 }}>{t("w_sr_note")}</Note>
      </Band>

      <section className="band soft tight">
        <div className="band-in cta-c">
          <h2 className="d3">{t("w_sr_rfq_t")}</h2>
          <p className="lede" style={{ margin: "10px auto 18px" }}>
            {t("w_sr_rfq_p")}
          </p>
          <div className="hero-cta">
            <SiteBtn cls="btn-p" to="/contact" icon="arr">
              {t("w_sr_ask")}
            </SiteBtn>
          </div>
        </div>
      </section>
    </>
  );
};

export default Showroom;
