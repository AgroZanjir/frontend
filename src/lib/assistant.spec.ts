/**
 * The stream reader.
 *
 * Worth its own test because the failure it guards against is invisible: a
 * frame split across two TCP reads, or an answer with a blank line in it,
 * would each produce a plausible-looking half-answer rather than an error.
 * Everything here drives `ask` through a fake body, so no server is involved.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import { ask, askPanel, type Handlers } from "@/lib/assistant";
import * as api from "@/lib/api";
import userStore from "@/store/UserStore";

const body = (chunks: string[]): ReadableStream<Uint8Array> => {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i >= chunks.length) return controller.close();
      controller.enqueue(encoder.encode(chunks[i++]));
    },
  });
};

const respond = (chunks: string[], status = 200) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: status < 400,
    status,
    body: status < 400 ? body(chunks) : null,
  } as unknown as Response);

const run = async (chunks: string[], status = 200) => {
  respond(chunks, status);
  const seen: Handlers = {
    onDelta: vi.fn(),
    onActivity: vi.fn(),
    onDone: vi.fn(),
    onError: vi.fn(),
    onBlocked: vi.fn(),
  };
  await ask(
    { question: "q", history: [], lang: "en", page: "/" },
    seen,
    new AbortController().signal,
  );
  return seen;
};

const frame = (event: string, payload: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

afterEach(() => vi.restoreAllMocks());

describe("the assistant stream", () => {
  it("reassembles a frame split across two reads", async () => {
    const whole =
      frame("delta", { text: "Agro Zanjir" }) + frame("done", { lookups: [] });
    const seen = await run([whole.slice(0, 21), whole.slice(21)]);

    expect(seen.onDelta).toHaveBeenCalledWith("Agro Zanjir");
    expect(seen.onDone).toHaveBeenCalledWith([]);
    expect(seen.onError).not.toHaveBeenCalled();
  });

  it("keeps a blank line inside an answer instead of ending the frame on it", async () => {
    const seen = await run([
      frame("delta", { text: "One paragraph.\n\nAnd a second." }),
      frame("done", { lookups: [] }),
    ]);

    expect(seen.onDelta).toHaveBeenCalledWith(
      "One paragraph.\n\nAnd a second.",
    );
    expect(seen.onDelta).toHaveBeenCalledTimes(1);
  });

  it("reports a lookup starting and finishing", async () => {
    const seen = await run([
      frame("tool", {
        name: "lookup_lot",
        code: "AZ-2026-SMQ-0412",
        state: "running",
      }),
      frame("tool", {
        name: "lookup_lot",
        code: "AZ-2026-SMQ-0412",
        state: "done",
        found: true,
      }),
      frame("done", {
        lookups: [{ name: "lookup_lot", code: "AZ-2026-SMQ-0412" }],
      }),
    ]);

    expect(seen.onActivity).toHaveBeenNthCalledWith(1, {
      name: "lookup_lot",
      code: "AZ-2026-SMQ-0412",
    });
    expect(seen.onActivity).toHaveBeenNthCalledWith(2, null);
    expect(seen.onDone).toHaveBeenCalledWith([
      { name: "lookup_lot", code: "AZ-2026-SMQ-0412" },
    ]);
  });

  it("passes an error through as a code, never as a sentence", async () => {
    const seen = await run([frame("error", { code: "upstream" })]);

    expect(seen.onError).toHaveBeenCalledWith("upstream");
    expect(seen.onDone).not.toHaveBeenCalled();
  });

  it("says an answer was cut off rather than letting it look finished", async () => {
    // A dropped connection mid-answer. Half an answer that looks finished is
    // the one outcome the reader cannot tell apart from a real one.
    const seen = await run([frame("delta", { text: "Half a sen" })]);

    expect(seen.onDelta).toHaveBeenCalledWith("Half a sen");
    expect(seen.onError).toHaveBeenCalledWith("interrupted");
  });

  it("distinguishes a stream that never started from one that was cut off", async () => {
    const seen = await run([]);

    expect(seen.onError).toHaveBeenCalledWith("network");
  });

  it("names the rate limit rather than reporting a generic failure", async () => {
    const seen = await run([], 429);

    expect(seen.onError).toHaveBeenCalledWith("busy");
  });

  it("ignores the opening comment frame the backend sends", async () => {
    const seen = await run([": open\n\n", frame("done", { lookups: [] })]);

    expect(seen.onError).not.toHaveBeenCalled();
    expect(seen.onDone).toHaveBeenCalledWith([]);
  });

  it("sends only the two fields the backend replays", async () => {
    const fetcher = respond([frame("done", { lookups: [] })]);
    await ask(
      {
        question: "q",
        history: [
          { role: "user", content: "earlier" },
          { role: "assistant", content: "answer", state: "done", lookups: [] },
        ],
        lang: "uz",
        page: "/showroom",
      },
      {
        onDelta: vi.fn(),
        onActivity: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
        onBlocked: vi.fn(),
      },
      new AbortController().signal,
    );

    const sent = JSON.parse(
      (fetcher.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(sent.history).toEqual([
      { role: "user", content: "earlier" },
      { role: "assistant", content: "answer" },
    ]);
    expect(sent.lang).toBe("uz");
    expect(sent.page).toBe("/showroom");
  });
});

/**
 * The panels' half of it.
 *
 * The public assistant posts to an open endpoint; this one carries a token
 * that expires after half an hour. A tab left open past that, and the reader
 * loses their answer to a 401 rather than to anything real - so the refresh
 * and the single retry are what these pin down.
 */

const handlers = () => ({
  onDelta: vi.fn(),
  onActivity: vi.fn(),
  onDone: vi.fn(),
  onError: vi.fn(),
  onBlocked: vi.fn(),
});

const ok = (chunks: string[]) =>
  ({ ok: true, status: 200, body: body(chunks) }) as unknown as Response;

const status = (code: number) =>
  ({ ok: false, status: code, body: null }) as unknown as Response;

describe("the panels' assistant", () => {
  it("carries the access token and the refresh cookie", async () => {
    userStore.setState({ token: "access-abc" } as never);
    const fetcher = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(ok([frame("done", { lookups: [] })]));

    await askPanel(
      {
        question: "How many lots?",
        history: [],
        lang: "en",
        panel: "/farmer/lots",
      },
      handlers(),
      new AbortController().signal,
    );

    const [url, init] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/assistant/panel/ask/");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer access-abc",
    );
    // Without this the browser never sends the httpOnly refresh cookie.
    expect(init.credentials).toBe("include");
    expect(JSON.parse(init.body as string).panel).toBe("/farmer/lots");
  });

  it("refreshes once and retries when the access token has expired", async () => {
    userStore.setState({ token: "stale" } as never);
    vi.spyOn(api, "refreshSession").mockResolvedValue("fresh");
    const fetcher = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(status(401))
      .mockResolvedValueOnce(
        ok([
          frame("delta", { text: "Twelve." }),
          frame("done", { lookups: [] }),
        ]),
      );

    const seen = handlers();
    await askPanel(
      { question: "How many lots?", history: [], lang: "en", panel: "" },
      seen,
      new AbortController().signal,
    );

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(
      (
        fetcher.mock.calls[1][1] as RequestInit & {
          headers: Record<string, string>;
        }
      ).headers.Authorization,
    ).toBe("Bearer fresh");
    expect(seen.onDelta).toHaveBeenCalledWith("Twelve.");
    expect(seen.onError).not.toHaveBeenCalled();
  });

  it("says the session ended when the refresh also fails", async () => {
    userStore.setState({ token: "stale" } as never);
    vi.spyOn(api, "refreshSession").mockResolvedValue(null);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(status(401));

    const seen = handlers();
    await askPanel(
      { question: "How many lots?", history: [], lang: "en", panel: "" },
      seen,
      new AbortController().signal,
    );

    // Not "network": the reader has to sign in again, and telling them the
    // assistant is unreachable would send them looking for the wrong fault.
    expect(seen.onError).toHaveBeenCalledWith("signed_out");
  });

  it("reports a role without the capability as a session problem, not a fault", async () => {
    userStore.setState({ token: "access-abc" } as never);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(status(403));

    const seen = handlers();
    await askPanel(
      { question: "Show me everything.", history: [], lang: "en", panel: "" },
      seen,
      new AbortController().signal,
    );

    expect(seen.onError).toHaveBeenCalledWith("signed_out");
  });

  it("never puts a token on the public endpoint", async () => {
    userStore.setState({ token: "access-abc" } as never);
    const fetcher = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(ok([frame("done", { lookups: [] })]));

    await ask(
      { question: "What is Agro Zanjir?", history: [], lang: "en", page: "/" },
      handlers(),
      new AbortController().signal,
    );

    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect(
      (init.headers as Record<string, string>).Authorization,
    ).toBeUndefined();
  });
});
