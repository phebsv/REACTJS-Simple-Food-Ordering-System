function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

// Get API URL from environment variable
// VITE_API_URL must be set in .env file
const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!envApiUrl) {
  throw new Error(
    "VITE_API_URL environment variable is not set. " +
    "Please ensure it is defined in your .env file. " +
    "See .env.example for the required configuration."
  );
}

export const API_BASE_URL = normalizeBaseUrl(envApiUrl);

export function apiUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE_URL}${path}`;
}


