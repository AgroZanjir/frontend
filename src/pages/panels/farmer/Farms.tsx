/**
 * F2 - my farms.
 *
 * One card per registered holding. Certificates are shown as they are: a farm
 * with none gets an explicit "none" rather than an empty space, because a
 * missing chip and an absent certificate read the same otherwise.
 */

import { useState } from "react";

import {
  Btn,
  Field,
  KV,
  PageHead,
  PanelCard,
  Tag,
} from "@/components/panel/primitives";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const FarmerFarms = () => {
  const { FARMS } = usePanelData();
  const { t, nf } = usePanelT();

  // The button used to be a plus that did nothing. A holding needs a name and
  // nothing else - the code and the organisation come from the platform and
  // the session, because a field is registered by whoever farms it.
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [hectares, setHectares] = useState("");

  const add = useAction(
    () =>
      api.post("/farms/", {
        name,
        region,
        ...(hectares ? { hectares } : {}),
      }),
    { success: "act_saved", capability: "capture" },
  );

  const save = async () => {
    if (!(await add.run())) return;
    setName("");
    setRegion("");
    setHectares("");
    setAdding(false);
  };

  return (
    <>
      <PageHead
        title={t("f_farms")}
        actions={
          <Btn
            icon="plus"
            cls={adding ? "btn-q" : undefined}
            onClick={() => setAdding((was) => !was)}
          >
            {adding ? t("cancel") : t("f_farm_new")}
          </Btn>
        }
      />

      {adding && (
        <PanelCard style={{ marginBottom: 14 }} bodyCls="stack">
          <div className="grid g3" style={{ gap: 14 }}>
            <Field label={t("f_farm_name")} required>
              <input
                className="inp"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label={t("f_region")}>
              <input
                className="inp"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </Field>
            <Field label={t("f_ha")}>
              <input
                className="inp"
                inputMode="decimal"
                value={hectares}
                onChange={(e) => setHectares(e.target.value)}
              />
            </Field>
          </div>
          <div className="row">
            <Btn
              cls="btn-p"
              icon="check"
              disabled={add.disabled || !name.trim()}
              onClick={() => void save()}
            >
              {t("save")}
            </Btn>
          </div>
        </PanelCard>
      )}

      <div className="grid g2">
        {FARMS.map((f) => (
          <PanelCard key={f.c}>
            <div className="between" style={{ alignItems: "flex-start" }}>
              <div>
                <div className="t-h2">{f.n}</div>
                <div className="t-xs muted-2 mono" style={{ marginTop: 2 }}>
                  {f.c}
                </div>
              </div>
              {f.certs.length ? (
                <div className="chipset">
                  {f.certs.map((c) => (
                    <Tag key={c} cls="p-good">
                      {c}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Tag cls="p-line">{t("none")}</Tag>
              )}
            </div>
            <div className="hr" />
            <KV
              rows={[
                [t("b_appl"), f.o],
                [t("f_district"), `${f.d}, ${f.r}`],
                [t("f_ha"), `${f.ha.toFixed(1)} ga`],
                [t("f_lotcount"), nf(f.lots)],
              ]}
            />
          </PanelCard>
        ))}
      </div>
    </>
  );
};

export default FarmerFarms;
