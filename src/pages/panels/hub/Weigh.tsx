/**
 * H3 - weigh and register.
 *
 * This is where a lot is born, and where the platform's base unit shows: gross
 * minus tare, in kilograms, with the net field carrying the accent because it
 * is the number every later screen inherits.
 *
 * Three things this screen has to get right, and they are all about the gate
 * being a bad place to be wrong:
 *
 * 1. **Net is computed, not typed.** It was three free-text fields, which is
 *    an invitation to a lot whose net does not match its own weights.
 * 2. **The idempotency key is minted once per consignment, not per click.**
 *    The gate loses connectivity; a second press of a button whose first press
 *    did land must return the same lot rather than create another one. The key
 *    is reset only when the form is cleared for the next vehicle.
 * 3. **The lot code comes back and stays on screen.** It is what gets written
 *    on the pallet, and a toast that fades is no use to someone holding a
 *    marker pen.
 */

import { useState } from "react";

import {
  Btn,
  Field,
  KV,
  Note,
  PageHead,
  PanelCard,
} from "@/components/panel/primitives";
import PanelIcon from "@/components/panel/icons";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelData } from "@/lib/panel-data";
import type { ProductCode } from "@/lib/panel-types";
import { usePanelT } from "@/lib/panel-format";

/** `4 310`, `4310.4`, `4,310` - a weighbridge readout, typed by a person. */
const kg = (text: string): number => {
  const n = Number(text.replace(/[\s,]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const grams = (text: string): number => Math.round(kg(text) * 1000);

/** One key per consignment. See the note at the top of this file. */
const newKey = () => Math.random().toString(36).slice(2, 10);

const HubWeigh = () => {
  const { FARMS, PRODUCTS, ZONES } = usePanelData();
  const { t, pn, nf } = usePanelT();

  const [gross, setGross] = useState("4 310");
  const [tare, setTare] = useState("110");
  const [farm, setFarm] = useState(FARMS[0]?.c ?? "");
  const [product, setProduct] = useState("melon");
  const [vehicle, setVehicle] = useState("01 A 234 BC");
  const [key, setKey] = useState(newKey);
  const [created, setCreated] = useState<string>("");

  const net = Math.max(kg(gross) - kg(tare), 0);
  const suggested = ZONES.find((z) => z.m === "zeroco") ?? ZONES[0];

  const register = useAction(
    () =>
      api.post<{ code: string }>("/lots/", {
        product,
        farm,
        gross_weight_g: grams(gross),
        net_weight_g: Math.round(net * 1000),
        harvested_on: new Date().toISOString().slice(0, 10),
        facility: "GATE-01",
        idempotency_key: key,
      }),
    { success: "act_registered", capability: "capture" },
  );

  const submit = async () => {
    const lot = await register.run();
    if (!lot) return;
    setCreated(lot.code);
    // The consignment is registered; the next vehicle is a new one.
    setKey(newKey());
  };

  const clear = () => {
    setGross("");
    setTare("");
    setVehicle("");
    setCreated("");
    setKey(newKey());
  };

  return (
    <>
      <PageHead title={t("w_title")} sub={t("w_sub")} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,320px)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 16 }}>
          <div className="grid g3" style={{ gap: 14 }}>
            <Field label={t("w_gross")}>
              <input
                className="inp big"
                inputMode="decimal"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
              />
            </Field>
            <Field label={t("w_tare")}>
              <input
                className="inp big"
                inputMode="decimal"
                value={tare}
                onChange={(e) => setTare(e.target.value)}
              />
            </Field>
            <Field label={t("w_net")} hint={t("w_net_hint")}>
              {/* Read-only on purpose: gross minus tare, and no third opinion. */}
              <input
                className="inp big"
                readOnly
                value={nf(net)}
                style={{
                  color: "var(--primary)",
                  borderColor: "var(--primary)",
                }}
              />
            </Field>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <span className="pill p-good">
              <span className="dot" />
              GATE-01 · {t("w_live")}
            </span>
            <span className="t-xs muted-2 mono">
              {t("w_idem")} {key}
            </span>
          </div>

          <div className="hr" />

          <div className="grid g2" style={{ gap: 14 }}>
            <Field label={t("w_supplier")}>
              <select
                className="inp"
                value={farm}
                onChange={(e) => setFarm(e.target.value)}
              >
                {FARMS.map((f) => (
                  <option key={f.c} value={f.c}>
                    {f.n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("g_prod")}>
              <select
                className="inp"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                {Object.entries(PRODUCTS).map(([code, item]) => (
                  <option key={code} value={code}>
                    {pn(code as ProductCode)} · {item.v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("g_veh")}>
              <input
                className="inp"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              />
            </Field>
            <Field label={t("pl_sugg")}>
              <input
                className="inp mono"
                readOnly
                value={suggested?.c ?? "—"}
              />
            </Field>
          </div>

          <Note>{t("w_note")}</Note>

          {created && (
            <div className="alert a-good">
              <PanelIcon name="check" />
              <div>
                <div className="at">{t("act_registered")}</div>
                <div className="ad mono">{created}</div>
              </div>
            </div>
          )}

          <div className="row">
            <Btn
              cls="btn-p"
              icon="print"
              disabled={register.disabled || net <= 0}
              onClick={() => void submit()}
            >
              {t("w_create")}
            </Btn>
            <Btn cls="btn-q" onClick={clear}>
              {t("cancel")}
            </Btn>
          </div>
        </PanelCard>

        <div className="stack">
          <PanelCard>
            <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
              <span className="pill p-info" style={{ padding: 5 }}>
                <PanelIcon name="cond" />
              </span>
              <div className="t-sm">{t("w_offline")}</div>
            </div>
          </PanelCard>
          <PanelCard>
            <div className="t-label">{t("pl_sugg")}</div>
            <div className="t-h1 mono" style={{ marginTop: 5 }}>
              {suggested?.c ?? "—"}
            </div>
            <div className="t-xs muted-2" style={{ marginTop: 3 }}>
              {t("pl_why")}
            </div>
            <div className="hr" />
            <KV
              rows={[
                [t("z_temp"), `${suggested?.t ?? "—"} °C`],
                [t("z_rh"), `${suggested?.rh ?? "—"}%`],
                [
                  t("z_cap"),
                  suggested
                    ? `${Math.round((suggested.used / suggested.cap) * 100)}%`
                    : "—",
                ],
              ]}
            />
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default HubWeigh;
