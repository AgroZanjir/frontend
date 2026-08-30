/**
 * The assistant on the public website.
 *
 * A panel in the corner of every public page, and nowhere else: the operator
 * panels have a dataset, a session and eight screens built to read it, and a
 * chat box over the top of that would be a second, worse way to ask the same
 * questions. This one is for the visitor who has no account and one question -
 * what the programme is, what it handles, and what the code on the crate in
 * front of them means.
 *
 * Three decisions worth keeping:
 *
 *   1. **It asks whether it exists before offering a text box.** A deployment
 *      with no key configured prints one line saying the assistant is not
 *      connected. This project does not ship demonstrations that can pass for
 *      the real thing, and a chat box that fails on the first question is one.
 *   2. **The transcript is state, not storage.** It lives here for as long as
 *      the tab is open, goes up with each question because the API is
 *      stateless, and is written down nowhere - not here, not on the server.
 *   3. **A lookup is shown as it happens and linked when it lands.** When the
 *      answer reads a lot, the panel says so while it is reading and then
 *      offers the passport itself. The point of the site is that provenance is
 *      public; the assistant should hand a reader the evidence, not a summary
 *      of it.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import { usePanelT } from "@/lib/panel-format";
import {
  ask,
  useAssistantState,
  type Lookup,
  type Turn,
} from "@/lib/assistant";
import { useConversation, type Dispatch } from "@/lib/use-conversation";
import { cn } from "@/lib/utils";

/** The three openings. The middle one is a lot code, so it exercises a lookup. */
const OPENERS = ["w_ai_q1", "w_ai_q2", "w_ai_q3"];

/**
 * The mark on the launcher: the brand's sprouting stroke with a spark beside
 * it. Drawn here rather than added to the panel icon set, which is the
 * operator product's and has no assistant in it.
 */
const Spark = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 20v-7" />
    <path d="M11 13s0-4.5 4.5-4.5c0 0 0 4.5-4.5 4.5z" />
    <path d="M11 16s0-3.6-4.4-3.6c0 0 0 3.6 4.4 3.6z" />
    <path d="M17.5 3.5 18.4 6l2.5.9-2.5.9-.9 2.5-.9-2.5L14.1 7l2.5-.9z" />
  </svg>
);

/** A paragraph per blank line. The brief asks for prose, and this renders it. */
const Prose = ({ text }: { text: string }) => (
  <>
    {text
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((para, i) => (
        <p key={i}>{para}</p>
      ))}
  </>
);

/**
 * What a finished answer read, as links to the pages that hold it.
 *
 * Built from the lookups the backend reported rather than from anything in the
 * answer's text: a URL a model composed is a URL that can be wrong, and this
 * one has to land on the record it claims to.
 */
const Evidence = ({ lookups }: { lookups: Lookup[] }) => {
  const { t } = usePanelT();
  const lots = lookups.filter((l) => l.name === "lookup_lot" && l.code);
  if (!lots.length) return null;

  return (
    <div className="ai-evid">
      {lots.map((lot) => (
        <Link
          key={lot.code}
          className="ai-eviden"
          to={`/public/passport?lot=${encodeURIComponent(lot.code)}`}
        >
          <PanelIcon name="pub" />
          <span className="mono">{lot.code}</span>
          <span>{t("w_ai_passport")}</span>
        </Link>
      ))}
    </div>
  );
};

const Bubble = ({ turn }: { turn: Turn }) => {
  const { t } = usePanelT();
  const failed = turn.state === "error" || turn.state === "blocked";

  return (
    <div className={cn("ai-turn", `ai-${turn.role}`, failed && "ai-bad")}>
      <div className="ai-who">
        {t(turn.role === "user" ? "w_ai_you" : "w_ai_me")}
      </div>
      {/* `aria-busy` while the tokens are still arriving, so a screen reader
          is told the answer is unfinished rather than read a half-sentence as
          though it were the whole one. */}
      <div className="ai-body" aria-busy={turn.state === "streaming"}>
        {turn.content ? (
          <Prose text={turn.content} />
        ) : (
          <p className="ai-wait">
            <i />
            <i />
            <i />
          </p>
        )}
      </div>
      {turn.lookups?.length ? <Evidence lookups={turn.lookups} /> : null}
    </div>
  );
};

const AssistantPanel = ({ onClose }: { onClose: () => void }) => {
  const { t, lang } = usePanelT();
  const { pathname } = useLocation();
  const { data: state, isLoading } = useAssistantState();

  // The transport, bound to where the reader is. Everything that happens after
  // it is `useConversation`, which the panels' assistant runs too.
  const dispatch = useCallback<Dispatch>(
    (question, history, handlers, signal) =>
      ask({ question, history, lang, page: pathname }, handlers, signal),
    [lang, pathname],
  );
  const { turns, draft, setDraft, activity, busy, send, stop } =
    useConversation(dispatch);

  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    field.current?.focus();
  }, []);

  // Follow the answer down. `scrollTop` rather than `scrollIntoView`, which
  // scrolls the page behind the panel too.
  useEffect(() => {
    const box = scroller.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [turns, activity]);

  const unavailable = !isLoading && state && !state.available;

  return (
    <div
      className="ai-panel"
      role="dialog"
      aria-label={t("w_ai_title")}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <header className="ai-head">
        <div>
          <div className="ai-title">{t("w_ai_title")}</div>
          <div className="ai-sub">{t("w_ai_sub")}</div>
        </div>
        <button
          type="button"
          className="ai-x"
          onClick={onClose}
          aria-label={t("w_ai_close")}
        >
          <PanelIcon name="chev" />
        </button>
      </header>

      <div className="ai-scroll" ref={scroller} aria-live="polite">
        {unavailable ? (
          <div className="ai-off">
            <PanelIcon name="lock" />
            <p>{t("w_ai_off")}</p>
          </div>
        ) : (
          <>
            {!turns.length && (
              <div className="ai-open">
                <p className="ai-lede">{t("w_ai_lede")}</p>
                <div className="ai-chips">
                  {OPENERS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className="chip"
                      onClick={() => send(t(key))}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((turn, i) => (
              <Bubble key={i} turn={turn} />
            ))}

            {activity && (
              <div className="ai-act">
                <PanelIcon name="srch" />
                <span>
                  {t(
                    activity.name === "lookup_trial"
                      ? "w_ai_reading_trial"
                      : "w_ai_reading_lot",
                  )}{" "}
                  <span className="mono">{activity.code}</span>
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {!unavailable && (
        <form
          className="ai-ask"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <textarea
            ref={field}
            className="inp ai-field"
            rows={1}
            value={draft}
            placeholder={t("w_ai_ph")}
            aria-label={t("w_ai_ph")}
            maxLength={2000}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, shift+enter breaks the line. On a phone the key
              // is a newline key and the button is what sends.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
          />
          {busy ? (
            <button type="button" className="btn btn-sm ai-go" onClick={stop}>
              {t("w_ai_stop")}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-p btn-sm ai-go"
              disabled={!draft.trim()}
              aria-label={t("w_ai_send")}
            >
              <PanelIcon name="arr" />
            </button>
          )}
        </form>
      )}

      <p className="ai-note">{t("w_ai_note")}</p>
    </div>
  );
};

/**
 * Whether this browser has already been introduced to the assistant.
 *
 * `sessionStorage`, so the invitation appears once for a visit rather than
 * once for a page - eleven pages and a nag on each of them is worse than not
 * being noticed at all. A browser that refuses storage is treated as one that
 * has already been asked: without a way to remember having nagged, the honest
 * default is not to.
 */
const MET = "az-ai-met";

const alreadyMet = (): boolean => {
  try {
    return sessionStorage.getItem(MET) === "1";
  } catch {
    return true;
  }
};

const rememberMet = () => {
  try {
    sessionStorage.setItem(MET, "1");
  } catch {
    /* private browsing, or storage switched off. Nothing to do about it. */
  }
};

/**
 * The launcher, the invitation beside it, and the panel it opens.
 *
 * The panel unmounts when it is closed, which is what discards the transcript
 * and cancels anything still streaming. Keeping it mounted to preserve the
 * conversation would mean a chat log sitting in memory behind every page of
 * the website for as long as the tab is open, which is not a trade this
 * product should make quietly.
 */
const Assistant = () => {
  const { t } = usePanelT();
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);

  // A beat after the page settles, not on paint: an invitation that arrives
  // with the hero competes with it, and this is the least important thing on
  // the screen until the reader has run out of what they came for.
  useEffect(() => {
    if (alreadyMet()) return;
    const timer = window.setTimeout(() => setPeek(true), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const dismiss = () => {
    setPeek(false);
    rememberMet();
  };

  const toggle = () => {
    dismiss();
    setOpen((was) => !was);
  };

  return (
    <div className={cn("ai-dock", open && "on", peek && "new")}>
      {open && <AssistantPanel onClose={() => setOpen(false)} />}

      {!open && peek && (
        <div className="ai-peek">
          <button type="button" className="ai-peek-t" onClick={toggle}>
            {t("w_ai_peek")}
          </button>
          <button
            type="button"
            className="ai-peek-x"
            onClick={dismiss}
            aria-label={t("w_ai_close")}
          >
            <PanelIcon name="chev" />
          </button>
        </div>
      )}

      <button
        type="button"
        className="ai-launch"
        aria-expanded={open}
        aria-label={t(open ? "w_ai_close" : "w_ai_open")}
        onClick={toggle}
      >
        <Spark />
        <span className="ai-launch-t">{t("w_ai_open")}</span>
      </button>
    </div>
  );
};

export default Assistant;
