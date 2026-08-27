/**
 * H5 - grading and split.
 *
 * One arrival becomes several lots with several destinations. Splits and
 * merges are modelled from day one because traceability breaks in the first
 * week of real use otherwise - the note under the table says so on the screen,
 * not only in the schema.
 *
 * The screen posts one split, not three gradings: the children are created
 * together, each with a `lot_relation` back to the parent, so a child can
 * always be traced to the farm it came from. The quantities are editable and
 * checked against the parent's net here as well as at the API, because a
 * grader who has typed 12 tonnes out of a 9-tonne intake wants to know before
 * they press the button, not after.
 */

import { useState } from "react";

import {
  Btn,
  Note,
  PageHead,
  PanelCard,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelData } from "@/lib/panel-data";
import { usePanelT } from "@/lib/panel-format";

interface Child {
  grade: string;
  kg: string;
  zone: string;
}

const PILL: Record<string, string> = { A: "p-good", B: "p-warn", C: "p-crit" };

const HubGrade = () => {
  const { LOTS, ZONES, findLot } = usePanelData();
  const { t, pn, nf } = usePanelT();

  // Grading happens to something that has been registered and not yet graded.
  const ungraded = LOTS.filter((l) => l.st === "registered");
  const [source, setSource] = useState(ungraded[0]?.c ?? LOTS[0]?.c ?? "");
  const parent = findLot(source);

  const zeroco = ZONES.find((z) => z.m === "zeroco")?.c ?? "";
  const cold = ZONES.find((z) => z.m === "cold")?.c ?? "";
  const [children, setChildren] = useState<Child[]>([
    { grade: "A", kg: "", zone: zeroco },
    { grade: "B", kg: "", zone: cold },
  ]);

  const set = (index: number, patch: Partial<Child>) =>
    setChildren((all) =>
      all.map((child, i) => (i === index ? { ...child, ...patch } : child)),
    );

  const filled = children.filter((c) => Number(c.kg) > 0);
  const total = filled.reduce((sum, c) => sum + Number(c.kg), 0);
  const overflow = parent ? total > parent.net : false;

  const split = useAction(
    () =>
      api.post(`/lots/${source}/split/`, {
        children: filled.map((child) => ({
          grade: child.grade,
          net_weight_g: Math.round(Number(child.kg) * 1000),
        })),
      }),
    { success: "act_graded", capability: "capture" },
  );

  const apply = async () => {
    const done = await split.run();
    if (done) setChildren((all) => all.map((c) => ({ ...c, kg: "" })));
  };

  return (
    <>
      <PageHead title={t("gr_title")} sub={t("gr_sub")} />

      <PanelCard>
        <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="t-label">{t("gr_src")}</div>
            <select
              className="inp mono"
              style={{ marginTop: 3, maxWidth: 230 }}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {(ungraded.length ? ungraded : LOTS).map((l) => (
                <option key={l.c} value={l.c}>
                  {l.c}
                </option>
              ))}
            </select>
          </div>
          <div className="row" style={{ gap: 16 }}>
            <div>
              <div className="t-label">{t("w_net")}</div>
              <div className="t-h2 num">
                {parent ? `${nf(parent.net)} kg` : "—"}
              </div>
            </div>
            <div>
              <div className="t-label">{t("f_crop")}</div>
              <div className="t-h2">{parent ? pn(parent.p) : "—"}</div>
            </div>
            <div>
              <div className="t-label">{t("gr_left")}</div>
              <div
                className="t-h2 num"
                style={{ color: overflow ? "var(--crit)" : undefined }}
              >
                {parent ? `${nf(parent.net - total)} kg` : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="hr" />

        <Tbl head={[[t("qc_g")], [t("gr_split"), true], [t("gr_dest")], [""]]}>
          {children.map((child, index) => (
            <tr key={index}>
              <td>
                <select
                  className="inp"
                  style={{ width: 78 }}
                  value={child.grade}
                  onChange={(e) => set(index, { grade: e.target.value })}
                  aria-label={t("qc_g")}
                >
                  {["A", "B", "C"].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </td>
              <td className="r">
                <input
                  className="inp num"
                  style={{ width: 120, textAlign: "right" }}
                  inputMode="decimal"
                  placeholder="0"
                  value={child.kg}
                  onChange={(e) => set(index, { kg: e.target.value })}
                  aria-label={t("gr_split")}
                />
              </td>
              <td>
                <select
                  className="inp mono"
                  value={child.zone}
                  onChange={(e) => set(index, { zone: e.target.value })}
                  aria-label={t("gr_dest")}
                >
                  {ZONES.map((z) => (
                    <option key={z.c} value={z.c}>
                      {z.c}
                    </option>
                  ))}
                </select>
                {child.zone.includes("ZEROCO") && (
                  <>
                    {" "}
                    <Tag cls="p-zeroco">ZEROCO</Tag>
                  </>
                )}
              </td>
              <td className="r">
                <Tag cls={PILL[child.grade] ?? "p-line"}>{child.grade}</Tag>
              </td>
            </tr>
          ))}
        </Tbl>

        <div className="row" style={{ marginTop: 10 }}>
          <Btn
            sm
            cls="btn-q"
            icon="plus"
            onClick={() =>
              setChildren((all) => [...all, { grade: "C", kg: "", zone: cold }])
            }
          >
            {t("gr_add")}
          </Btn>
        </div>

        <Note style={{ marginTop: 12 }}>{t("gr_note")}</Note>

        {overflow && (
          <div className="alert a-crit" style={{ marginTop: 10 }}>
            <div className="at">{t("gr_over")}</div>
            <div className="ad">
              {nf(total)} kg / {parent ? nf(parent.net) : 0} kg
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <Btn
            cls="btn-p"
            icon="check"
            disabled={split.disabled || !filled.length || overflow}
            onClick={() => void apply()}
          >
            {t("gr_apply")}
          </Btn>
          <Btn
            cls="btn-q"
            onClick={() =>
              setChildren((all) => all.map((c) => ({ ...c, kg: "" })))
            }
          >
            {t("cancel")}
          </Btn>
        </div>
      </PanelCard>
    </>
  );
};

export default HubGrade;
