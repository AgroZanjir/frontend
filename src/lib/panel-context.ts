/**
 * The panel dataset's context, on its own.
 *
 * Split out from `panel-data.tsx` for one reason: `panel-format.ts` needs to
 * read product names, and `panel-data.tsx` needs `usePanelT` from
 * `panel-format.ts`. A module in between is cheaper than a cycle.
 */

import { createContext, useContext } from "react";

import type { PanelData } from "@/lib/panel-types";

export const PanelDataContext = createContext<PanelData | null>(null);

export const usePanelData = (): PanelData => {
  const data = useContext(PanelDataContext);
  if (!data) {
    throw new Error(
      "usePanelData outside PanelDataProvider - every panel route renders inside one.",
    );
  }
  return data;
};

/**
 * The dataset if there is one.
 *
 * The website renders outside the provider and still uses `usePanelT` for its
 * translations, so anything shared between the two surfaces has to cope with
 * there being no dataset at all.
 */
export const useOptionalPanelData = (): PanelData | null =>
  useContext(PanelDataContext);
