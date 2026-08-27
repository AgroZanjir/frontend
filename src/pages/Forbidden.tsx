import { Link } from "react-router-dom";

import userStore from "@/store/UserStore";

/**
 * Shown when a signed-in user opens a screen their roles do not cover. Says
 * which roles they hold, because "access denied" with no explanation generates
 * a support call every time.
 */
const Forbidden = () => {
  const memberships = userStore((state) => state.user?.memberships ?? []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-3xl font-semibold">Not your screen</h1>
      <p className="max-w-md text-muted-foreground">
        This panel is for a different party, and this module needs a role you do
        not hold.
      </p>
      {memberships.length > 0 && (
        <p className="text-sm text-muted-foreground">
          You hold:{" "}
          {memberships.map((m) => `${m.role} (${m.partyType})`).join(", ")}
        </p>
      )}
      <Link to="/panels" className="text-primary underline underline-offset-4">
        Back to the panels
      </Link>
    </div>
  );
};

export default Forbidden;
