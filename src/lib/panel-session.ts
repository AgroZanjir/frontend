/**
 * Signing in.
 *
 * This module used to mint a stand-in session because there was no backend to
 * issue one. There is now: `POST /auth/oneid/` returns a real JWT and sets the
 * refresh cookie, and every panel is behind it.
 *
 * OneID itself is still not connected, and the platform says so rather than
 * pretending otherwise. With `ONEID_ADAPTER=stub` the backend resolves a
 * *persona* - a seeded person - instead of a state identity, and returns
 * `adapter: "stub"` in the session. The sign-in screen prints that, and
 * `PERSONAS` below is only a default: which person each panel opens as, so a
 * demonstration does not begin with a login form nobody can fill in.
 *
 * When the real adapter lands, `signIn` sends the authorisation code instead
 * of a persona and nothing else in the client changes.
 */

import api from "@/lib/api";
import userStore, { type SessionPayload } from "@/store/UserStore";
import type { PanelDef } from "@/lib/panels";

/** The person each panel opens as while the stub adapter is answering. */
export const PERSONAS: Record<string, string> = {
  f: "n.sharipov", // Nodir Sharipov, org owner at Nodir dehqon xo'jaligi
  h: "s.ergashev", // S. Ergashev, warehouse operator at the Samarqand hub
  z: "d.yusupov", // D. Yusupov, QC inspector - runs the ZEROCO trial
  b: "a.bekmurodov", // A. Bekmurodov, credit officer at Agrobank
  i: "m.karimova", // M. Karimova, claims adjuster at Uzagrosug'urta
  e: "r.tursunov", // R. Tursunov, commercial manager at Zarafshon Agro
  a: "m.tulyaganova", // M. Tulyaganova, platform owner at Agro Zanjir
};

export interface Persona {
  persona: string;
  name: string;
  initials: string;
  org: string;
  party_type: string;
  role: string;
  role_label_key: string;
}

/** Who the stub adapter will accept. Empty once OneID is connected. */
export const fetchPersonas = () =>
  api.get<{ adapter: string; personas: Persona[] }>("/auth/personas/");

/**
 * Sign in and put the session in the store.
 *
 * Throws on refusal - a suspended account, an unknown person - so the screen
 * can say what happened rather than silently doing nothing.
 */
export const signIn = async (identity: {
  persona?: string;
  pinfl?: string;
  code?: string;
}): Promise<SessionPayload> => {
  const session = await api.post<SessionPayload>("/auth/oneid/", identity);
  userStore.getState().applySession(session);
  return session;
};

/** Sign in as the person the panel opens as. */
export const signInToPanel = (panel: PanelDef) =>
  signIn({ persona: PERSONAS[panel.id] ?? "" });

/**
 * Exchange the refresh cookie for a session, once, on load.
 *
 * Called by `App`. Until it answers, `isRestoring` is true and the guards wait
 * - otherwise a reload inside a panel would bounce to the sign-in screen for
 * the half-second before the token came back.
 */
export const restoreSession = async (): Promise<void> => {
  const { setRestored, applySession, user } = userStore.getState();

  // The cached profile is written at sign-in and cleared at sign-out, so it is
  // a reliable hint that there is a cookie worth exchanging. Without it every
  // anonymous visitor to the website paid for a request that could only 401.
  if (!user) {
    setRestored();
    return;
  }

  try {
    const session = await api.post<SessionPayload>("/auth/refresh/", {});
    applySession(session);
  } catch {
    setRestored();
  }
};

/** End the session here and at the backend, which clears the cookie. */
export const signOut = async (): Promise<void> => {
  try {
    await api.post("/auth/logout/");
  } finally {
    userStore.getState().logout();
  }
};

/**
 * The person shown in the sidebar footer.
 *
 * Reads the live session and nothing else. The public panel needs no session,
 * so this returns null there and the footer renders without an avatar rather
 * than with an empty one.
 */
export const usePanelPersona = () => {
  const user = userStore((s) => s.user);
  if (!user) return null;

  const membership = user.memberships[0];
  return {
    name: user.displayName,
    ini: user.initials,
    org: membership?.partyName ?? "",
    partyType: membership?.partyType ?? "operator",
    role: membership?.role ?? "org_member",
    roleLabelKey: membership?.roleLabelKey ?? "r_omember",
  };
};
