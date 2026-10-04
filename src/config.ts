/**
 * Public, build-time configuration.
 *
 * Production uses the site's own origin. The edge routes /api/ to Django, so
 * the same image works on every server without baking a hostname into it.
 * .env.development supplies the local Django address when running Vite.
 * Vite exposes these values to the browser; never put secrets here.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/+$/,
  "",
);

/** Everything the platform serves lives under one versioned prefix. */
export const API_V1 = `${API_BASE_URL}/api/v1`;

export const APP_NAME = "Agro Zanjir Digital";

/** Stored UTC, rendered here (section 03 of the blueprint). */
export const DISPLAY_TIME_ZONE = "Asia/Tashkent";

/** Uzbek first, Russian and English available. */
export const DEFAULT_LANGUAGE = "uz";
