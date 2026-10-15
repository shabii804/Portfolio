// ─────────────────────────────────────────────────────────────────────────────
// Shared HTTP helpers for the portfolio admin API.
// Works both inside Vercel serverless functions (res.status().json() helpers)
// and under the local Vite dev/preview middleware shim (same interface).
// Style mirrors api/chat.js: pure Node, no framework, never throws.
// ─────────────────────────────────────────────────────────────────────────────

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function applyCors(res) {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
}

export function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function error(res, status, message) {
  json(res, status, { ok: false, error: message });
}

export function optionsEcho(res) {
  applyCors(res);
  res.statusCode = 204;
  res.end();
}

export function safeParse(value) {
  if (value == null) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function readRawBody(req, limit = 1_000_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

// Vercel pre-parses JSON bodies; the dev shim does the same, so this is a
// no-op in both environments — kept as a safety net for raw bodies.
export async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const raw = typeof req.body === "string" ? req.body : await readRawBody(req);
  return safeParse(raw) ?? {};
}

export function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

export function getQuery(req) {
  return new URL(req.url, "http://localhost").searchParams;
}

// Naive in-memory rate limiter (per cold-start instance, same as chat.js).
const buckets = new Map();
export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

// Recursively strip dangerous keys + cap string sizes before storage.
export function deepSanitize(value, maxDepth = 8) {
  const walk = (v, depth) => {
    if (depth > maxDepth) return null;
    if (typeof v === "string") return v.slice(0, 20_000);
    if (typeof v === "number" || typeof v === "boolean" || v === null) return v;
    if (Array.isArray(v)) return v.slice(0, 500).map((item) => walk(item, depth + 1));
    if (typeof v === "object") {
      const out = {};
      for (const [k, val] of Object.entries(v)) {
        if (k === "__proto__" || k === "prototype" || k === "constructor") continue;
        if (typeof val === "function" || val === undefined) continue;
        out[k.slice(0, 60)] = walk(val, depth + 1);
      }
      return out;
    }
    return null;
  };
  return walk(value, 0);
}
