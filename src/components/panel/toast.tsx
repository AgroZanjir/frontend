/**
 * The toast stack.
 *
 * Bottom right, above everything, one column. It uses the prototype's own
 * alert styles rather than a new visual language: a failed dispatch should
 * look like the alerts already on the screen it happened on.
 */

import PanelIcon from "@/components/panel/icons";
import { usePanelToasts } from "@/lib/panel-actions";

const ICON = { good: "check", warn: "cond", crit: "alert" } as const;

const PanelToasts = () => {
  const { toasts, dismiss } = usePanelToasts();
  if (!toasts.length) return null;

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`alert a-${toast.tone}`}>
          <PanelIcon name={ICON[toast.tone]} />
          <div style={{ minWidth: 0 }}>
            <div className="at">{toast.title}</div>
            {toast.detail && <div className="ad">{toast.detail}</div>}
          </div>
          <button
            type="button"
            className="toast-x"
            aria-label="Dismiss"
            onClick={() => dismiss(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default PanelToasts;
