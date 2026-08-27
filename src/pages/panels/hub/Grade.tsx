/**
 * H5 - grading and split.
 *
 * One arrival becomes three lots with three destinations. Splits and merges
 * are modelled from day one because traceability breaks in the first week of
 * real use otherwise - the note under the table says so on the screen, not
 * only in the schema.
 */

import {
  Btn,
  Note,
  PageHead,
  PanelCard,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";

/** `[grade, quantity, new lot code, destination zone, pill class]`. */
const SPLIT: [string, string, string, string, string][] = [
  ["A", "4 200", "AZ-2026-SMQ-0412", "Z-ZEROCO-01", "p-good"],
  ["A", "3 000", "AZ-2026-SMQ-0411", "Z-COLD-01", "p-good"],
  ["B", "2 000", "AZ-2026-SMQ-0413", "Z-COLD-01", "p-warn"],
];

const HubGrade = () => {
  const { t, pn } = usePanelT();

  return (
    <>
      <PageHead title={t("gr_title")} sub={t("gr_sub")} />

      <PanelCard>
        <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="t-label">{t("gr_src")}</div>
            <div className="mono t-h2" style={{ marginTop: 3 }}>
              AZ-2026-SMQ-0410
            </div>
          </div>
          <div className="row" style={{ gap: 16 }}>
            <div>
              <div className="t-label">{t("w_net")}</div>
              <div className="t-h2 num">9 200 kg</div>
            </div>
            <div>
              <div className="t-label">{t("f_crop")}</div>
              <div className="t-h2">{pn("melon")}</div>
            </div>
          </div>
        </div>

        <div className="hr" />

        <Tbl
          head={[
            [t("qc_g")],
            [t("gr_split"), true],
            [t("n_lots")],
            [t("gr_dest")],
            [""],
          ]}
        >
          {SPLIT.map(([g, q, c, z, cls]) => (
            <tr key={c}>
              <td>
                <Tag cls={cls}>{g}</Tag>
              </td>
              <td className="r num">{q} kg</td>
              <td>
                <span className="lotid">{c}</span>
              </td>
              <td>
                <span className="mono">{z}</span>
                {z.includes("ZEROCO") && (
                  <>
                    {" "}
                    <Tag cls="p-zeroco">ZEROCO</Tag>
                  </>
                )}
              </td>
              <td className="r">
                <Btn sm cls="btn-q">
                  {t("details")}
                </Btn>
              </td>
            </tr>
          ))}
        </Tbl>

        <Note style={{ marginTop: 12 }}>{t("gr_note")}</Note>

        <div className="row" style={{ marginTop: 12 }}>
          <Btn cls="btn-p" icon="check">
            {t("gr_apply")}
          </Btn>
          <Btn cls="btn-q">{t("cancel")}</Btn>
        </div>
      </PanelCard>
    </>
  );
};

export default HubGrade;
