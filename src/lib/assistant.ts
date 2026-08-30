/**
 * Both assistants, from the browser's side.
 *
 * `ask` is the public website's: no session, no scope. `askPanel` is the
 * operator panels', which needs the access token on the request and has to
 * survive that token expiring mid-conversation - a tab left open past the
 * half-hour otherwise loses an answer to a 401 rather than to anything real.
 * Everything below the two entry points is shared, because the stream they
 * read is the same stream.
 *
 * `GET /assistant/` says whether there is a model behind this at all, and both
 * widgets ask it before rendering a text box - a deployment with no key
 * configured shows a line saying so rather than a chat panel that fails on the
 * first question. `POST .../ask/` streams the answer.
 *
 * Server-sent events over `fetch`, not `EventSource`: the transcript has to go
 * up with the question and `EventSource` can only issue a GET. Which means
 * parsing the frames here - twenty lines, and they are below.
 *
 * Nothing is persisted. The transcript lives in the component's state for as
 * long as the tab is open and is sent back with each question because the API
 * is stateless; the backend stores none of it. That is deliberate, and
 * `apps/assistant/models.py` says why.
 */

import { useQuery } from "@tanstack/react-query";

import { API_V1 } from "@/config";
import { refreshSession } from "@/lib/api";
import userStore from "@/store/UserStore";

export interface AssistantState {
  adapter: string;
  model: string;
  available: boolean;
  /** What an operator has to fix. Only meaningful when `available` is false. */
  reason: string;
}

/** A lookup the answer actually made, so the panel can link to what it read. */
export interface Lookup {
  name: string;
  code: string;
}

export interface Turn {
  role: "user" | "assistant";
  content: string;
  /** `error` and `blocked` are rendered differently; neither is an answer. */
  state?: "streaming" | "done" | "error" | "blocked";
  lookups?: Lookup[];
}

/** What the panel shows while a lookup is in flight, and clears when it lands. */
export interface Activity {
  name: string;
  code: string;
}

/**
 * `onError` is handed a code, never a sentence.
 *
 * Same rule the panels keep for lot events: the backend reports what happened
 * and the wording is chosen here, in the language the reader picked. An
 * unrecognised code falls back to `failed`, which is true of all of them.
 */
export type ErrorCode =
  | "unavailable"
  | "busy"
  | "config"
  | "network"
  | "upstream"
  | "interrupted"
  | "too_many_lookups"
  | "empty"
  | "signed_out"
  | "failed";

/**
 * A code to the key that words it. Here rather than in a component because
 * both widgets need the same mapping, and two copies of it would be one copy
 * and one that quietly stopped covering a code.
 */
export const ERROR_KEYS: Record<ErrorCode, string> = {
  unavailable: "w_ai_e_off",
  busy: "w_ai_e_busy",
  config: "w_ai_e_config",
  network: "w_ai_e_net",
  upstream: "w_ai_e_up",
  interrupted: "w_ai_e_cut",
  too_many_lookups: "w_ai_e_loops",
  empty: "w_ai_e_empty",
  signed_out: "w_ai_e_out",
  failed: "w_ai_e_failed",
};

export interface Handlers {
  onDelta: (text: string) => void;
  onActivity: (activity: Activity | null) => void;
  onDone: (lookups: Lookup[]) => void;
  onError: (code: ErrorCode) => void;
  onBlocked: () => void;
}

/**
 * Whether there is a model behind this.
 *
 * `retry: false` because the answer to "is the assistant configured" does not
 * change while the page is open, and three failed attempts at a backend that
 * is down only delay the honest line the panel is going to print anyway.
 */
export const useAssistantState = () =>
  useQuery({
    queryKey: ["assistant-state"],
    retry: false,
    staleTime: 600_000,
    queryFn: async (): Promise<AssistantState> => {
      const response = await fetch(`${API_V1}/assistant/`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as AssistantState;
    },
  });

/**
 * One frame of a server-sent event stream: an `event:` line, one or more
 * `data:` lines, and a blank line to close it. A line starting with a colon is
 * a comment - the backend opens the stream with one to push the headers
 * through any proxy in the way.
 */
const parseFrame = (frame: string): [string, unknown] | null => {
  let event = "message";
  const data: string[] = [];

  for (const line of frame.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trim());
  }

  if (!data.length) return null;
  try {
    return [event, JSON.parse(data.join("\n"))];
  } catch {
    return null;
  }
};

/** The frames of one open stream, until it closes for any reason. */
const consume = async (
  response: Response,
  handlers: Handlers,
  signal: AbortSignal,
): Promise<void> => {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let closed = false;
  // Whether any of the answer arrived. It is what separates "could not reach
  // the assistant" from "the answer was cut off" - two different sentences,
  // and the reader can act on each of them differently.
  let started = false;

  const handle = (event: string, payload: any) => {
    if (event === "delta") {
      started = true;
      handlers.onDelta(String(payload.text ?? ""));
    } else if (event === "tool")
      handlers.onActivity(
        payload.state === "running"
          ? { name: String(payload.name), code: String(payload.code ?? "") }
          : null,
      );
    else if (event === "done") {
      closed = true;
      handlers.onActivity(null);
      handlers.onDone(Array.isArray(payload.lookups) ? payload.lookups : []);
    } else if (event === "blocked") {
      closed = true;
      handlers.onActivity(null);
      handlers.onBlocked();
    } else if (event === "error") {
      closed = true;
      handlers.onActivity(null);
      handlers.onError((payload.code as ErrorCode) || "failed");
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // A frame ends at a blank line. Anything after the last one is a partial
      // frame - a token split across two TCP reads - and waits for the rest.
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const parsed = parseFrame(frame);
        if (parsed) handle(parsed[0], parsed[1]);
      }
    }
  } catch {
    // An aborted read is the reader closing the panel, not a failure.
    if (!signal.aborted && !closed) {
      handlers.onActivity(null);
      handlers.onError(started ? "interrupted" : "network");
    }
    return;
  }

  // The connection ended without a closing frame: a dropped stream, or a
  // process that went away mid-answer. Half an answer with no end is worse
  // than half an answer that says it was cut off.
  if (!closed && !signal.aborted) {
    handlers.onActivity(null);
    handlers.onError(started ? "interrupted" : "network");
  }
};

/** One POST that opens a stream. `null` means it never opened. */
const open = (
  path: string,
  body: unknown,
  signal: AbortSignal,
  token: string | null,
): Promise<Response> =>
  fetch(`${API_V1}${path}`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // The refresh cookie is httpOnly; without this the browser never sends it.
    credentials: "include",
    body: JSON.stringify(body),
  });

/**
 * Everything the two entry points share: open, check, read.
 *
 * Resolves when the stream closes for any reason, including an abort. It never
 * rejects: every way this can fail is a sentence the reader needs to see in
 * the panel, so each one arrives through `onError` instead.
 */
const run = async (
  path: string,
  body: unknown,
  handlers: Handlers,
  signal: AbortSignal,
  { authenticated = false }: { authenticated?: boolean } = {},
): Promise<void> => {
  let response: Response;

  try {
    response = await open(
      path,
      body,
      signal,
      authenticated ? userStore.getState().token : null,
    );

    // A tab open longer than the access token's half-hour. One silent refresh
    // and one retry, exactly as `api.ts` does for every other request - being
    // thrown out mid-sentence is not an answer to anybody's question.
    if (response.status === 401 && authenticated) {
      const token = await refreshSession();
      if (!token) {
        handlers.onError("signed_out");
        return;
      }
      response = await open(path, body, signal, token);
    }
  } catch {
    if (!signal.aborted) handlers.onError("network");
    return;
  }

  // The two statuses the panel can say something specific about. Everything
  // else is generic, and the backend has already put a code in the stream for
  // the cases where it could.
  if (response.status === 429) {
    handlers.onError("busy");
    return;
  }
  if (response.status === 401 || response.status === 403) {
    handlers.onError("signed_out");
    return;
  }
  if (!response.ok || !response.body) {
    handlers.onError("network");
    return;
  }

  await consume(response, handlers, signal);
};

/** The public website's assistant. No session, no scope. */
export const ask = (
  {
    question,
    history,
    lang,
    page,
  }: { question: string; history: Turn[]; lang: string; page: string },
  handlers: Handlers,
  signal: AbortSignal,
): Promise<void> =>
  run(
    "/assistant/ask/",
    {
      question,
      // Only the two fields the backend replays. Sending the whole turn object
      // would post `state` and `lookups` back up for no reason.
      history: history.map(({ role, content }) => ({ role, content })),
      lang,
      page,
    },
    handlers,
    signal,
  );

/** The panels' assistant. Scoped to whoever the token belongs to. */
export const askPanel = (
  {
    question,
    history,
    lang,
    panel,
  }: { question: string; history: Turn[]; lang: string; panel: string },
  handlers: Handlers,
  signal: AbortSignal,
): Promise<void> =>
  run(
    "/assistant/panel/ask/",
    {
      question,
      history: history.map(({ role, content }) => ({ role, content })),
      lang,
      panel,
    },
    handlers,
    signal,
    { authenticated: true },
  );
