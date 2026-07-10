export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

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
