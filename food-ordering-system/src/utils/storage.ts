type StorageArea = "session" | "local";

function getArea(area: StorageArea): Storage {
  return area === "local" ? localStorage : sessionStorage;
}

export function getStoredItem(key: string): string | null {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

export function setStoredItem(key: string, value: string, area: StorageArea = "session") {
  getArea(area).setItem(key, value);
}

export function removeStoredItem(key: string) {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

