/**
 * What the public website reads from the platform.
 *
 * Two things on the site are not marketing copy: the lot card in the hero and
 * the ZEROCO comparison chart. Both are real records, and both are served by
 * endpoints that need no session - provenance is public, which is the whole
 * argument the site is making.
 *
 * Both fall back to the constants in `site-data.ts` when the API cannot be
 * reached. That is deliberate: this is the page a visitor lands on, and a
 * marketing site that renders an error because a backend is redeploying is
 * worse than one showing the same figures it shipped with. The fallbacks are
 * the seeded values, so a visitor never sees two different truths.
 */

import { useQuery } from "@tanstack/react-query";

import { API_V1 } from "@/config";
import { SHOWCASE_LOT, SHOWCASE_TRIAL } from "@/lib/site-data";

export interface ShowcaseLot {
  code: string;
  product: string;
  /** The product's name in each language: the public panel has no catalogue. */
  productName: Record<string, string>;
  zone: string | null;
  netKg: number;
  sellBy: string | null;
  tempC: number | null;
}

export interface ShowcaseTrial {
  days: number[];
  zeroco: Record<string, number[]>;
  control: Record<string, number[]>;
  /** How many sampling days are measured; the rest is drawn dashed. */
  observed: number;
}

/** No auth header, no credentials: these endpoints are open, and stay open. */
const publicGet = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_V1}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
};

/** What the contact form sends. */
export interface Enquiry {
  name: string;
  organisation: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
}

/**
 * Send an enquiry.
 *
 * Throws with the field errors the API answered, so the form can put each one
 * where it belongs instead of saying "something went wrong" about an address
 * with no @ in it.
 */
export const sendEnquiry = async (
  body: Enquiry,
): Promise<Record<string, string[]> | null> => {
  const response = await fetch(`${API_V1}/enquiries/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (response.ok) return null;
  if (response.status === 429) return { __all__: ["throttled"] };
  try {
    return (await response.json()) as Record<string, string[]>;
  } catch {
    return { __all__: ["failed"] };
  }
};

export const useShowcaseLot = (code = SHOWCASE_LOT.code): ShowcaseLot => {
  const { data } = useQuery({
    queryKey: ["public-lot", code],
    queryFn: () => publicGet<any>(`/panels/public/lots/${code}/`),
    staleTime: 300_000,
    retry: false,
  });

  if (!data?.lot) return SHOWCASE_LOT;
  return {
    code: data.lot.code,
    product: data.lot.product,
    productName: {
      uz: data.product?.name_uz ?? SHOWCASE_LOT.productName.uz,
      ru: data.product?.name_ru ?? SHOWCASE_LOT.productName.ru,
      en: data.product?.name_en ?? SHOWCASE_LOT.productName.en,
    },
    zone: data.lot.zone,
    netKg: Math.round(data.lot.net_weight_g / 1000),
    sellBy: data.lot.sell_by,
    tempC: data.zone ? Number(data.zone.temp_c) : SHOWCASE_LOT.tempC,
  };
};

export const useShowcaseTrial = (code = SHOWCASE_TRIAL.code): ShowcaseTrial => {
  const { data } = useQuery({
    queryKey: ["public-trial", code],
    queryFn: () => publicGet<any>(`/panels/public/trials/${code}/`),
    staleTime: 300_000,
    retry: false,
  });

  if (!data?.arms?.zeroco) return SHOWCASE_TRIAL;
  return {
    days: data.schedule_days ?? [],
    zeroco: data.arms.zeroco.projection ?? {},
    control: data.arms.control?.projection ?? {},
    observed: data.observed_points ?? 0,
  };
};
