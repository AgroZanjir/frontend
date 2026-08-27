/**
 * F3 - harvest declaration.
 *
 * Declaring a harvest books a slot at the gate. That is the whole point of the
 * screen: the hub knows what is arriving and when, so the weighbridge queue is
 * a schedule rather than a morning of guesswork.
 */

import {
  Btn,
  Field,
  KV,
  Note,
  PageHead,
  PanelCard,
  Tag,
} from "@/components/panel/primitives";
import { useState } from "react";

import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import type { ProductCode } from "@/lib/panel-types";
import { usePanelData } from "@/lib/panel-data";

const FarmerHarvest = () => {
  const { FARMS, HUBS, PRODUCTS } = usePanelData();
  const { t, pn } = usePanelT();

  const [product, setProduct] = useState("pom");
  const [quantity, setQuantity] = useState("5600");
  const [harvested, setHarvested] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [hub, setHub] = useState(HUBS[0]?.code ?? "HUB-SMQ");
  const [slot, setSlot] = useState("08:30");
  const [vehicle, setVehicle] = useState("01 D 552 MN");

  // The next day's slot. A delivery announced for a time that has already
  // passed is a queue entry the gate cannot act on.
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  // What a producer sends ahead. It is not a lot: a lot is born on the
  // weighbridge, from a weight somebody stood next to.
  const announce = useAction(
    () =>
      api.post("/storage/arrivals/", {
        facility: hub,
        farm: FARMS[0]?.c,
        product,
        vehicle,
        expected_at: `${tomorrow}T${slot}:00`,
        estimated_weight_g: Math.round(
          Number(quantity.replace(/\s/g, "")) * 1000,
        ),
      }),
    { success: "act_announced", capability: "capture" },
  );

  return (
    <>
      <PageHead title={t("f_harv_t")} sub={t("f_harv_s")} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,340px)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 14 }}>
          <div className="grid g2" style={{ gap: 14 }}>
            <Field label={t("f_crop")} required>
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
            <Field label={`${t("f_qty")} (kg)`} required>
              <input
                className="inp"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Field>
            <Field label={t("f_hdate")}>
              <input
                className="inp"
                type="date"
                value={harvested}
                onChange={(e) => setHarvested(e.target.value)}
              />
            </Field>
            <Field label={t("f_hub")}>
              <select
                className="inp"
                value={hub}
                onChange={(e) => setHub(e.target.value)}
              >
                {HUBS.map((h) => (
                  <option key={h.code} value={h.code}>
                    {h.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("f_slot")} hint={tomorrow}>
              <select
                className="inp"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
              >
                {["07:00", "08:00", "08:30", "09:00", "10:00", "14:00"].map(
                  (time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <Field label={t("f_veh")}>
              <input
                className="inp"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              />
            </Field>
          </div>

          <Note>{t("f_slotnote")}</Note>

          <div className="row">
            <Btn
              cls="btn-p"
              icon="check"
              disabled={announce.disabled || !quantity}
              onClick={() => void announce.run()}
            >
              {t("f_submit")}
            </Btn>
            <Btn cls="btn-q" onClick={() => setQuantity("")}>
              {t("cancel")}
            </Btn>
          </div>
        </PanelCard>

        <div className="stack">
          <PanelCard head={t("g_farm")}>
            <KV
              rows={[
                [t("f_farm"), FARMS[0].n],
                [t("f_district"), "Payariq, Samarqand"],
                [t("f_certs"), <Tag cls="p-good">GlobalGAP</Tag>],
              ]}
            />
          </PanelCard>
          <PanelCard>
            <div className="t-sm muted">{t("pl_sugg")}</div>
            <div className="t-h2" style={{ marginTop: 4 }}>
              Z-ZEROCO-02
            </div>
            <div className="t-xs muted-2" style={{ marginTop: 2 }}>
              {t("pl_why")}
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default FarmerHarvest;
