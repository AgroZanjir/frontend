/**
 * Z1 - trials.
 *
 * A trial is two arms of the same harvest stored two ways. The observation
 * count is in the list because a trial with four observations and one with
 * eighteen are not comparable evidence, however similar their status pills.
 */

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  Btn,
  Field,
  Note,
  PageHead,
  PanelCard,
  Pill,
  Tbl,
} from "@/components/panel/primitives";
import api from "@/lib/api";
import { useAction } from "@/lib/panel-actions";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";
import type { ProductCode } from "@/lib/panel-types";

const TrialList = () => {
  const { HUBS, PRODUCTS, TRIALS } = usePanelData();
  const { t, pn } = usePanelT();
  const navigate = useNavigate();

  // Opening one, which the plus button used to only look like it did. A trial
  // starts planned and with no arms: which consignment gets divided between
  // ZEROCO and the control is decided when there is one to divide, and the
  // list already carries a trial in exactly that state.
  const [adding, setAdding] = useState(false);
  const [product, setProduct] = useState<ProductCode>("melon");
  const [hub, setHub] = useState(HUBS[0]?.code ?? "");

  const open = useAction(
    () => api.post("/quality/trials/", { product, facility_code: hub }),
    { success: "act_saved", capability: "capture" },
  );

  const create = async () => {
    if (await open.run()) setAdding(false);
  };

  return (
    <>
      <PageHead
        title={t("t_title")}
        sub={t("t_sub")}
        actions={
          <Btn
            cls={adding ? "btn-q" : "btn-p"}
            icon="plus"
            onClick={() => setAdding((was) => !was)}
          >
            {adding ? t("cancel") : t("t_new")}
          </Btn>
        }
      />

      {adding && (
        <PanelCard style={{ marginBottom: 14 }} bodyCls="stack">
          <div className="grid g2" style={{ gap: 14 }}>
            <Field label={t("t_prod")} required>
              <select
                className="inp"
                value={product}
                onChange={(e) => setProduct(e.target.value as ProductCode)}
              >
                {Object.keys(PRODUCTS).map((code) => (
                  <option key={code} value={code}>
                    {pn(code as ProductCode)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("t_hub")}>
              <select
                className="inp"
                value={hub}
                onChange={(e) => setHub(e.target.value)}
              >
                {HUBS.map((h) => (
                  <option key={h.code} value={h.code}>
                    {h.code} — {h.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Note>{t("t_new_note")}</Note>
          <div className="row">
            <Btn
              cls="btn-p"
              icon="check"
              disabled={open.disabled}
              onClick={() => void create()}
            >
              {t("save")}
            </Btn>
          </div>
        </PanelCard>
      )}
      <Tbl
        min={760}
        head={[
          [t("t_code")],
          [t("t_prod")],
          [t("t_start")],
          [t("t_day"), true],
          [t("t_arms"), true],
          [t("t_obs"), true],
          [t("t_status")],
          [""],
        ]}
      >
        {TRIALS.map((x) => (
          <tr
            key={x.c}
            className="click"
            onClick={() => navigate("/trials/compare")}
          >
            <td>
              <span className="lotid">{x.c}</span>
            </td>
            <td>{pn(x.p)}</td>
            <td className="mono">{x.d0}</td>
            <td className="r">{x.day}</td>
            <td className="r">{x.arms}</td>
            <td className="r">{x.obs}</td>
            <td>
              <Pill s={x.st} />
            </td>
            <td className="r">
              <Btn sm cls="btn-q">
                {t("view")}
              </Btn>
            </td>
          </tr>
        ))}
      </Tbl>
    </>
  );
};

export default TrialList;
