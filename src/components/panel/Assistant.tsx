/**
 * The assistant inside the operator panels.
 *
 * A different animal from the website's, and the difference is the whole
 * reason it exists. The website's answers a stranger with no account from a
 * written brief. This one answers somebody who is signed in, from their own
 * records - and only theirs. The scoping is the backend's, enforced in the
 * query by the same `visible_lots` the panel screens use, so this component
 * cannot widen it and does not try.
 *
 * What makes it worth having rather than a worse way to read the screens: the
 * screens are one cluster each. "Which of my lots are pledged and go off this
 * month" is the lot table, the lien register and a date filter - three screens
 * and a piece of paper today, one question here.
 *
 * Two things it says out loud, because an operator has to be able to trust it:
 *
 *   1. **It reads; it does not write.** Nothing it can do changes a record.
 *      The footnote says so on every screen.
 *   2. **Opening a passport is logged.** Under the operator's own name, with
 *      the same line the panel writes. "Who looked at my lot" is a question
 *      this platform answers, and being asked through an assistant is not an
 *      exemption.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import { usePanelT } from "@/lib/panel-format";
import {
  askPanel,
  useAssistantState,
  type Lookup,
  type Turn,
} from "@/lib/assistant";
import { useConversation, type Dispatch } from "@/lib/use-conversation";
import { cn } from "@/lib/utils";

/**
 * The three openings. Each one is a question the panels cannot answer in a
 * single screen - which is the case for the thing existing.
 */
const OPENERS = ["w_ai_p_q1", "w_ai_p_q2", "w_ai_p_q3"];

/** Which lookup is running, in words. */
const ACTIVITY: Record<string, string> = {
  find_lots: "w_ai_t_lots",
  lot_passport: "w_ai_t_pass",
  find_zones: "w_ai_t_zones",
  find_liens: "w_ai_t_liens",
};

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
 * The lots an answer actually opened, as links to their passports.
 *
 * Built from what the backend reported rather than from anything in the
 * answer's text: a code a model wrote into a sentence is a code that can be
 * wrong, and this one has to land on the record it claims to. Only passports
 * appear - a survey read forty rows and linking all of them is a wall.
 */
const Evidence = ({ lookups }: { lookups: Lookup[] }) => {
  const { t } = usePanelT();
  const lots = lookups.filter((l) => l.name === "lot_passport" && l.code);
  if (!lots.length) return null;

  return (
    <div className="pai-evid">
      {lots.map((lot) => (
        <Link key={lot.code} className="pai-eviden" to={`/lot/${lot.code}`}>
          <PanelIcon name="lot" />
          <span className="mono">{lot.code}</span>
          <span>{t("w_ai_p_open")}</span>
        </Link>
      ))}
    </div>
  );
};

const Bubble = ({ turn }: { turn: Turn }) => {
  const { t } = usePanelT();
  const failed = turn.state === "error" || turn.state === "blocked";

  return (
    <div className={cn("pai-turn", `pai-${turn.role}`, failed && "pai-bad")}>
      <div className="pai-who">
        {t(turn.role === "user" ? "w_ai_you" : "w_ai_me")}
      </div>
      {/* `aria-busy` while the tokens are still arriving, so a screen reader is
          told the answer is unfinished rather than read a half-sentence as
          though it were the whole one. */}
      <div className="pai-body" aria-busy={turn.state === "streaming"}>
        {turn.content ? (
          <Prose text={turn.content} />
        ) : (
          <p className="pai-wait">
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

const Body = ({ onClose }: { onClose: () => void }) => {
  const { t, lang } = usePanelT();
  const { pathname } = useLocation();
  const { data: state, isLoading } = useAssistantState();

  const dispatch = useCallback<Dispatch>(
    (question, history, handlers, signal) =>
      askPanel({ question, history, lang, panel: pathname }, handlers, signal),
    [lang, pathname],
  );
  const { turns, draft, setDraft, activity, busy, send, stop } =
    useConversation(dispatch);

  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    field.current?.focus();
  }, []);

  useEffect(() => {
    const box = scroller.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [turns, activity]);

  const unavailable = !isLoading && state && !state.available;

  return (
    <div
      className="pai-panel"
      role="dialog"
      aria-label={t("w_ai_p_title")}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <header className="pai-head">
        <div>
          <div className="pai-title">
            <PanelIcon name="srch" />
            {t("w_ai_p_title")}
          </div>
          <div className="pai-sub">{t("w_ai_p_sub")}</div>
        </div>
        <button
          type="button"
          className="pai-x"
          onClick={onClose}
          aria-label={t("w_ai_close")}
        >
          <PanelIcon name="chev" />
        </button>
      </header>

      <div className="pai-scroll" ref={scroller} aria-live="polite">
        {unavailable ? (
          <div className="pai-off">
            <PanelIcon name="lock" />
            <p>{t("w_ai_p_off")}</p>
          </div>
        ) : (
          <>
            {!turns.length && (
              <div className="pai-open">
                <p className="pai-lede">{t("w_ai_p_lede")}</p>
                <div className="pai-chips">
                  {OPENERS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className="pai-chip"
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
              <div className="pai-act">
                <PanelIcon name="srch" />
                <span>
                  {t(ACTIVITY[activity.name] ?? "w_ai_t_lots")}
                  {activity.code ? (
                    <>
                      {" "}
                      <span className="mono">{activity.code}</span>
                    </>
                  ) : null}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {!unavailable && (
        <form
          className="pai-ask"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <textarea
            ref={field}
            className="inp pai-field"
            rows={1}
            value={draft}
            placeholder={t("w_ai_p_ph")}
            aria-label={t("w_ai_p_ph")}
            maxLength={2000}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
          />
          {busy ? (
            <button type="button" className="btn btn-sm pai-go" onClick={stop}>
              {t("w_ai_stop")}
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-p btn-sm pai-go"
              disabled={!draft.trim()}
              aria-label={t("w_ai_send")}
            >
              <PanelIcon name="arr" />
            </button>
          )}
        </form>
      )}

      <p className="pai-note">{t("w_ai_p_note")}</p>
    </div>
  );
};

/**
 * The launcher and the panel it opens.
 *
 * No invitation bubble here, unlike the website's. An operator is at work on a
 * screen they came to use; a card that appears beside their sidebar to suggest
 * a conversation is an interruption, not a discovery. They find this the way
 * they find everything else in the shell - it is in the corner, and it has a
 * word on it.
 *
 * The body unmounts on close, which discards the transcript and cancels
 * anything still streaming.
 */
const PanelAssistant = () => {
  const { t } = usePanelT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={cn("pai-dock", open && "on")}>
      {open && <Body onClose={() => setOpen(false)} />}
      <button
        type="button"
        className="pai-launch"
        aria-expanded={open}
        aria-label={t(open ? "w_ai_close" : "w_ai_p_title")}
        onClick={() => setOpen((was) => !was)}
      >
        <PanelIcon name="srch" />
        <span className="pai-launch-t">{t("w_ai_open")}</span>
      </button>
    </div>
  );
};

export default PanelAssistant;
