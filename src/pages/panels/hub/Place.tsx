/**
 * H7 - put-away.
 *
 * Scan the lot, pick the position. The map is the point: a stock-keeper looks
 * for the free square next to the one they are holding, and a list of position
 * codes cannot show that.
 */

import {
  Btn,
  Field,
  KV,
  PageHead,
  PanelCard,
} from "@/components/panel/primitives";
import { useState } from "react";

import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelData } from "@/lib/panel-data";
import { usePanelT } from "@/lib/panel-format";

/** Positions already holding a lot, as indexes into the 4x8 grid. */
const TAKEN = [0, 1, 2, 5, 6, 9, 10, 11, 17, 18, 22, 25, 26];
/** The square this put-away is going to - B-06, where the flagship lot sits. */
const TARGET = 13;

const HubPlace = () => {
  const { t, nf, pn } = usePanelT();
  const { LOTS, ZONES, findLot } = usePanelData();

  // A lot that is graded and not yet on a shelf is what this screen is for.
  const waiting = LOTS.filter(
    (l) => l.st === "graded" || l.st === "registered",
  );
  // A graded one first. The list keeps the ungraded ones - opening this screen
  // is how an operator finds out a lot still needs grading, and the API says
  // so in as many words - but starting on one made the first click a refusal.
  const [code, setCode] = useState(
    waiting.find((l) => l.st === "graded")?.c ?? waiting[0]?.c ?? LOTS[0]?.c ?? "",
  );
  // A zone that can actually take this lot. It used to offer the first ZEROCO
  // room whatever was in it, so the default put-away for a 5,600 kg lot was a
  // room with 4,400 kg of space - a refusal the operator could be spared. The
  // API is still the authority: fill changes while this screen is open.
  const [zone, setZone] = useState(() => {
    const first =
      waiting.find((l) => l.st === "graded") ?? waiting[0] ?? LOTS[0];
    const fits = (z: (typeof ZONES)[number]) =>
      !first || z.cap - z.used >= first.net;
    return (
      ZONES.find((z) => z.m === "zeroco" && fits(z))?.c ??
      ZONES.find(fits)?.c ??
      ZONES.find((z) => z.m === "zeroco")?.c ??
      ZONES[0]?.c ??
      ""
    );
  });
  const [position, setPosition] = useState("B-06");

  const lot = findLot(code);
  const room = ZONES.find((z) => z.c === zone);

  const place = useAction(
    () =>
      api.post("/storage/placements/", {
        lot: code,
        zone,
        position,
      }),
    { success: "act_placed", capability: "capture" },
  );

  return (
    <>
      <PageHead title={t("pl_title")} sub={t("pl_sub")} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,340px) minmax(0,1fr)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 14 }}>
          <Field
            label={t("pl_lot")}
            hint={t("pl_scan")}
            error={lot && lot.st !== "graded" ? t("pl_ungraded_note") : undefined}
          >
            <div className="row" style={{ gap: 6 }}>
              <input
                className="inp mono"
                style={{ minWidth: 0 }}
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                list="placeable-lots"
              />
              {/* Only what can go on a shelf, and what still cannot: the API
                  refuses an ungraded lot, so saying which is which here saves
                  the operator a refusal they can see coming. */}
              <datalist id="placeable-lots">
                {waiting.map((l) => (
                  <option
                    key={l.c}
                    value={l.c}
                    label={l.st === "graded" ? pn(l.p) : t("pl_ungraded")}
                  />
                ))}
              </datalist>
            </div>
          </Field>
          <Field label={t("pl_zone")}>
            <select
              className="inp"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
            >
              {/* The free figure is on the option because the choice is made
                  here and the refusal comes from there. */}
              {ZONES.map((z) => (
                <option key={z.c} value={z.c}>
                  {z.c} — {t(`m_${z.m}`)} · {nf(Math.max(z.cap - z.used, 0))}{" "}
                  {t("kg")} {t("pl_free")}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("pl_pos")}>
            <input
              className="inp mono"
              value={position}
              onChange={(e) => setPosition(e.target.value.toUpperCase())}
            />
          </Field>
          <div className="hr" />
          <KV
            rows={[
              [t("w_net"), lot ? `${nf(lot.net)} kg` : "—"],
              [t("qc_g"), lot?.g || "—"],
              [t("z_temp"), room ? `${room.t} °C` : "—"],
              [
                t("z_cap"),
                room
                  ? `${Math.round((room.used / room.cap) * 100)}% · ${nf(room.cap - room.used)} kg ${t("pl_free")}`
                  : "—",
              ],
            ]}
          />
          {/* The API refuses an ungraded lot and a full zone, with the reason.
              Refusing here as well would only mean saying it twice, and worse:
              the zone's fill changes while this screen is open. */}
          <Btn
            cls="btn-p"
            icon="box"
            disabled={place.disabled || !code || !zone}
            onClick={() => void place.run()}
          >
            {t("pl_place")}
          </Btn>
        </PanelCard>

        <PanelCard>
          <div className="t-label" style={{ marginBottom: 10 }}>
            Z-ZEROCO-01 · {t("pl_pos")}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8,1fr)",
              gap: 5,
            }}
          >
            {Array.from({ length: 32 }, (_, i) => {
              const id = `${"ABCD"[Math.floor(i / 8)]}-${String((i % 8) + 1).padStart(2, "0")}`;
              const taken = TAKEN.includes(i);
              const here = i === TARGET;
              return (
                <div
                  key={id}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "var(--r-xs)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 9,
                    fontFamily: "var(--fm)",
                    background: here
                      ? "var(--primary)"
                      : taken
                        ? "var(--surface-3)"
                        : "var(--surface-2)",
                    color: here ? "#fff" : "var(--ink-3)",
                    border: `1px solid ${here ? "var(--primary)" : "var(--line)"}`,
                    fontWeight: here ? 700 : 400,
                  }}
                >
                  {id}
                </div>
              );
            })}
          </div>
          <div className="row" style={{ marginTop: 12, gap: 14 }}>
            <span className="row t-xs muted" style={{ gap: 5 }}>
              <i
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: "var(--primary)",
                  display: "block",
                }}
              />
              {t("pl_place")}
            </span>
            <span className="row t-xs muted" style={{ gap: 5 }}>
              <i
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: "var(--surface-3)",
                  display: "block",
                }}
              />
              {t("z_full")}
            </span>
          </div>
        </PanelCard>
      </div>
    </>
  );
};

export default HubPlace;
