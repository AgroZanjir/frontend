/**
 * E1 - exporter dashboard.
 *
 * Contracts, volume and value, and the one document still missing - because a
 * shipment held at the border for a missing CMR costs more than any of the
 * other three numbers.
 */

import { useNavigate } from "react-router-dom";

import { Spark } from "@/components/panel/charts";
import {
  Btn,
  PageHead,
  PanelCard,
  Pill,
  Stat,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

/** Destination flags, by ISO country code. */
export const FLAG: Record<string, string> = { KZ: "🇰🇿", LV: "🇱🇻", AE: "🇦🇪" };

const ExportDashboard = () => {
  const { DOCS, EXPORTS, SHIPMENT } = usePanelData();
  const { t, nf, pn } = usePanelT();
  const navigate = useNavigate();

  const val = EXPORTS.reduce((s, x) => s + x.val, 0);

  return (
    <>
      <PageHead
        title={t("x_title")}
        sub={t("x_sub")}
        actions={
          <Btn
            cls="btn-p"
            icon="source"
            onClick={() => navigate("/export/sourcing")}
          >
            {t("xs_title")}
          </Btn>
        }
      />

      <div className="grid g4">
        <Stat
          k={t("x_contracts")}
          v={EXPORTS.length}
          d={t("x_contracts_d")}
          acc
        />
        <Stat
          k={t("x_volume")}
          v={
            <>
              {nf(35.6)} <small>{t("t")}</small>
            </>
          }
          d={t("x_volume_d")}
        />
        <Stat k={t("x_value")} v={`$${nf(val)}`} d={t("x_value_d")} />
        <Stat k={t("x_docs")} v={1} d={t("x_docs_d")} color="var(--warn)" />
      </div>

      <div className="sec">
        <div className="sec-h">
          <span className="t-h2">{t("x_list")}</span>
        </div>
        <Tbl
          min={940}
          head={[
            [t("b_ref")],
            [t("x_buyer")],
            [t("x_country")],
            [t("f_crop")],
            [t("x_qty"), true],
            [t("x_inc")],
            [t("x_pay")],
            [t("x_val"), true],
            [t("x_st")],
          ]}
        >
          {EXPORTS.map((x) => (
            <tr
              key={x.c}
              className="click"
              onClick={() => navigate("/export/contract")}
            >
              <td>
                <span className="lotid">{x.c}</span>
              </td>
              <td>{x.buyer}</td>
              <td>
                {FLAG[x.country]} {x.country}
              </td>
              <td>{pn(x.p)}</td>
              <td className="r">{nf(x.qty)} kg</td>
              <td className="mono">{x.inc}</td>
              <td>{t(`pay_${x.pay}`)}</td>
              <td className="r">${nf(x.val)}</td>
              <td>
                <Pill s={x.st} />
              </td>
            </tr>
          ))}
        </Tbl>
      </div>

      <div className="sec grid g2">
        <PanelCard head={t("xc_docs")}>
          <div className="stack" style={{ gap: 9 }}>
            {DOCS.slice(0, 4).map((d) => (
              <div className="between" key={d.t}>
                <span className="t-sm">{t(d.n)}</span>
                {d.st === "issued" ? (
                  <Tag cls="p-good">{t("s_issued")}</Tag>
                ) : (
                  <Tag cls="p-warn">{t("s_pending")}</Tag>
                )}
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard head={t("tr_title")}>
          <Spark
            vals={SHIPMENT.temps}
            color="var(--s-zeroco)"
            thr={SHIPMENT.set + 2}
          />
          <div className="between t-xs muted-2" style={{ marginTop: 4 }}>
            <span>{SHIPMENT.route}</span>
            <span className="mono">{SHIPMENT.c}</span>
          </div>
        </PanelCard>
      </div>
    </>
  );
};

export default ExportDashboard;
