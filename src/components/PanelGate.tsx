/**
 * Route guard for a panel.
 *
 * Two gates, in the order the design states them: a session (OneID), then
 * membership of a party the panel belongs to (verification). Someone signed in
 * but in the wrong panel is sent to `/forbidden` with an explanation, not
 * bounced back to a sign-in screen they have already passed.
 *
 * A convenience, not a security boundary - the API enforces the same rules.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";

import { canOpenPanel, type PanelDef } from "@/lib/panels";
import userStore from "@/store/UserStore";

const PanelGate = ({ panel }: { panel: PanelDef }) => {
  const location = useLocation();
  const isAuthenticated = userStore((s) => s.isAuthenticated);
  const isRestoring = userStore((s) => s.isRestoring);
  const memberships = userStore((s) => s.user?.memberships) ?? [];

  if (panel.open) return <Outlet />;

  // The refresh cookie has not been exchanged yet. Deciding now would send a
  // signed-in reader to the sign-in screen for half a second.
  if (isRestoring && !isAuthenticated) return null;

  if (!isAuthenticated) {
    return (
      <Navigate to={`/signin/${panel.id}`} state={{ from: location }} replace />
    );
  }

  if (!canOpenPanel(panel, memberships)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Signed in, but the organisation has not cleared verification. The waiting
  // screen shows which check is outstanding; an empty panel would not.
  const admitted = memberships.some(
    (m) => m.partyVerification === "verified" || m.scope === "platform",
  );
  if (!admitted) {
    return <Navigate to={`/pending/${panel.id}`} replace />;
  }

  return <Outlet />;
};

export default PanelGate;
