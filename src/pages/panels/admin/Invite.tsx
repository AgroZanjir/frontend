/**
 * A7 - invite a person into an organisation.
 *
 * Facility scope is on the form, not an afterthought: a gate operator at the
 * Samarqand hub has no business capturing weights at Farg'ona, and the moment
 * to say so is when the invitation is written.
 */

import {
  Btn,
  Field,
  Note,
  PageHead,
  PanelCard,
  Tag,
} from "@/components/panel/primitives";
import { useLabels } from "@/pages/panels/admin/helpers";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const AdminInvite = () => {
  const { capLabelKey } = useLabels();
  const { ORGS, ROLES } = usePanelData();
  const { t } = usePanelT();

  const hubRoles = ROLES.find((g) => g.g === "rg_hub")!;
  // The gate operator, as the example whose capabilities are previewed.
  const previewed = hubRoles.items[1];

  return (
    <>
      <PageHead title={t("ai_title")} sub={t("ai_sub")} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,330px)" }}
      >
        <PanelCard bodyCls="stack" bodyStyle={{ gap: 14 }}>
          <div className="grid g2" style={{ gap: 14 }}>
            <Field label={t("ai_phone")} required>
              <input className="inp mono" defaultValue="+998 90 123 45 67" />
            </Field>
            <Field label={t("ai_email")}>
              <input className="inp" defaultValue="—" />
            </Field>
            <Field label={t("au_org")} required>
              <select className="inp">
                {ORGS.slice(0, 5).map((o) => (
                  <option key={o.c}>{o.n}</option>
                ))}
              </select>
            </Field>
            <Field label={t("au_role")} required>
              <select className="inp" defaultValue={t(previewed[1])}>
                {hubRoles.items.map((r) => (
                  <option key={r[0]}>{t(r[1])}</option>
                ))}
              </select>
            </Field>
            <Field label={t("ai_scope")}>
              <select className="inp">
                <option>HUB-SMQ — Samarqand Hub</option>
                <option>{t("ai_all")}</option>
              </select>
            </Field>
          </div>

          <Note>{t("ai_note")}</Note>

          <div className="row">
            <Btn cls="btn-p" icon="arr">
              {t("ai_send")}
            </Btn>
            <Btn cls="btn-q">{t("cancel")}</Btn>
          </div>
        </PanelCard>

        <div>
          <PanelCard head={t("ar_caps")}>
            <div className="chipset">
              {previewed[2].map((c) => (
                <Tag key={c} cls="p-cool">
                  {t(capLabelKey(c))}
                </Tag>
              ))}
            </div>
            <p className="t-xs muted-2" style={{ margin: "11px 0 0" }}>
              {t("ar_legend")}
            </p>
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default AdminInvite;
