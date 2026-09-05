/**
 * F4 - my lots.
 *
 * Every lot the farmer has ever registered, whatever state it is in. Settled
 * and written-off lots stay in the list: the history is the asset.
 */

import LotRow from "@/components/panel/LotRow";
import { Btn, PageHead, Tbl } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { downloadCsv } from "@/lib/panel-download";
import { usePanelData } from "@/lib/panel-data";

const FarmerLots = () => {
  const { FARMS, LOTS } = usePanelData();
  const { t, pn } = usePanelT();

  return (
    <>
      <PageHead
        title={t("n_lots")}
        sub={t("lots_s")}
        actions={
          <Btn
            icon="down"
            onClick={() =>
              downloadCsv(
                "lots",
                [t("n_lots"), t("f_crop"), t("g_farm"), t("g_est"), t("qc_g"), t("b_st")],
                LOTS.map((l) => [
                  l.c,
                  pn(l.p),
                  FARMS[l.f]?.n ?? "",
                  l.net,
                  l.g ?? "",
                  t(`s_${l.st}`),
                ]),
              )
            }
          >
            {t("export")}
          </Btn>
        }
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
