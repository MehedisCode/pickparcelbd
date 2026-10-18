"use client";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  csrfRetried = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Requested-With", "XMLHttpRequest");
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (options.method && options.method !== "GET") {
    if (!document.cookie.split("; ").some((c) => c.startsWith("XSRF-TOKEN=")))
      await fetch("/sanctum/csrf-cookie", {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("XSRF-TOKEN="));
    if (cookie)
      headers.set(
        "X-XSRF-TOKEN",
        decodeURIComponent(cookie.slice("XSRF-TOKEN=".length)),
      );
  }
  let response: Response;
  try {
    response = await fetch(
      path.startsWith("/auth/") ? path : `/api/v1${path}`,
      { ...options, headers, credentials: "include", cache: "no-store" },
    );
  } catch {
    throw new ApiError(
      "Cannot connect to PickParcelBD. Please check your connection and try again.",
      0,
    );
  }
  const body = await response
    .json()
    .catch(() => ({ message: "The server returned an unexpected response." }));
  if (
    response.status === 419 &&
    !csrfRetried &&
    options.method &&
    options.method !== "GET"
  ) {
    const csrf = await fetch("/sanctum/csrf-cookie", {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });
    if (csrf.ok) return request<T>(path, options, true);
  }
  if (response.status === 401) {
    window.dispatchEvent(new Event("pickparcel:session-expired"));
    throw new ApiError(
      "Your session has expired. Please sign in again to continue.",
      401,
    );
  }
  if (!response.ok)
    throw new ApiError(
      body.message || "Something went wrong.",
      response.status,
      body.errors || {},
    );
  return body as T;
}
export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, d: unknown = {}) =>
    request<T>(p, {
      method: "POST",
      body: d instanceof FormData ? d : JSON.stringify(d),
    }),
  patch: <T>(p: string, d: unknown) =>
    request<T>(p, { method: "PATCH", body: JSON.stringify(d) }),
  put: <T>(p: string, d: unknown) =>
    request<T>(p, { method: "PUT", body: JSON.stringify(d) }),
  delete: <T>(p: string, d: unknown = {}) =>
    request<T>(p, { method: "DELETE", body: JSON.stringify(d) }),
};
export function refreshData() {
  window.dispatchEvent(new Event("pickparcel:refresh"));
}
export function money(value: unknown) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}
export function date(value: unknown) {
  return value
    ? new Intl.DateTimeFormat("en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dhaka",
      }).format(
        new Date(
          /^\d{4}-\d{2}-\d{2} \d{2}:/.test(String(value))
            ? String(value).replace(" ", "T") + "Z"
            : String(value),
        ),
      )
    : "—";
}
export function label(value: unknown) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replaceAll("-", " ");
}
