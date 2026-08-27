/**
 * The formatting the panels share.
 *
 * Ported from the prototype's helpers. Numbers are grouped the way the reader
 * expects in their own language, dates are compared against the dataset's
 * fixed "today", and money keeps its currency beside it rather than being
 * silently assumed to be UZS.
 */

import { useTranslation } from "react-i18next";

import { useOptionalPanelData } from "@/lib/panel-context";
import { TODAY } from "@/lib/panel-data";
import type {
  Lang,
  Lot,
  LotEvent,
  Product,
  ProductCode,
} from "@/lib/panel-types";

/** Whole days between two dates, either of which may be a string. */
export const dayDiff = (a: Date | string, b: Date | string): number =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

/** Days left in the lot's sales window, or null if it has no window. */
export const daysLeft = (l: Lot): number | null =>
  l.u ? dayDiff(TODAY, l.u) : null;

/** Days the lot has been in storage, or null if it was never placed. */
export const storageAge = (l: Lot): number | null =>
  l.pl ? dayDiff(l.pl, TODAY) : null;

/** uz and ru both group with a space; en groups with a comma. */
export const numberFormat = (lang: Lang, n: number): string =>
  new Intl.NumberFormat(lang === "en" ? "en-US" : "ru-RU").format(n);

/**
 * The product's name in the reader's language.
 *
 * The catalogue is data now, so it is passed in: a product added in the admin
 * appears on the panels without a deployment, and a screen rendered outside
 * the provider (the public website shares these helpers) falls back to the
 * code rather than crashing.
 */
export const productName = (
  lang: Lang,
  p: ProductCode,
  products: Record<ProductCode, Product> | undefined,
): string => {
  const product = products?.[p];
  return product ? product[lang] || product.en : p;
};

/** Narrow whatever i18next reports to the three languages the data carries. */
export const asLang = (code: string | undefined): Lang => {
  const base = (code ?? "uz").split("-")[0];
  return base === "ru" || base === "en" ? base : "uz";
};

/**
 * Panel strings live under the `panel` key of each locale file, so the
 * prototype's 688 short keys (`f_dash`, `qc_brix`, ...) cannot collide with
 * the app's existing flat ones.
 */
/** `132` -> `2 h 12 min`, in whichever language is showing. */
export const formatDuration = (
  minutes: number,
  t: (key: string) => string,
): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h} ${t("dur_h")}` : "", m ? `${m} ${t("dur_min")}` : ""]
    .filter(Boolean)
    .join(" ");
};

export const usePanelT = () => {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: "panel" });
  const lang = asLang(i18n.resolvedLanguage ?? i18n.language);
  const data = useOptionalPanelData();

  const nf = (n: number) => numberFormat(lang, n);

  return {
    t,
    lang,
    nf,
    /** Product name in the reader's language. */
    pn: (p: ProductCode) => productName(lang, p, data?.PRODUCTS),
    /** `1 200 000 UZS` - the currency is never implied. */
    money: (n: number, cur: "UZS" | "USD" = "UZS") =>
      `${nf(n)} ${cur === "USD" ? "$" : t("uzs")}`,
    /** Millions, for figures where the last six digits are noise. */
    mln: (n: number) => `${nf(Math.round(n / 1_000_000))} mln`,
    /** A span of minutes, worded in the reader's language. */
    dur: (minutes: number) => formatDuration(minutes, t),
    /** One line of a lot's history, composed in the reader's language. */
    ev: (event: LotEvent) => eventMessage(event, { t, nf, lang }),
  };
};

/* ===================================================================
   EVENT MESSAGES

   The API stores what happened - `{"zone": "Z-ZEROCO-01", "position":
   "B-06", "temp_c": 0.4}` - and the sentence is written here, in the
   language the reader chose. The prototype stored the sentence, which
   meant a Russian-speaking broker read a lot's history in Uzbek.

   Anything this composer does not recognise falls back to the payload's
   own values rather than to an empty line: an unfamiliar event type is
   still evidence, and hiding it would be worse than rendering it plainly.
   =================================================================== */

type Composer = {
  t: (key: string) => string;
  nf: (n: number) => string;
  lang: Lang;
};

const kilos = (grams: unknown, { t, nf }: Composer): string =>
  typeof grams === "number" ? `${nf(Math.round(grams / 1000))} ${t("kg")}` : "";

export const eventMessage = (event: LotEvent, c: Composer): string => {
  // A message the API composed (or a fixture carried) wins: nothing here
  // should overwrite text that was authored deliberately.
  if (event.m) return event.m;

  const p = event.payload ?? {};
  const { t, nf } = c;
  const parts: (string | false | undefined)[] = [];

  switch (event.t) {
    case "registered":
      parts.push(
        typeof p.gross_weight_g === "number" &&
          `${t("w_gross")} ${kilos(p.gross_weight_g, c)}`,
        typeof p.net_weight_g === "number" &&
          `${t("w_net")} ${kilos(p.net_weight_g, c)}`,
        p.idempotency_key && `${t("ev_idem")} ${p.idempotency_key}`,
      );
      break;
    case "sampled": {
      const m = (p.measurements ?? {}) as Record<string, number>;
      parts.push(
        m.brix !== undefined && `Brix ${m.brix}`,
        m.calibre_kg !== undefined &&
          `${t("ev_calibre")} ${m.calibre_kg} ${t("kg")}`,
        p.defect_pct !== undefined && `${t("qc_def")} ${p.defect_pct}%`,
      );
      break;
    }
    case "graded":
      parts.push(
        p.grade && `${t("pp_grade")} ${p.grade}`,
        kilos(p.net_weight_g, c),
        typeof p.photos === "number" &&
          p.photos > 0 &&
          `${p.photos} ${t("ev_photos")}`,
      );
      break;
    case "placed":
    case "removed":
      parts.push(
        p.zone as string,
        p.position as string,
        p.temp_c !== undefined && `${p.temp_c} °C`,
        p.rh_pct !== undefined && `${p.rh_pct}% RH`,
      );
      break;
    case "trial_start":
      parts.push(
        p.trial as string,
        p.arm === "zeroco"
          ? t("t_armz")
          : p.arm === "control"
            ? t("t_armc")
            : "",
        p.paired_lot && `${t("ev_pair")} ${p.paired_lot}`,
      );
      break;
    case "trial_observed":
      parts.push(
        p.day !== undefined && `${t("o_dayidx")} ${p.day}`,
        p.weight_loss_pct && `${t("t_loss")} ${p.weight_loss_pct}%`,
        p.firmness_n && `${t("t_firm")} ${p.firmness_n} N`,
      );
      break;
    case "pledged":
    case "lien_released":
      parts.push(
        p.application as string,
        typeof p.amount_minor === "number" &&
          `${nf(Math.round(p.amount_minor / 100))} ${t("uzs")}`,
        p.kind === "inventory"
          ? t("k_inventory")
          : p.kind === "pre_export"
            ? t("k_pre_export")
            : "",
      );
      break;
    case "inspected":
      parts.push(
        p.day !== undefined && `${t("o_dayidx")} ${p.day}`,
        p.weight_loss_pct !== undefined &&
          `${t("o_weight")} −${p.weight_loss_pct}%`,
        p.firmness_n !== undefined && `${t("t_firm")} ${p.firmness_n} N`,
        p.defects === 0 && t("ev_nodef"),
      );
      break;
    case "excursion":
      parts.push(
        p.zone as string,
        p.peak_c !== undefined && `${p.peak_c} °C`,
        typeof p.duration_min === "number" && formatDuration(p.duration_min, t),
        p.threshold_c !== undefined && `${t("ev_limit")} ${p.threshold_c} °C`,
        p.resolved === true && t("ev_resolved"),
      );
      break;
    case "dispatched":
    case "delivered":
      parts.push(
        p.shipment as string,
        p.vehicle as string,
        p.destination as string,
        kilos(p.quantity_g, c),
      );
      break;
    case "claim_filed":
      parts.push(
        p.claim as string,
        p.policy as string,
        typeof p.amount_minor === "number" &&
          `${nf(Math.round(p.amount_minor / 100))} ${t("uzs")}`,
      );
      break;
    case "document_issued":
      parts.push(
        p.type && t(`doc_${p.type}`),
        p.reference as string,
        p.expires_on && `${t("ev_expires")} ${p.expires_on}`,
      );
      break;
    case "written_off":
      parts.push(p.reason && t(`ev_${p.reason}`), p.excursion as string);
      break;
    default:
      parts.push(
        ...Object.entries(p)
          .filter(([, value]) => value !== "" && value !== null)
          .map(([key, value]) => `${key}: ${String(value)}`),
      );
  }

  return parts.filter(Boolean).join(" · ");
};
