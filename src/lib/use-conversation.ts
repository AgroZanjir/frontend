/**
 * The conversation state machine both assistants run.
 *
 * The two widgets look nothing alike - one is the website's serif-and-navy
 * corner panel, the other sits inside the operator design system - but what
 * happens when somebody presses enter is the same in both: push the question
 * and an empty answer, stream tokens into the answer, show what is being
 * looked up while it is being looked up, and end the turn exactly once
 * whatever happens. That is the part worth having one copy of. Two copies is
 * how one of them ends up not cancelling its request on close.
 *
 * The chrome stays with each widget. Only this moves.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ERROR_KEYS,
  type Activity,
  type Handlers,
  type Turn,
} from "@/lib/assistant";
import { usePanelT } from "@/lib/panel-format";

/** Whatever actually posts the question. `ask` or `askPanel`, bound by the widget. */
export type Dispatch = (
  question: string,
  history: Turn[],
  handlers: Handlers,
  signal: AbortSignal,
) => Promise<void>;

export const useConversation = (dispatch: Dispatch) => {
  const { t } = usePanelT();

  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [busy, setBusy] = useState(false);

  const abort = useRef<AbortController | null>(null);

  // Whatever is in flight belongs to a panel that is being unmounted.
  useEffect(() => () => abort.current?.abort(), []);

  const send = useCallback(
    (question: string) => {
      const text = question.trim();
      if (!text || busy) return;

      // An errored turn is not part of the conversation: replaying "the
      // assistant could not be reached" as something it said would have it
      // apologising for a network fault on every turn after.
      const history = turns.filter((turn) => turn.state !== "error");
      setTurns([
        ...turns,
        { role: "user", content: text },
        { role: "assistant", content: "", state: "streaming" },
      ]);
      setDraft("");
      setBusy(true);

      // Every handler rewrites the last turn, which is the one just pushed.
      const last = (change: (turn: Turn) => Turn) =>
        setTurns((current) =>
          current.map((turn, i) =>
            i === current.length - 1 ? change(turn) : turn,
          ),
        );

      const controller = new AbortController();
      abort.current = controller;

      void dispatch(
        text,
        history,
        {
          onDelta: (chunk) =>
            last((turn) => ({ ...turn, content: turn.content + chunk })),
          onActivity: setActivity,
          onDone: (lookups) =>
            last((turn) => ({ ...turn, state: "done", lookups })),
          onBlocked: () =>
            last((turn) => ({
              ...turn,
              state: "blocked",
              content: t("w_ai_blocked"),
            })),
          onError: (code) =>
            last((turn) => ({
              ...turn,
              state: "error",
              // A turn that had already started saying something keeps it, with
              // the reason appended. Replacing half an answer with an error
              // throws away the half that was true.
              content: [turn.content, t(ERROR_KEYS[code] ?? "w_ai_e_failed")]
                .filter(Boolean)
                .join("\n\n"),
            })),
        },
        controller.signal,
      ).finally(() => {
        setBusy(false);
        setActivity(null);
        abort.current = null;
      });
    },
    [busy, dispatch, t, turns],
  );

  const stop = useCallback(() => {
    abort.current?.abort();
    setTurns((current) =>
      current.map((turn, i) => {
        if (i !== current.length - 1 || turn.state !== "streaming") return turn;
        // Stopped before the first token. Left as a finished turn it would be
        // an empty bubble on three waiting dots that never resolve.
        return turn.content
          ? { ...turn, state: "done" }
          : { ...turn, state: "error", content: t("w_ai_e_cut") };
      }),
    );
  }, [t]);

  return { turns, draft, setDraft, activity, busy, send, stop };
};
