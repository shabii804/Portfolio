// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat — Z.AI GLM chat endpoint for the portfolio assistant.
// Deploys as a Vercel Serverless Function (works with the existing Vite SPA —
// no Next.js involved). Grounded STRICTLY in src/data/factSheet.js.
// If the SDK or upstream call fails, respond ok:false — the client silently
// falls back to its local rule-based engine, so the chat never breaks.
// ─────────────────────────────────────────────────────────────────────────────

import ZAI from "z-ai-web-dev-sdk";
import { FACT_SHEET } from "../src/data/factSheet.js";

// ── Naive in-memory rate limiter (per cold-start instance; good enough to
//    stop casual abuse. For hard limits, wire Upstash Redis later.) ─────────
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const hits = new Map(); // ip → { count, resetAt }

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PROMPT = `You are the portfolio assistant for Shoaib Arshad. You answer questions from recruiters, clients and fellow developers about Shoaib — his skills, projects, education, experience and how to reach him.

You must stay GROUNDED in the fact sheet below. Treat it as the only truth.

${FACT_SHEET}`;

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST" });
  }

  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  // Rate limit
  const ip = getClientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: "Rate limited — try again in a minute." });
  }

  // Validate body
  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  const rawMessages = body?.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return res.status(400).json({ ok: false, error: "messages[] required" });
  }

  // Sanitize + trim conversation (last 8 turns, hard content caps)
  const messages = rawMessages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-8);

  if (messages.length === 0) {
    return res.status(400).json({ ok: false, error: "No valid messages" });
  }

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM_PROMPT },
        ...messages,
      ],
      thinking: { type: "disabled" },
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty completion");

    return res.status(200).json({ ok: true, reply, source: "glm" });
  } catch (err) {
    console.error("[/api/chat] GLM call failed:", err?.message || err);
    // ok:false → the client falls back to its local rule-based engine
    return res.status(502).json({ ok: false, error: "AI unavailable" });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
