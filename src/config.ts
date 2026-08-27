/**
 * Runtime configuration.
 *
 * Everything deployment-specific comes from the environment; nothing about a
 * host belongs in the source. `Base_Url` used to be a constant in App.tsx
 * pointing at a production domain - that is what this replaces.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/** Everything the platform serves lives under one versioned prefix. */
export const API_V1 = `${API_BASE_URL}/api/v1`;

export const APP_NAME = "Agro Zanjir Digital";

/** Stored UTC, rendered here (section 03 of the blueprint). */
export const DISPLAY_TIME_ZONE = "Asia/Tashkent";

/** Uzbek first, Russian and English available. */
export const DEFAULT_LANGUAGE = "uz";
