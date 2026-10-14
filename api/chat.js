// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat — AI chat endpoint for the portfolio assistant.
// Pure-fetch implementation (NO SDK, NO config files, NO module-scope side
// effects) so it can never crash-boot on Vercel serverless.
//
// Provider chain:
//   1. GLM_API_KEY env var set  → Z.ai open platform (glm-4.5-flash, free)
//   2. No key                   → Pollinations (keyless, free, OpenAI-compatible)
//   3. Both fail                → 502 { ok:false } → client rule-based engine
//
// Answers are grounded STRICTLY in src/data/factSheet.js to prevent
// hallucinated credentials (e.g. wrong CGPA / university).
// ─────────────────────────────────────────────────────────────────────────────

import { FACT_SHEET } from "../src/data/factSheet.js";

// ── Naive in-memory rate limiter (per cold-start instance) ──────────────────
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

STRICT RULES:
- Stay GROUNDED in the fact sheet below. Treat it as the only truth.
- If a fact is not in the sheet, say you don't know and suggest the contact section.
- Never invent GPA, universities, employers, dates or metrics.
- Keep answers short and friendly (2-5 sentences unless a list is asked for).
- Use **bold** for key facts like project names, GPA, or skills.

${FACT_SHEET}`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

async function callOpenAiCompatible({ baseUrl, apiKey, model, messages, extraHeaders = {} }) {
  const { signal, done } = withTimeout(28_000);
  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        ...extraHeaders,
      },
      body: JSON.stringify({ model, messages, stream: false }),
      signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Upstream ${res.status}: ${detail.slice(0, 160)}`);
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) throw new Error("Empty completion");
    return reply.trim();
  } finally {
    done();
  }
}

// ── Providers ────────────────────────────────────────────────────────────────
async function askGLM(messages) {
  const key = process.env.GLM_API_KEY || process.env.ZAI_API_KEY || process.env.ZHIPU_API_KEY;
  if (!key) return null; // no key configured → skip to next provider
  const reply = await callOpenAiCompatible({
    baseUrl: "https://api.z.ai/api/paas/v4/chat/completions",
    apiKey: key,
    model: "glm-4.5-flash",
    messages,
  });
  return { reply, source: "glm" };
}

async function askPollinations(messages) {
  const reply = await callOpenAiCompatible({
    baseUrl: "https://text.pollinations.ai/openai",
    apiKey: null,
    model: "openai",
    messages,
  });
  return { reply, source: "glm" }; // client badges any model answer as "AI"
}

// ── Handler ──────────────────────────────────────────────────────────────────
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

  const convo = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  // Provider chain — every failure is caught, the function NEVER throws.
  try {
    const viaKey = await askGLM(convo).catch(() => null);
    if (viaKey) return res.status(200).json({ ok: true, ...viaKey });
  } catch { /* fall through */ }

  try {
    const viaPollinations = await askPollinations(convo);
    return res.status(200).json({ ok: true, ...viaPollinations });
  } catch (err) {
    console.error("[/api/chat] all providers failed:", err?.message || err);
    // ok:false → the client falls back to its local rule-based engine
    return res.status(502).json({ ok: false, error: "AI unavailable" });
  }
}
