/**
 * E5 - customs handoff.
 *
 * Everything on the declaration is already in the platform - the HS code from
 * the product, the origin from the farm, the value from the contract. That is
 * the argument the screen makes: the broker is not re-keying a declaration,
 * they are checking one.
 */

import PanelIcon from "@/components/panel/icons";
import {
  Btn,
  KV,
  Note,
  PageHead,
  PanelCard,
  Tag,
} from "@/components/panel/primitives";
import { FLAG } from "@/pages/panels/exportp/Dashboard";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

/** The five documents customs needs before a declaration can be lodged. */
const REQUIRED = ["phyto", "origin", "invoice", "packing", "lab"];

const ExportCustoms = () => {
  const { DOCS, EXPORTS, FARMS, PRODUCTS, findLot } = usePanelData();
  const { t, nf, pn } = usePanelT();
  const x = EXPORTS[0];
  const l = findLot("AZ-2026-SMQ-0408");
  const required = DOCS.filter((d) => REQUIRED.includes(d.t));

  return (
    <>
      <PageHead
        title={t("cu_title")}
        sub={t("cu_sub")}
        actions={
          <Btn cls="btn-p" icon="arr">
            {t("cu_send")}
          </Btn>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,330px)" }}
      >
        <PanelCard>
          <div className="t-label" style={{ marginBottom: 11 }}>
            {t("cu_decl")}
          </div>
          <div className="grid g2" style={{ gap: 13 }}>
            <KV
              rows={[
                [t("cu_hs"), <span className="mono">{PRODUCTS[x.p].hs}</span>],
                [t("f_crop"), `${pn(x.p)} · ${PRODUCTS[x.p].v}`],
                [t("x_qty"), `${nf(x.qty)} kg`],
                [t("g_farm"), FARMS[l.f].n],
              ]}
            />
            <KV
              rows={[
                [t("x_country"), `${FLAG[x.country]} ${x.country}`],
                [t("x_inc"), <span className="mono">{x.inc}</span>],
                [t("x_val"), `$${nf(x.val)}`],
                [t("pp_origin"), `UZ · ${FARMS[l.f].r}`],
              ]}
            />
          </div>

          <div className="hr" />
          <div className="t-label" style={{ marginBottom: 9 }}>
            {t("xc_docs")}
          </div>
          <div className="grid g2" style={{ gap: 7 }}>
            {required.map((d) => (
              <div className="row" style={{ gap: 8 }} key={d.t}>
                <span style={{ color: "var(--good)", flex: "none" }}>
                  <PanelIcon name="check" />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="t-sm">{t(d.n)}</div>
                  <div className="t-xs muted-2 mono">{d.ref}</div>
                </div>
              </div>
            ))}
          </div>

          <Note style={{ marginTop: 14 }}>{t("cu_note")}</Note>
        </PanelCard>

        <div className="stack">
          <PanelCard>
            <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
              <span className="pill p-good" style={{ padding: 7 }}>
                <PanelIcon name="check" />
              </span>
              <div>
                <div className="t-h3">{t("cu_ready")}</div>
                <div className="t-xs muted-2" style={{ marginTop: 2 }}>
                  {required.length} / {REQUIRED.length}{" "}
                  {t("xc_docs").toLowerCase()}
                </div>
              </div>
            </div>
          </PanelCard>

          <PanelCard head={t("cu_decl")}>
            <div className="stack" style={{ gap: 8 }}>
              <div className="between">
                <span className="t-sm">Single Window</span>
                <Tag cls="p-good">{t("cu_ready")}</Tag>
              </div>
              <div className="between">
                <span className="t-sm">{t("n_cust")}</span>
                <Tag cls="p-warn">{t("s_pending")}</Tag>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default ExportCustoms;
