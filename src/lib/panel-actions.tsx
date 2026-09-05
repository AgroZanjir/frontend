/**
 * Doing something, and being told what happened.
 *
 * Every write on the panels goes through `useAction`. It exists so that forty
 * screens do not each invent their own answer to the same four questions:
 *
 *   is it running        `busy`, so the button can disable itself
 *   did it work          a toast, in the reader's language
 *   why did it not       the API's own words, not "something went wrong"
 *   what does the        the panel dataset is reloaded, so the table behind
 *   screen show now      the form is right before the toast has faded
 *
 * The last one is the whole reason this is a hook and not a helper. A screen
 * that posts and does not refetch shows the reader their own stale table and
 * lets them do it twice.
 */

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

import { ApiError } from "@/lib/api";
import { useRefreshPanelData } from "@/lib/panel-data";
import { usePanelT } from "@/lib/panel-format";
import userStore, { type Capability } from "@/store/UserStore";

export interface Toast {
  id: number;
  tone: "good" | "warn" | "crit";
  title: string;
  detail?: string;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastState | null>(null);

let nextId = 1;

export const PanelToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback(
    (id: number) => setToasts((all) => all.filter((t) => t.id !== id)),
    [],
  );

  const push = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = nextId++;
      setToasts((all) => [...all, { ...toast, id }]);
      // A failure stays until it is dismissed. A reader who missed why a
      // dispatch was refused has lost the only explanation they were given.
      if (toast.tone === "good") {
        window.setTimeout(() => dismiss(id), 4200);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
};

export const usePanelToasts = (): ToastState => {
  const state = useContext(ToastContext);
  if (!state) {
    throw new Error("usePanelToasts outside PanelToastProvider");
  }
  return state;
};

/**
 * The label key for a capability.
 *
 * Not simply `c_<code>`: two of the ten are named short in the label file,
 * which is why the toast said `c_administer` back to the reader. Same two
 * exceptions as the permission matrix's `capShortKey`. Kept honest by a
 * test against the reference catalogue rather than by hand.
 */
export const capabilityLabelKey = (code: string): string =>
  ({ administer: "c_admin", configure: "c_config" })[code] ?? `c_${code}`;

interface ActionOptions {
  /** i18n key for the line the toast shows on success. */
  success: string;
  /** Reload the panel dataset afterwards. On by default; a read has no reason to. */
  refresh?: boolean;
  /**
   * The capability the endpoint requires.
   *
   * The API is the authority and refuses without it; naming it here lets the
   * screen say so before the request. A lab approver holds `approve` and not
   * `capture`, so the observation form was a form that could only ever fail.
   *
   * What it must not do is disable the button and say nothing. A control that
   * is grey and silent is indistinguishable from a broken one, and that is
   * exactly how it was read: "approve does not work" and "suspend does not
   * work" were both a role without the capability. So the button stays live
   * and the click answers - `run` sends no request it knows will be refused.
   */
  capability?: Capability;
}

/**
 * Wrap one write.
 *
 *     const grade = useAction(
 *       (body) => api.post(`/lots/${lot}/grade/`, body),
 *       { success: "g_graded" },
 *     );
 *     <Btn disabled={grade.busy} onClick={() => grade.run({ grade: "A" })} />
 */
export const useAction = <A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  { success, refresh = true, capability }: ActionOptions,
) => {
  const { t } = usePanelT();
  const { push } = usePanelToasts();
  const refreshData = useRefreshPanelData();
  const can = userStore((state) => state.can);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const allowed = capability ? can(capability) : true;

  const run = async (...args: A): Promise<R | undefined> => {
    if (!allowed) {
      push({
        tone: "warn",
        title: t("act_no_cap"),
        detail: `${t(capabilityLabelKey(capability))} - ${t("act_no_cap_d")}`,
      });
      return undefined;
    }
    setBusy(true);
    setError("");
    try {
      const result = await fn(...args);
      if (refresh) await refreshData();
      push({ tone: "good", title: t(success) });
      return result;
    } catch (exc) {
      const detail = describe(exc, t);
      setError(detail);
      push({ tone: "crit", title: t("act_failed"), detail });
      return undefined;
    } finally {
      setBusy(false);
    }
  };

  return {
    run,
    busy,
    error,
    /** False when the session's role does not carry the capability. */
    allowed,
    /**
     * `disabled` for the button: only while the request is in flight.
     *
     * Not carrying the capability deliberately does not disable it - see the
     * note on `capability` above. The click explains instead.
     */
    disabled: busy,
    /** The capability the session is missing, for a screen that wants to say so. */
    missing: allowed ? undefined : capability,
  };
};

/**
 * What went wrong, in words the reader can act on.
 *
 * The API answers a refused dispatch with the lender's name and a refused
 * placement with the zone's capacity. Replacing that with a generic failure
 * would throw away the only part of the response worth reading.
 */
const describe = (exc: unknown, t: (key: string) => string): string => {
  if (exc instanceof ApiError) {
    const body = exc.body as { blockers?: unknown; detail?: unknown } | null;
    const blockers = body?.blockers;
    if (Array.isArray(blockers) && blockers.length) return blockers.join("; ");
    if (blockers && typeof blockers === "object") {
      return Object.entries(blockers as Record<string, string[]>)
        .map(([code, why]) => `${code}: ${(why ?? []).join(", ")}`)
        .join("; ");
    }
    // DRF field errors: {"net_weight_g": ["Ensure this value is >= 1."]}
    if (body && typeof body === "object" && !body.detail) {
      const fields = Object.entries(body as Record<string, unknown>)
        .filter(([, value]) => Array.isArray(value))
        .map(([field, value]) => `${field}: ${(value as string[]).join(", ")}`);
      if (fields.length) return fields.join("; ");
    }
    return exc.message;
  }
  return (exc as Error)?.message || t("err_generic");
};
