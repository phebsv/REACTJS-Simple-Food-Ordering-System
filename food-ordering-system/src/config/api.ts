function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3001",
);

export function apiUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE_URL}${path}`;
}

