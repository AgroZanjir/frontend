import { Navigate, Outlet, useLocation } from "react-router-dom";

import userStore, { type Role } from "@/store/UserStore";

interface ProtectedRouteProps {
  /** Any one of these is enough. Omit to require only a signed-in user. */
  allowedRoles?: Role[];
  /** Restrict the check to one facility, for hub-scoped screens. */
  facilityId?: string;
  /** Where to send someone with no session. The panel index is where every
      sign-in starts, because the gate is per panel. */
  redirectTo?: string;
}

/**
 * Route guard. Note this is a convenience, not a security boundary - the API
 * enforces the same rules server-side, because a route guard is one devtools
 * edit away from being bypassed.
 */
const ProtectedRoute = ({
  allowedRoles,
  facilityId,
  redirectTo = "/panels",
}: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = userStore((state) => state.isAuthenticated);
  const hasRole = userStore((state) => state.hasRole);

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back.
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && !hasRole(allowedRoles, facilityId)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
