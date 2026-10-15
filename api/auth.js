// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth — admin login.
// Body: { password }  →  { ok, token, expiresInMs }
// Rate limited to 5 attempts / minute / IP.
// ─────────────────────────────────────────────────────────────────────────────

import { applyCors, error, getClientIp, json, optionsEcho, parseBody, rateLimit } from "../server/admin/http.js";
import { checkPassword, issueToken } from "../server/admin/auth.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return optionsEcho(res);
  if (req.method !== "POST") return error(res, 405, "Use POST");
  applyCors(res);

  const ip = getClientIp(req);
  if (!rateLimit(`auth:${ip}`, 5, 60_000)) {
    return error(res, 429, "Too many attempts — try again in a minute.");
  }

  const body = await parseBody(req);
  if (!checkPassword(body?.password)) {
    return error(res, 401, "Wrong password");
  }
  const { token, ttlMs } = issueToken();
  return json(res, 200, { ok: true, token, expiresInMs: ttlMs });
}
