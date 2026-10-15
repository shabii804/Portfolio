// ─────────────────────────────────────────────────────────────────────────────
// Admin API client — token management + typed-ish fetch wrapper.
// Token lives in localStorage ("sa-admin-token"); a 401 anywhere clears it so
// AdminApp can bounce back to the login screen.
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = "sa-admin-token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (t) => {
  try {
    localStorage.setItem(TOKEN_KEY, t);
  } catch { /* private mode */ }
};
export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch { /* noop */ }
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Network error — the admin API is unreachable.");
  }

  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearToken();
    throw new ApiError(401, data?.error || "Unauthorized");
  }
  if (!res.ok || data?.ok === false) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function login(password) {
  const data = await api("/api/auth", { method: "POST", body: { password } });
  setToken(data.token);
  return data;
}

export const timeAgo = (iso) => {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};
