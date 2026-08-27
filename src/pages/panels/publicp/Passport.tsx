/**
 * P2 - the public passport.
 *
 * The same lot as the operator's passport, with everything commercial removed:
 * no value, no lien, no buyer, no QC measurements. What is left is origin,
 * handling and the chain of events - what a buyer or a consumer is entitled to
 * check, and nothing that belongs to the farmer's counterparties.
 *
 * The stripping is the API's, not this screen's. A public page that fetches
 * the private record and hides half of it in the browser has not hidden
 * anything at all.
 */

import { useSearchParams } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import { KV, Note, PanelCard, Qr, Tag } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { SAMPLE_LOT, usePublicPassport } from "@/lib/public-api";

const PublicPassport = () => {
  const { t, nf, lang } = usePanelT();
  const [params] = useSearchParams();
  const code = params.get("lot") || SAMPLE_LOT;
  const { passport, loading, notFound, failed } = usePublicPassport(code);

  if (loading) {
    return (
      <div
        style={{ maxWidth: 660, margin: "40px auto" }}
        className="t-sm muted"
      >
        {t("loading")}
      </div>
    );
  }

  if (notFound || !passport) {
    return (
      <div style={{ maxWidth: 660, margin: "40px auto" }}>
        <div className="alert a-warn">
          <div className="at">{notFound ? t("pu_none") : t("err_load")}</div>
          <div className="ad">
            {notFound ? <span className="mono">{code}</span> : t("err_generic")}
          </div>
        </div>
      </div>
    );
  }

  const { lot, origin, zone, events, qc } = passport;
  // The catalogue is not loaded here - the public panel has no session - so
  // the name comes with the record.
  const name = passport.product?.[`name_${lang}` as const] ?? lot.product;
  const failedNote = failed ? <Note>{t("err_generic")}</Note> : null;

  return (
    <div style={{ maxWidth: 660, margin: "14px auto" }}>
      <PanelCard>
        <div
          className="between"
          style={{ alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}
        >
          <div>
            <div className="row" style={{ gap: 7, marginBottom: 7 }}>
              <span className="pill p-good">
                <PanelIcon name="check" />
                {t("pp_verified")}
              </span>
              {lot.storage_mode === "zeroco" && (
                <Tag cls="p-zeroco">ZEROCO</Tag>
              )}
            </div>
            <div className="t-display">{name}</div>
            <div className="t-sm muted">
              {passport.product?.variety
                ? `${passport.product.variety} · `
                : ""}
              {nf(Math.round(lot.net_weight_g / 1000))} kg · Grade {lot.grade}
            </div>
            <div className="mono t-xs muted-2" style={{ marginTop: 6 }}>
              {lot.code}
            </div>
          </div>
          <Qr seed={lot.code} px={92} />
        </div>
      </PanelCard>

      <div className="grid g2" style={{ marginTop: 12 }}>
        <PanelCard head={t("pp_origin")}>
          <KV
            rows={[
              [t("pp_farm"), origin?.name ?? "—"],
              [
                t("pp_region"),
                origin ? `${origin.district}, ${origin.region}` : "—",
              ],
              [t("pp_harv"), lot.harvested_on ?? "—"],
              [
                t("pp_certs"),
                origin?.certifications.length ? (
                  <span className="chipset">
                    {origin.certifications.map((c) => (
                      <Tag key={c} cls="p-good">
                        {c}
                      </Tag>
                    ))}
                  </span>
                ) : (
                  <Tag cls="p-line">{t("none")}</Tag>
                ),
              ],
            ]}
          />
        </PanelCard>

        <PanelCard head={t("pp_store")}>
          <KV
            rows={[
              [
                t("pp_store"),
                zone
                  ? `${t(`m_${zone.mode}`)} · ${zone.temp_c} °C / ${zone.rh_pct}% RH`
                  : "—",
              ],
              [t("pl_place"), (lot.placed_at ?? "").slice(0, 10) || "—"],
              [t("pp_qc"), `${qc.length} ${t("pp_checks")}`],
              [t("qc_g"), `Grade ${lot.grade}`],
            ]}
          />
        </PanelCard>
      </div>

      <div className="sec">
        <PanelCard head={t("pp_chain")}>
          <div className="tl">
            {events.map((e) => (
              <div className="tl-row" key={`${e.type}-${e.occurred_at}`}>
                <div
                  className={`tl-dot ${e.severity === "accept" ? "acc" : ""}`}
                >
                  <PanelIcon name="check" className="" />
                </div>
                <div>
                  <div className="tl-t">
                    {t(`ev_${e.type}`)}
                    <span className="tl-w">{e.occurred_at.slice(0, 10)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="t-xs muted-2" style={{ margin: "11px 0 0" }}>
            {t("pu_trust")}
          </p>
        </PanelCard>
        {failedNote}
      </div>
    </div>
  );
};

export default PublicPassport;
