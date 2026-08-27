/**
 * Where the panels get their data.
 *
 * This module used to *be* the data - two thousand lines of fixtures. It is
 * now the seam it always said it was: one provider that loads the dataset
 * from the API, one hook that hands it to a screen, and the same names the
 * forty-four screens were already written against.
 *
 *     const { LOTS, ZONES, findLot } = usePanelData();
 *
 * Three decisions worth knowing:
 *
 * 1. **One load per session, not one per screen.** The panels move between
 *    screens constantly and every screen reads several collections; refetching
 *    per navigation would make the sidebar feel like a page reload. React
 *    Query holds the result and `refresh()` invalidates it after a write.
 * 2. **The provider owns the loading and error states**, so no screen has to.
 *    A screen that has rendered has data.
 * 3. **Tests pass fixtures in directly.** `screens.spec.tsx` renders every
 *    screen server-side with `value={FIXTURES}`; a render test that needs a
 *    database is a test nobody runs.
 */

import { type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PanelDataContext } from "@/lib/panel-context";
import { loadPanelData } from "@/lib/panel-api";
import { usePanelT } from "@/lib/panel-format";
import type { PanelData } from "@/lib/panel-types";

export * from "@/lib/panel-types";
export { usePanelData } from "@/lib/panel-context";

/**
 * "Today" is now genuinely today.
 *
 * The prototype was authored against a fixed date and read every "days left"
 * from it. Against a live database that would be a lie the first time the
 * clock passed midnight.
 */
export const TODAY = new Date();

export const PANEL_DATA_KEY = ["panel-data"] as const;

export const PanelDataProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  /** Test seam: pass fixtures and no request is made. */
  value?: PanelData;
}) => {
  const { t } = usePanelT();
  const query = useQuery({
    queryKey: PANEL_DATA_KEY,
    queryFn: loadPanelData,
    enabled: !value,
    staleTime: 60_000,
  });

  const data = value ?? query.data;

  if (!data) {
    return (
      <div className="frame">
        <div className="wrap" style={{ padding: "48px 0" }}>
          {query.isError ? (
            <div className="alert a-crit">
              <div className="at">{t("err_load")}</div>
              <div className="ad">
                {(query.error as Error)?.message ?? t("err_generic")}
              </div>
            </div>
          ) : (
            <div className="t-sm muted">{t("loading")}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <PanelDataContext.Provider value={data}>
      {children}
    </PanelDataContext.Provider>
  );
};

/** Re-read the dataset. Call after a write so the screens catch up. */
export const useRefreshPanelData = () => {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: PANEL_DATA_KEY });
};
