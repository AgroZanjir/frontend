/**
 * E3 - one export contract.
 *
 * Terms on the left, documents on the right, and the missing one called out as
 * a warning rather than left as an unticked row someone has to notice.
 */

import { useNavigate } from "react-router-dom";

import { FLAG } from "@/pages/panels/exportp/Dashboard";
import {
  AlertBox,
  Btn,
  KV,
  PageHead,
  PanelCard,
  Pill,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT, daysLeft } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const ExportContract = () => {
  const { DOCS, EXPORTS, PRODUCTS, findLot } = usePanelData();
  const { t, nf, pn } = usePanelT();
  const navigate = useNavigate();

  const x = EXPORTS[0];
  const l = findLot("AZ-2026-SMQ-0408");

  return (
    <>
      <PageHead
        title={
          <>
            {t("xc_title")} ·{" "}
            <span className="mono" style={{ fontSize: 15 }}>
              {x.c}
            </span>
          </>
        }
        actions={
          <>
            <Btn icon="print">{t("print")}</Btn>
            <Btn
              cls="btn-p"
              icon="ship"
              onClick={() => navigate("/export/shipment")}
            >
              {t("n_ship")}
            </Btn>
          </>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,320px)" }}
      >
        <div className="stack">
          <PanelCard head={t("xc_terms")}>
            <div className="grid g2">
              <KV
                rows={[
                  [t("x_buyer"), x.buyer],
                  [t("x_country"), `${FLAG[x.country]} ${x.country}`],
                  [t("f_crop"), `${pn(x.p)} · ${PRODUCTS[x.p].v}`],
                  [t("x_qty"), `${nf(x.qty)} kg`],
                ]}
              />
              <KV
                rows={[
                  [t("x_inc"), <span className="mono">{x.inc}</span>],
                  [t("x_pay"), t(`pay_${x.pay}`)],
                  [t("x_val"), <b>${nf(x.val)}</b>],
                  [t("x_st"), <Pill s={x.st} />],
                ]}
              />
            </div>
          </PanelCard>

          <div>
            <div className="sec-h">
              <span className="t-h2">{t("xc_lots")}</span>
            </div>
            <Tbl
              head={[
                [t("n_lots")],
                [t("f_crop")],
                [t("xs_grade")],
                [t("pl_zone")],
                [t("g_est"), true],
                [t("xs_win"), true],
              ]}
            >
              <tr className="click" onClick={() => navigate("/export/lot")}>
                <td>
                  <span className="lotid">{l.c}</span>
                </td>
                <td>{pn(l.p)}</td>
                <td>
                  <Tag cls="p-good">{l.g}</Tag>
                </td>
                <td>
                  <span className="mono">{l.z}</span>{" "}
                  <Tag cls="p-zeroco">ZEROCO</Tag>
                </td>
                <td className="r">{nf(l.net)} kg</td>
                <td className="r">
                  {daysLeft(l)} {t("days")}
                </td>
              </tr>
            </Tbl>
          </div>
        </div>

        <div className="stack">
          <PanelCard head={t("xc_docs")}>
            <div className="stack" style={{ gap: 7 }}>
              {DOCS.map((d) => (
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
          <AlertBox
            lvl="warn"
            title={`${t("xd_doc")} · CMR`}
            desc={t("xd_missing")}
          />
        </div>
      </div>
    </>
  );
};

export default ExportContract;
