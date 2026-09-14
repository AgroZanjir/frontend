/**
 * H4 - QC inspection.
 *
 * The measurement fields carry their acceptable range as a hint rather than
 * validating silently: an inspector who knows why 5.2% failed will re-measure,
 * one who only sees a red border will re-type.
 *
 * Photographs are required. A grade without evidence is an opinion, and the
 * whole point of the record is that a buyer or an insurer can check it.
 */

import PanelIcon from "@/components/panel/icons";
import {
  Btn,
  Field,
  PageHead,
  PanelCard,
  Tag,
  Tbl,
} from "@/components/panel/primitives";
import { useState } from "react";

import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";
import type { PanelDoc } from "@/lib/panel-types";
import { usePanelPersona } from "@/lib/panel-session";

const HubQc = () => {
  const { QC, LOTS, PRODUCTS, findLot } = usePanelData();
  const { t, pn } = usePanelT();

  const [code, setCode] = useState(LOTS[0]?.c ?? "");
  const [stage, setStage] = useState("intake");
  const [brix, setBrix] = useState("12.4");
  const [calibre, setCalibre] = useState("2.1");
  const [firmness, setFirmness] = useState("8.4");
  const [defects, setDefects] = useState("1.8");
  const [passed, setPassed] = useState(true);
  const [grade, setGrade] = useState("A");

  const lot = findLot(code);
  const inspector = usePanelPersona()?.name ?? "";

  // What is already attached to this lot. Read from the vault rather than held
  // on the form: a photograph belongs to the lot, not to the inspection being
  // typed, and the next inspector should see what the last one took.
  const attached = useQuery({
    queryKey: ["lot-documents", code],
    queryFn: () =>
      api.get<{ results: PanelDoc[] }>(
        `/panels/documents/?subject_type=lot&subject_code=${encodeURIComponent(code)}`,
      ),
    enabled: Boolean(code),
  });
  const photos = (attached.data?.results ?? []).filter(
    (d) => d.type === "photo" && d.url,
  );
  const awaitedLab = (attached.data?.results ?? []).some(
    (d) => d.type === "lab" && d.status === "pending",
  );

  const picker = useRef<HTMLInputElement>(null);

  const addPhoto = useAction(
    (file: File) => {
      const form = new FormData();
      form.append("file", file);
      form.append("subject_type", "lot");
      form.append("subject_code", code);
      form.append("doc_type", "photo");
      return api.post("/documents/upload/", form);
    },
    { success: "act_saved", capability: "capture", refresh: false },
  );

  // Not a second inspection: it records that the report is owed, and the lot
  // shows it as awaited until the laboratory issues it.
  const toLab = useAction(
    () => api.post("/quality/lab-requests/", { lot: code }),
    { success: "qc_lab_sent", capability: "capture", refresh: false },
  );

  const record = useAction(
    () =>
      api.post("/quality/qc-records/", {
        lot: code,
        stage,
        inspected_on: new Date().toISOString().slice(0, 10),
        measurements: {
          brix: Number(brix) || 0,
          calibre_kg: Number(calibre) || 0,
          firmness_n: Number(firmness) || 0,
        },
        defect_pct: Number(defects) || 0,
        grade_assigned: grade,
        passed,
      }),
    { success: "act_qc", capability: "capture" },
  );

  // Cancel is the inspector putting the fruit down and starting again: the
  // measurements go, the lot stays selected, because the next reading is
  // usually of the same consignment.
  const clear = () => {
    setBrix("");
    setCalibre("");
    setFirmness("");
    setDefects("");
    setPassed(true);
    setGrade("A");
  };

  return (
    <>
      <PageHead
        title={t("qc_title")}
        sub={t("qc_sub")}
        actions={
          <Btn
            icon="lab"
            disabled={toLab.disabled || !code || awaitedLab}
            onClick={async () => {
              if (await toLab.run()) await attached.refetch();
            }}
          >
            {awaitedLab ? t("qc_lab_awaited") : t("qc_lab")}
          </Btn>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,300px)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 15 }}>
          <div className="row" style={{ gap: 8 }}>
            <select
              className="inp mono"
              style={{ maxWidth: 220 }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label={t("pl_lot")}
            >
              {LOTS.map((l) => (
                <option key={l.c} value={l.c}>
                  {l.c}
                </option>
              ))}
            </select>
            {lot && <Tag>{pn(lot.p)}</Tag>}
            {lot && <Tag cls="p-line">{PRODUCTS[lot.p].v}</Tag>}
          </div>

          <div className="grid g2" style={{ gap: 14 }}>
            <Field label={t("qc_stage")}>
              <select
                className="inp"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                {["intake", "pre_storage", "in_storage", "pre_dispatch"].map(
                  (key) => (
                    <option key={key} value={key}>
                      {t(`q_${key}`)}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <Field label={t("qc_by")} hint={t("qc_by_hint")}>
              {/* The inspector is whoever is signed in. Typing a name here was
                  a way to attribute a measurement to someone who did not take
                  it. */}
              <input className="inp" readOnly value={inspector} />
            </Field>
          </div>

          <div className="hr" />
          <div className="t-label">{t("qc_sub")}</div>

          <div className="grid g3" style={{ gap: 14 }}>
            <Field label={t("qc_brix")} required hint="6–18">
              <input
                className="inp"
                inputMode="decimal"
                value={brix}
                onChange={(e) => setBrix(e.target.value)}
              />
            </Field>
            <Field label={`${t("qc_cal")} (kg)`} required hint="1.4–3.2">
              <input
                className="inp"
                inputMode="decimal"
                value={calibre}
                onChange={(e) => setCalibre(e.target.value)}
              />
            </Field>
            <Field label={`${t("qc_firm")} (N)`}>
              <input
                className="inp"
                inputMode="decimal"
                value={firmness}
                onChange={(e) => setFirmness(e.target.value)}
              />
            </Field>
            <Field label={`${t("qc_def")} (%)`} hint="max 5.0">
              <input
                className="inp"
                inputMode="decimal"
                value={defects}
                onChange={(e) => setDefects(e.target.value)}
              />
            </Field>
            <Field label={t("qc_app")}>
              <select
                className="inp"
                value={passed ? "pass" : "fail"}
                onChange={(e) => setPassed(e.target.value === "pass")}
              >
                <option value="pass">{t("qc_pass")}</option>
                <option value="fail">{t("qc_fail")}</option>
              </select>
            </Field>
            <Field label={t("qc_g")}>
              <select
                className="inp"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </Field>
          </div>

          <div className="hr" />

          <div>
            <div className="between">
              {/* No asterisk: the API does not refuse an inspection without
                  photographs, and a form that says required and then saves
                  anyway teaches the reader to disbelieve the next asterisk. */}
              <span className="t-label">{t("qc_photo")}</span>
              <span className="t-xs muted-2">{t("qc_photo_n")}</span>
            </div>
            <div className="row" style={{ marginTop: 8, gap: 8 }}>
              {photos.map((d) => (
                <a
                  key={d.code}
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  title={`${d.reference} · ${Math.round(d.bytes / 1024)} kB`}
                  style={{
                    width: 74,
                    height: 60,
                    borderRadius: "var(--r-sm)",
                    overflow: "hidden",
                    display: "block",
                    border: "1px solid var(--line)",
                  }}
                >
                  <img
                    src={d.url}
                    alt={d.reference}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </a>
              ))}
              {!photos.length && (
                <div
                  style={{
                    width: 74,
                    height: 60,
                    borderRadius: "var(--r-sm)",
                    background: "var(--surface-3)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--ink-3)",
                  }}
                >
                  <PanelIcon name="cam" />
                </div>
              )}
              {/* `capture` is the phone's camera on a phone and a file
                  dialogue on the weighbridge PC - the same input either way. */}
              <input
                ref={picker}
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (await addPhoto.run(file)) await attached.refetch();
                }}
              />
              <Btn
                sm
                icon="plus"
                style={{ height: 60 }}
                disabled={addPhoto.disabled || !code}
                onClick={() => picker.current?.click()}
              >
                {t("qc_add")}
              </Btn>
            </div>
          </div>

          <div className="row">
            <Btn
              cls="btn-p"
              icon="check"
              disabled={record.disabled || !code}
              onClick={() => void record.run()}
            >
              {t("qc_save")}
            </Btn>
            <Btn cls="btn-q" onClick={clear}>
              {t("cancel")}
            </Btn>
          </div>
        </PanelCard>

        <div>
          <PanelCard head={t("qc_hist")}>
            <Tbl head={[[t("qc_stage")], [t("qc_date")], [t("qc_g")]]}>
              {QC.map((r) => (
                <tr key={r.s}>
                  <td className="t-xs">{t(`q_${r.s}`)}</td>
                  <td className="mono">{r.d}</td>
                  <td>
                    <Tag cls="p-good">{r.g}</Tag>
                  </td>
                </tr>
              ))}
            </Tbl>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default HubQc;
