// ─────────────────────────────────────────────────────────────────────────────
// /api/messages — the contact-form inbox.
//
//   GET     admin  → { ok, messages }            (newest first)
//   POST    public → { name, email, subject?, message, website? }
//                    `website` is a honeypot: filled ⇒ silently accepted+dropped.
//                    Rate limited to 5 messages / 10 minutes / IP.
//   PATCH   admin  ?id=…  body { read: true|false }
//   DELETE  admin  ?id=…
//
// Storage: data/messages.json (committed with "[skip ci]" → no deploy).
// ─────────────────────────────────────────────────────────────────────────────

import {
  applyCors,
  error,
  getClientIp,
  getQuery,
  json,
  optionsEcho,
  parseBody,
  rateLimit,
} from "../server/admin/http.js";
import { isAuthorized } from "../server/admin/auth.js";
import { readMessages, sendStoreError, writeMessages } from "../server/admin/store.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGES = 200;

const clip = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return optionsEcho(res);
  applyCors(res);

  // ── public: submit a message ────────────────────────────────────────────
  if (req.method === "POST") {
    const ip = getClientIp(req);
    if (!rateLimit(`msg:${ip}`, 5, 10 * 60_000)) {
      return error(res, 429, "Too many messages — please try again later.");
    }
    const body = await parseBody(req);

    // Honeypot — bots fill hidden fields; real users never see it.
    if (clip(body?.website, 200)) {
      return json(res, 200, { ok: true, id: "skipped" });
    }

    const name = clip(body?.name, 80);
    const email = clip(body?.email, 120);
    const subject = clip(body?.subject, 150);
    const message = clip(body?.message, 4000);

    if (!name) return error(res, 400, "Name is required");
    if (!EMAIL_RE.test(email)) return error(res, 400, "A valid email is required");
    if (message.length < 10) return error(res, 400, "Message should be at least 10 characters");

    try {
      const prev = await readMessages();
      const msg = {
        id: `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        name,
        email,
        subject: subject || "(no subject)",
        message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await writeMessages([msg, ...prev].slice(0, MAX_MESSAGES));
      return json(res, 200, { ok: true, id: msg.id });
    } catch (err) {
      return sendStoreError(res, err);
    }
  }

  // ── admin: list / mark read / delete ────────────────────────────────────
  if (!isAuthorized(req)) return error(res, 401, "Unauthorized");

  if (req.method === "GET") {
    try {
      const messages = await readMessages();
      return json(res, 200, { ok: true, messages });
    } catch (err) {
      return sendStoreError(res, err);
    }
  }

  const id = getQuery(req).get("id");
  if (!id) return error(res, 400, "Missing ?id=");

  if (req.method === "PATCH") {
    const body = await parseBody(req);
    const read = Boolean(body?.read);
    try {
      const messages = await readMessages();
      const next = messages.map((m) => (m.id === id ? { ...m, read } : m));
      if (!next.some((m) => m.id === id)) return error(res, 404, "Message not found");
      await writeMessages(next);
      return json(res, 200, { ok: true, messages: next });
    } catch (err) {
      return sendStoreError(res, err);
    }
  }

  if (req.method === "DELETE") {
    try {
      const messages = await readMessages();
      const next = messages.filter((m) => m.id !== id);
      if (next.length === messages.length) return error(res, 404, "Message not found");
      await writeMessages(next);
      return json(res, 200, { ok: true, messages: next });
    } catch (err) {
      return sendStoreError(res, err);
    }
  }

  return error(res, 405, "Use GET, POST, PATCH or DELETE");
}
