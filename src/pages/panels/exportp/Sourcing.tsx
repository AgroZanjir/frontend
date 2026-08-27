/**
 * E2 - sourcing.
 *
 * Available lots, sorted by what actually constrains a shipment: grade, where
 * it is stored, and how many days of window are left. A lot already reserved
 * shows as reserved rather than offering a button that would fail.
 */

import { Btn, PageHead, Tag, Tbl } from "@/components/panel/primitives";
import { usePanelT, daysLeft } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const ExportSourcing = () => {
  const { FARMS, LOTS, PRODUCTS, findZone } = usePanelData();
  const { t, nf, pn } = usePanelT();
  const available = LOTS.filter((l) => ["stored", "reserved"].includes(l.st));

  return (
    <>
      <PageHead
        title={t("xs_title")}
        sub={t("xs_sub")}
        actions={<Btn icon="chev">{t("filter")}</Btn>}
      />
      <Tbl
        min={980}
        head={[
          [t("n_lots")],
          [t("f_crop")],
          [t("xs_grade")],
          [t("g_farm")],
          [t("pl_zone")],
          [t("xs_avail"), true],
          [t("xs_win"), true],
          [""],
        ]}
      >
        {available.map((l) => {
          const z = findZone(l.z);
          const dl = daysLeft(l);
          return (
            <tr key={l.c}>
              <td>
                <span className="lotid">{l.c}</span>
              </td>
              <td>
                {pn(l.p)} <span className="muted-2">{PRODUCTS[l.p].v}</span>
              </td>
              <td>
                <Tag cls={l.g === "A" ? "p-good" : "p-warn"}>{l.g}</Tag>
              </td>
              <td>{FARMS[l.f].n}</td>
              <td>
                <span className="mono">{l.z}</span>
                {z.m === "zeroco" && (
                  <>
                    {" "}
                    <Tag cls="p-zeroco">ZEROCO</Tag>
                  </>
                )}
              </td>
              <td className="r">{nf(l.net)} kg</td>
              <td
                className="r"
                style={
                  dl != null && dl < 14
                    ? { color: "var(--warn)", fontWeight: 600 }
                    : undefined
                }
              >
                {dl} {t("days")}
              </td>
              <td className="r">
                {l.st === "reserved" ? (
                  <Tag cls="p-warn">{t("s_reserved")}</Tag>
                ) : (
                  <Btn sm cls="btn-p">
                    {t("xs_reserve")}
                  </Btn>
                )}
              </td>
            </tr>
          );
        })}
      </Tbl>
    </>
  );
};

export default ExportSourcing;
