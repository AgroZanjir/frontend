/**
 * H1 - hub operations.
 *
 * The floor manager's morning: what came in, what is waiting on QC, how full
 * the rooms are, and what is going wrong right now. The alert column is not
 * decoration - an excursion at 02:40 is worth more than any of the four
 * numbers above it, which is why it keeps its own column rather than becoming
 * a badge.
 */

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import ZoneCard from "@/components/panel/ZoneCard";
import {
  AlertBox,
  Btn,
  PageHead,
  Stat,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT, daysLeft, storageAge } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const HubOps = () => {
  const { LOTS, ZONES, findZone } = usePanelData();
  const { t, nf, pn } = usePanelT();
  const navigate = useNavigate();

  const inStore = LOTS.filter((l) => l.z);
  const cap = ZONES.reduce((s, z) => s + z.cap, 0);
  const used = ZONES.reduce((s, z) => s + z.used, 0);

  return (
    <>
      <PageHead
        title={t("h_title")}
        sub={t("h_sub")}
        actions={
          <Link to="/hub/gate">
            <Btn cls="btn-p" icon="plus">
              {t("g_start")}
            </Btn>
          </Link>
        }
      />

      <div className="grid g4">
        <Stat
          k={t("h_intake")}
          v={
            <>
              {nf(18300)} <small>{t("kg")}</small>
            </>
          }
          d={t("h_intake_d")}
          acc
        />
        <Stat k={t("h_qcq")} v={3} d={t("h_qcq_d")} />
        <Stat
          k={t("h_occ")}
          v={
            <>
              {Math.round((used / cap) * 100)}
              <small>%</small>
            </>
          }
          d={t("h_occ_d")}
        />
        <Stat k={t("h_alerts")} v={1} d={t("h_alerts_d")} color="var(--crit)" />
      </div>

      <div
        className="sec grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,320px)" }}
      >
        <div>
          <div className="sec-h">
            <span className="t-h2">{t("z_title")}</span>
            <Link to="/hub/zones">
              <Btn cls="btn-q" sm>
                {t("more")}
                <PanelIcon name="arr" />
              </Btn>
            </Link>
          </div>
          <div className="grid g3">
            {ZONES.slice(0, 4).map((z) => (
              <ZoneCard key={z.c} z={z} />
            ))}
          </div>

          <div className="sec">
            <div className="sec-h">
              <span className="t-h2">{t("inv_tbl")}</span>
            </div>
            <Tbl
              head={[
                [t("n_lots")],
                [t("f_crop")],
                [t("pl_zone")],
                [t("g_est"), true],
                [t("ci_hist"), true],
                [t("xs_win"), true],
              ]}
            >
              {inStore.map((l) => {
                const dl = daysLeft(l);
                const z = findZone(l.z);
                return (
                  <tr
                    key={l.c}
                    className="click"
                    onClick={() => navigate(`/hub/lot?l=${l.c}`)}
                  >
                    <td>
                      <span className="lotid">{l.c}</span>
                    </td>
                    <td>{pn(l.p)}</td>
                    <td>
                      <span className="mono">{l.z}</span>
                      {z.m === "zeroco" && (
                        <>
                          {" "}
                          <Tag cls="p-zeroco">ZEROCO</Tag>
                        </>
                      )}
                    </td>
                    <td className="r">{nf(l.net)}</td>
                    <td className="r">{storageAge(l)}</td>
                    <td
                      className="r"
                      style={
                        dl != null && dl < 14
                          ? { color: "var(--warn)", fontWeight: 600 }
                          : undefined
                      }
                    >
                      {dl}
                    </td>
                  </tr>
                );
              })}
            </Tbl>
          </div>
        </div>

        <div>
          <div className="sec-h">
            <span className="t-h2">{t("h_alerts")}</span>
          </div>
          <div className="stack">
            <AlertBox
              lvl="crit"
              title={
                <>
                  <span className="mono">EXC-2026-0311</span> · Z-COLD-02
                </>
              }
              desc={t("nt_exc")}
            />
            <AlertBox
              lvl="warn"
              title={<span className="mono">AZ-2026-SMQ-0396</span>}
              desc={t("nt_win")}
            />
            <AlertBox
              lvl="info"
              title={<span className="mono">FA-2026-0121</span>}
              desc={t("nt_fa")}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HubOps;
