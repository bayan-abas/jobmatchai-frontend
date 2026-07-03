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

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
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

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    onUnauthorized();
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
