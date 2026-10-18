import type { User } from "./types";
import { memberRoles } from "./types";

export function accountHome(user?: User | null): string {
  return user?.role === "super_admin"
    ? "/admin"
    : user && memberRoles.includes(user.role)
      ? "/operations"
      : "/dashboard";
}

export function safeReturnPath(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!value || value.length > 2048) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    for (const candidate of [value, decoded]) {
      if (
        !candidate.startsWith("/") ||
        candidate.startsWith("//") ||
        Array.from(candidate).some(
          (c) => c.charCodeAt(0) <= 32 || c.charCodeAt(0) === 127 || c === "\\",
        )
      )
        return fallback;
    }
    const path = decoded.split(/[?#]/)[0];
    if (
      /(?:^|\/)\.{1,2}(?:\/|$)/.test(path) ||
      /^\/(?:auth(?:\/|$)|login(?:\/|$)|complete-profile(?:\/|$)|google-(?:login|callback)\.php(?:\/|$)|logout\.php(?:\/|$))/i.test(
        path,
      )
    )
      return fallback;
    return value;
  } catch {
    return fallback;
  }
}
