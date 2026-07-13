// A forgotten VITE_API_BASE_URL at build time (e.g. left unset in a hosting provider's env
// config) previously made every fetch silently target "undefined/api/..." with no clear signal
// pointing at the misconfiguration - every API call would just fail. Falling back to localhost
// keeps local dev working exactly as before (matching .env.example's documented default), and
// logging loudly for any other case is what makes a misconfigured production build fail obviously
// instead of looking like a generic "network error" everywhere in the app.
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (!rawApiBaseUrl) {
  console.error(
    "VITE_API_BASE_URL is not set - falling back to http://localhost:8080. " +
      "Set it in your .env (see .env.example) before deploying."
  );
}
export const API_BASE_URL = rawApiBaseUrl || "http://localhost:8080";

type TokenGetter = () => string | null;

let getToken: TokenGetter = () => null;

export function setAuthTokenGetter(getter: TokenGetter) {
  getToken = getter;
}

let onUnauthorized: () => void = () => {};

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

// A 401 from any single endpoint isn't proof the session is dead - background calls
// (notifications, recently-viewed, etc.) can fail one-off for reasons unrelated to auth,
// and logging the user out on the spot means a single flaky request kicks them back to
// the login page seconds after a successful login. Before acting on a 401, confirm with
// the one authoritative session-check endpoint - only log out if that agrees the token is
// actually invalid. Uses a raw fetch (not apiFetch) so a 401 here can't recurse back into
// this same handler, and dedupes concurrent 401s (e.g. several parallel dashboard calls
// failing together) into a single confirmation check.
let sessionCheckInFlight: Promise<void> | null = null;

function confirmSessionExpired() {
  if (sessionCheckInFlight) {
    return sessionCheckInFlight;
  }

  const token = getToken();
  if (!token) {
    onUnauthorized();
    return Promise.resolve();
  }

  sessionCheckInFlight = fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (res.status === 401) {
        onUnauthorized();
      }
    })
    .catch(() => {
      // Network error while confirming - don't punish the user for a connectivity blip.
    })
    .finally(() => {
      sessionCheckInFlight = null;
    });

  return sessionCheckInFlight;
}

// window.open(url) navigates the browser directly to that URL with no way to attach an
// Authorization header, so it can't be used against a JWT-protected endpoint like CV
// download/view - the request arrives unauthenticated and the backend rejects it. Fetching
// the file as a blob (with the same Bearer header apiFetch attaches) and opening an object
// URL created from that blob is the standard way to let the browser render/open an
// authenticated file in a new tab without ever putting the token in a URL (which would leak
// into browser history and server logs).
export async function apiFetchBlob(path: string): Promise<Blob> {
  const token = getToken();
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });

  if (response.status === 401) {
    confirmSessionExpired();
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new ApiError(message || `Request failed with status ${response.status}`, response.status);
  }

  return response.blob();
}

export type SseEvent = { event: string; data: any };

// Native EventSource can't send an Authorization header, so it can't be used against a
// JWT-protected endpoint (the exact same limitation that broke the "View CV" button's
// window.open() call earlier - see apiFetchBlob above). fetch() CAN send custom headers, so
// this reads the response body as a stream and manually parses SSE frames
// ("event: name\ndata: json\n\n", blank-line-delimited) instead of relying on EventSource.
export async function apiFetchStream(
  path: string,
  options: RequestInit,
  onEvent: (evt: SseEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "text/event-stream");

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, signal });

  if (response.status === 401) {
    confirmSessionExpired();
  }
  if (!response.ok || !response.body) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });

    let frameEnd;
    while ((frameEnd = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, frameEnd);
      buffer = buffer.slice(frameEnd + 2);

      let eventName = "message";
      let dataLine = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLine += line.slice(5).trim();
        }
      }

      if (dataLine) {
        try {
          onEvent({ event: eventName, data: JSON.parse(dataLine) });
        } catch {
          // Malformed frame - skip rather than crash the whole stream over one bad event.
        }
      }
    }
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const method = (options.method || "GET").toUpperCase();
  const requestInit = { ...options, headers };
  const url = `${API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, requestInit);
  } catch (networkError) {
    // A GET is safe to retry once - it's read-only, so a brief connection blip (e.g. the
    // backend momentarily unavailable right after a long AI call) doesn't risk a duplicate
    // side effect the way blindly retrying a POST/PUT/DELETE would.
    if (method !== "GET") {
      throw networkError;
    }
    await delay(400);
    response = await fetch(url, requestInit);
  }

  if (response.status === 401) {
    confirmSessionExpired();
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && (data as { message?: string }).message) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data;
}
