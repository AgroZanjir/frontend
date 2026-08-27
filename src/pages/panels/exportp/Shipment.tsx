/**
 * E4 - shipment and document checklist.
 *
 * The set point sits beside the carrier because it is the term that decides
 * whether the cargo arrives: a reefer booked at the wrong temperature is a
 * total loss that no document catches.
 */

import {
  Btn,
  KV,
  Note,
  PageHead,
  PanelCard,
  Pill,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";
import { useNavigate } from "react-router-dom";

const ExportShipment = () => {
  const { DOCS, SHIPMENT } = usePanelData();
  const { t, nf } = usePanelT();
  const navigate = useNavigate();
  const s = SHIPMENT;

  return (
    <>
      <PageHead
        title={
          <>
            {t("sh_title")} ·{" "}
            <span className="mono" style={{ fontSize: 15 }}>
              {s.c}
            </span>
          </>
        }
        actions={
          <Btn
            cls="btn-p"
            icon="cust"
            onClick={() => navigate("/export/customs")}
          >
            {t("cu_send")}
          </Btn>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}
      >
        <PanelCard head={t("xc_ship")} tools={<Pill s={s.st} />}>
          <div className="grid g2">
            <KV
              rows={[
                [t("sh_carrier"), s.carrier],
                [
                  t("sh_mode"),
                  <>
                    {s.mode} · <Tag cls="p-zeroco">reefer</Tag>
                  </>,
                ],
                [t("sh_veh"), <span className="mono">{s.veh}</span>],
                [t("sh_set"), <b>{s.set.toFixed(1)} °C</b>],
              ]}
            />
            <KV
              rows={[
                [t("sh_route"), s.route],
                [t("sh_dep"), <span className="mono">{s.dep}</span>],
                [t("sh_eta"), <span className="mono">{s.eta}</span>],
                [t("sh_dist"), `${nf(s.km)} km`],
              ]}
            />
          </div>

          <div className="hr" />
          <div className="t-label" style={{ marginBottom: 7 }}>
            {t("sh_lots")}
          </div>
          {s.lots.map((x) => (
            <div className="between" key={x.c}>
              <span className="lotid">{x.c}</span>
              <span className="t-sm num">{nf(x.qty)} kg</span>
            </div>
          ))}
        </PanelCard>

        <PanelCard head={t("xc_docs")}>
          <Tbl
            head={[[t("xd_doc")], [t("xd_ref")], [t("xd_exp")], [t("xd_st")]]}
          >
            {DOCS.map((d) => (
              <tr key={d.t}>
                <td>{t(d.n)}</td>
                <td className="mono">
                  {d.ref ?? <span className="muted-2">—</span>}
                </td>
                <td className="mono">
                  {d.exp ?? <span className="muted-2">—</span>}
                </td>
                <td>
                  {d.st === "issued" ? (
                    <Tag cls="p-good">{t("s_issued")}</Tag>
                  ) : (
                    <Tag cls="p-warn">{t("s_pending")}</Tag>
                  )}
                </td>
              </tr>
            ))}
          </Tbl>
          <Note style={{ marginTop: 11 }}>{t("xd_missing")}</Note>
        </PanelCard>
      </div>
    </>
  );
};

export default ExportShipment;
