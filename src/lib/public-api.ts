/**
 * The public panel's data, which needs no session at all.
 *
 * Panel 07 is the one anybody can open: a shopper holding a melon with a QR
 * sticker, a buyer checking a consignment before paying for it. It therefore
 * cannot share `panel-data.tsx` - that loads the operator dataset behind a
 * token, and an anonymous visitor got a page that never stopped loading.
 *
 * One request, one open endpoint, and a `notFound` state, because a code
 * typed from a sticker will sometimes be typed wrong.
 */

import { useQuery } from "@tanstack/react-query";

import { API_V1 } from "@/config";

export interface PublicEvent {
  type: string;
  occurred_at: string;
  actor: string;
  severity: string;
}

export interface PublicPassport {
  lot: {
    code: string;
    product: string;
    grade: string;
    status: string;
    storage_mode: string;
    zone: string | null;
    harvested_on: string | null;
    placed_at: string | null;
    sell_by: string | null;
    net_weight_g: number;
  };
  product: {
    code: string;
    name_uz: string;
    name_ru: string;
    name_en: string;
    variety: string;
  } | null;
  origin: {
    farm: string;
    name: string;
    region: string;
    district: string;
    certifications: string[];
  } | null;
  zone: { code: string; mode: string; temp_c: string; rh_pct: string } | null;
  events: PublicEvent[];
  qc: { stage: string; inspected_on: string; passed: boolean }[];
  chain_intact: boolean;
}

/** The lot behind the QR code on the demonstration sticker. */
export const SAMPLE_LOT = "AZ-2026-SMQ-0412";

export const usePublicPassport = (code: string) => {
  const query = useQuery({
    queryKey: ["public-passport", code],
    enabled: Boolean(code),
    retry: false,
    staleTime: 60_000,
    queryFn: async (): Promise<PublicPassport> => {
      const response = await fetch(
        `${API_V1}/panels/public/lots/${encodeURIComponent(code)}/`,
        { headers: { Accept: "application/json" } },
      );
      // A 404 is an answer, not a failure: the code was mistyped or belongs to
      // nothing. The screen says so rather than showing a spinner forever.
      if (response.status === 404) throw new Error("not-found");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as PublicPassport;
    },
  });

  return {
    passport: query.data ?? null,
    loading: query.isLoading,
    notFound: (query.error as Error | null)?.message === "not-found",
    failed: query.isError && (query.error as Error).message !== "not-found",
  };
};
