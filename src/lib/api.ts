/**
 * The fetch wrapper for the Agro Zanjir API.
 *
 * Deliberately thin. AgroConnect hand-wrote a large typed client that drifted
 * from the backend; this time the typed layer is generated from the OpenAPI
 * schema the Django backend serves at `/api/schema/`:
 *
 *     npx openapi-typescript http://localhost:8000/api/schema/ -o src/lib/api-types.ts
 *
 * This module owns the four things a generated client will not:
 *
 *   1. the base URL and the `Accept-Language` header;
 *   2. the Authorization header, from the in-memory access token;
 *   3. **silent refresh** - a 401 is retried once behind a single-flight
 *      exchange of the httpOnly refresh cookie, so a tab that has been open
 *      longer than the access token's half-hour does not throw the reader out
 *      mid-sentence;
 *   4. `credentials: "include"`, without which the browser never sends that
 *      cookie at all.
 *
 * Only when the refresh also fails does the session end.
 */

import { API_V1 } from "@/config";
import userStore from "@/store/UserStore";
import i18n from "@/i18n";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * The refresh in flight, if any.
 *
 * Six requests hitting a stale token must produce one refresh, not six - and
 * with rotation on, six would invalidate each other.
 */
let refreshing: Promise<string | null> | null = null;

const exchangeRefreshCookie = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_V1}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const session = await response.json();
    userStore.getState().applySession(session);
    return session.access as string;
  } catch {
    return null;
  }
};

export const refreshSession = (): Promise<string | null> => {
  refreshing ??= exchangeRefreshCookie().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

const send = async (
  path: string,
  init: RequestInit,
  token: string | null,
): Promise<Response> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": i18n.resolvedLanguage ?? "uz",
    ...(init.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${API_V1}${path}`, {
    ...init,
    headers,
    // The refresh token is an httpOnly cookie; without this it is never sent.
    credentials: "include",
  });
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response = await send(path, init, userStore.getState().token);

  // A 401 from the auth endpoints means the credentials were wrong, not that a
  // session expired. Retrying them behind a refresh would replace the
  // backend's "those credentials do not match an account" with "session
  // expired", which is a lie to someone who has simply mistyped a password.
  if (response.status === 401 && !path.startsWith("/auth/")) {
    const token = await refreshSession();
    if (token) {
      response = await send(path, init, token);
    } else {
      userStore.getState().logout();
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const detail =
      (isJson && (body as { detail?: string })?.detail) ||
      `HTTP ${response.status}`;
    throw new ApiError(response.status, detail, body);
  }

  return body as T;
}

export interface Health {
  service: string;
  version: string;
  database: string;
  engine: string;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  health: () => request<Health>("/health/"),
};

export default api;
