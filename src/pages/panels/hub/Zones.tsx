/**
 * H6 - storage zones.
 *
 * Every room at once, with fill and both set points. ZEROCO chambers carry a
 * blue left edge so the reader can see at a glance which capacity is the
 * scarce kind.
 */

import ZoneCard from "@/components/panel/ZoneCard";
import { PageHead } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const HubZones = () => {
  const { ZONES } = usePanelData();
  const { t } = usePanelT();
  return (
    <>
      <PageHead title={t("z_title")} sub={t("z_sub")} />
      <div className="grid g3">
        {ZONES.map((z) => (
          <ZoneCard key={z.c} z={z} detail />
        ))}
      </div>
    </>
  );
};

export default HubZones;
