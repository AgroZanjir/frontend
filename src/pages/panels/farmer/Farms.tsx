/**
 * F2 - my farms.
 *
 * One card per registered holding. Certificates are shown as they are: a farm
 * with none gets an explicit "none" rather than an empty space, because a
 * missing chip and an absent certificate read the same otherwise.
 */

import {
  Btn,
  KV,
  PageHead,
  PanelCard,
  Tag,
} from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const FarmerFarms = () => {
  const { FARMS } = usePanelData();
  const { t, nf } = usePanelT();

  return (
    <>
      <PageHead
        title={t("f_farms")}
        actions={<Btn icon="plus">{t("save")}</Btn>}
      />

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
