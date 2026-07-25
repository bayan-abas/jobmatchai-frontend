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

let sessionCheckInFlight: Promise<void> | null = null;

// כש-401 מתקבל, מוודא מול השרת שהסשן באמת פג (ולא שהטוקן פשוט חסר לרגע) לפני שמנתקים את המשתמש
function confirmSessionExpired() {
  // אם כמה בקשות מקבלות 401 באותו זמן, לא לשלוח כמה בדיקות /me במקביל
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

    })
    .finally(() => {
      sessionCheckInFlight = null;
    });

  return sessionCheckInFlight;
}

// כמו apiFetch אבל מחזיר Blob גולמי (לקבצים כמו הורדת PDF) במקום לנתח JSON
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

// פותח חיבור SSE לשרת ומפרק את זרם התגובה ל-frame-ים (event/data) שמועברים ל-callback בזמן אמת
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

// wrapper מרכזי לכל קריאות ה-API - מוסיף טוקן הרשאה, מטפל בשגיאות ומנסה שוב פעם אחת ל-GET שנכשל ברמת הרשת
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

    console.error(`apiFetch: network-level failure for ${method} ${url}`, {
      requestBody: options.body,
      error: networkError,
    });

    // רק GET בטוח לנסות שוב אוטומטית - POST/PUT/DELETE יכולים לגרום לפעולה כפולה
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
    console.error(`apiFetch: ${method} ${url} failed with ${response.status}`, { responseBody: data });
    throw new ApiError(message, response.status);
  }

  return data;
}

// עוטף apiFetch בלוגיקת retry עם backoff מעריכי - שימושי לבקשות שרצות אחרי פעולה כבדה בצד שרת (כמו ניתוח CV)
export async function apiFetchWithRetry(
  path: string,
  options: RequestInit = {},
  config: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, maxAttempts: number) => void;
  } = {}
): Promise<any> {
  const maxAttempts = config.maxAttempts ?? 7;
  const baseDelayMs = config.baseDelayMs ?? 1000;
  const maxDelayMs = config.maxDelayMs ?? 8000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await apiFetch(path, options);
    } catch (error) {

      // שגיאת רשת או 5xx זה משהו זמני שכדאי לנסות שוב, 4xx זו שגיאה אמיתית ואין טעם
      const isRetryable = !(error instanceof ApiError) || error.status >= 500;
      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }
      config.onRetry?.(attempt, maxAttempts);
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new ApiError("Request failed", 0);
}
