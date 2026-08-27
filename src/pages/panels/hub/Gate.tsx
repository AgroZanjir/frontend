/**
 * H2 - the arrival queue at the gate.
 *
 * Declared harvests become a schedule here. The row already being weighed
 * keeps the primary button; the rest wait their turn.
 */

import { useNavigate } from "react-router-dom";

import { Btn, PageHead, Pill, Tbl } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const HubGate = () => {
  const { ARRIVALS, FARMS } = usePanelData();
  const { t, nf, pn } = usePanelT();
  const navigate = useNavigate();

  return (
    <>
      <PageHead
        title={t("g_title")}
        sub={t("g_sub")}
        actions={
          <Btn cls="btn-p" icon="plus" onClick={() => navigate("/hub/weigh")}>
            {t("g_start")}
          </Btn>
        }
      />
      <Tbl
        min={840}
        head={[
          [t("g_time")],
          [t("g_veh")],
          [t("g_farm")],
          [t("g_prod")],
          [t("g_est"), true],
          [t("b_st")],
          [t("g_act")],
        ]}
      >
        {ARRIVALS.map((a) => (
          <tr
            key={a.v}
            className="click"
            onClick={() => navigate("/hub/weigh")}
          >
            <td className="mono">{a.t}</td>
            <td className="mono">{a.v}</td>
            <td>{FARMS[a.farm].n}</td>
            <td>{pn(a.p)}</td>
            <td className="r">
              {nf(a.est)} {t("kg")}
            </td>
            <td>
              <Pill s={a.st} />
            </td>
            <td>
              {/* Every row is a vehicle standing outside. Taking one to the
                  weighbridge is the next thing that happens to it, so the
                  button goes there rather than doing nothing. */}
              <Btn
                sm
                cls={a.st === "weighing" ? "btn-p" : undefined}
                onClick={() => navigate("/hub/weigh")}
              >
                {t("g_weigh")}
              </Btn>
            </td>
          </tr>
        ))}
      </Tbl>
    </>
  );
};

export default HubGate;
