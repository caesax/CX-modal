export function escapeHtml(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttr(value: unknown): string {
  return escapeHtml(value);
}

export function isSafeUrl(url: unknown): boolean {
  if (url === undefined || url === null) return false;
  const value = String(url).trim();
  if (!value) return false;
  if (/^\/\//.test(value)) return true;
  if (/^[./?#]/.test(value)) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return /^(https?:)/i.test(value);
  }
  return true;
}

export function sanitizeUrl(url: unknown): string {
  return isSafeUrl(url) ? String(url).trim() : "";
}

export function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return fallback;
}
