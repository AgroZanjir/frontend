/**
 * F4 - my lots.
 *
 * Every lot the farmer has ever registered, whatever state it is in. Settled
 * and written-off lots stay in the list: the history is the asset.
 */

import LotRow from "@/components/panel/LotRow";
import { Btn, PageHead, Tbl } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const FarmerLots = () => {
  const { LOTS } = usePanelData();
  const { t } = usePanelT();

  return (
    <>
      <PageHead
        title={t("n_lots")}
        sub={t("lots_s")}
        actions={<Btn icon="down">{t("export")}</Btn>}
      />
      <Tbl
        min={820}
        head={[
          [t("n_lots")],
          [t("f_crop")],
          [t("g_farm")],
          [t("g_est"), true],
          [t("qc_g")],
          [t("b_st")],
          [t("xs_win"), true],
        ]}
      >
        {LOTS.map((l) => (
          <LotRow key={l.c} l={l} farm />
        ))}
      </Tbl>
    </>
  );
};

export default FarmerLots;
