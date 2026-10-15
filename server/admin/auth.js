// ─────────────────────────────────────────────────────────────────────────────
// Admin authentication — single shared password + HMAC-signed bearer token.
//
//   ADMIN_PASSWORD  env var → admin password (falls back to a documented
//                             default for local/dev; production should set it)
//   ADMIN_SECRET    env var → HMAC secret (defaults to a value derived from
//                             the password, so rotating the password also
//                             invalidates every issued token)
//
// Token format: base64url(JSON payload).base64url(HMAC-SHA256) — stateless,
// 7-day expiry, verified with timing-safe comparison.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from "node:crypto";

export const DEFAULT_ADMIN_PASSWORD = "shoaib-admin-2026";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function usingDefaultPassword() {
  return !process.env.ADMIN_PASSWORD;
}

function getSecret() {
  return process.env.ADMIN_SECRET || `sa-admin::v1::${getAdminPassword()}`;
}

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // burn comparable time to avoid trivially leaking length
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
};

export function checkPassword(input) {
  return typeof input === "string" && input.length > 0 && safeEqual(input, getAdminPassword());
}

export function issueToken() {
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", exp: Date.now() + TOKEN_TTL_MS })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return { token: `${payload}.${sig}`, ttlMs: TOKEN_TTL_MS };
}

export function verifyToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  if (!safeEqual(sig, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.role === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAuthorized(req) {
  const header = req.headers?.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return false;
  return verifyToken(token.trim());
}
