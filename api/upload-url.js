// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload-url — admin-only SIGNED UPLOAD URL for big media (hero
// videos). Vercel caps serverless request bodies at ~4.5 MB, so multi-MB
// videos can never POST through /api/upload. Instead:
//
//   1. browser asks this endpoint for a short-lived signed upload URL
//   2. browser PUTs the RAW file straight to Supabase Storage (no base64,
//      no body cap — up to 48 MB)
//   3. the public URL is known up-front and returned here
//
// Requires SUPABASE_URL + SUPABASE_SERVICE_KEY on the server; answers 503
// with a clear message when persistence isn't configured.
// ─────────────────────────────────────────────────────────────────────────────

import {
  applyCors,
  error,
  getClientIp,
  json,
  optionsEcho,
  parseBody,
  rateLimit,
} from "../server/admin/http.js";
import { isAuthorized } from "../server/admin/auth.js";
import { sendStoreError } from "../server/admin/store.js";
import { sbCreateSignedUploadUrl } from "../server/admin/supabase.js";

const EXT_OK = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "gif", "svg", "ico",
  "mp4", "webm", "mov", "m4v", "ogv",
  "mp3", "wav", "pdf",
]);

const MAX_BYTES = 48 * 1024 * 1024;

function makeUploadName(original) {
  const ext = (original.split(".").pop() || "").toLowerCase();
  const base = original
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "file";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}.${EXT_OK.has(ext) ? ext : "bin"}`;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return optionsEcho(res);
  applyCors(res);
  if (req.method !== "POST") return error(res, 405, "Use POST");
  if (!isAuthorized(req)) return error(res, 401, "Unauthorized");

  if (!rateLimit(`upload-url:${getClientIp(req)}`, 12, 10 * 60_000)) {
    return error(res, 429, "Too many uploads — try again in a few minutes.");
  }

  const body = await parseBody(req);
  const name = typeof body?.name === "string" ? body.name : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const size = Number(body?.size) || 0;

  if (!name) return error(res, 400, "Send { name, size, contentType }.");
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (!EXT_OK.has(ext)) {
    return error(res, 415, `Unsupported file type ".${ext}" — allowed: ${[...EXT_OK].join(", ")}`);
  }
  if (size > MAX_BYTES) {
    return error(res, 413, `File too large (${(size / 1024 / 1024).toFixed(1)} MB) — the limit is 48 MB.`);
  }

  const fileName = makeUploadName(name);

  try {
    const signed = await sbCreateSignedUploadUrl(`uploads/${fileName}`, contentType || mimeFor(ext));
    return json(res, 200, {
      ok: true,
      uploadUrl: signed.uploadUrl,
      path: signed.publicPath,
      size,
      storage: "supabase",
      message: "Upload directly to Supabase — live instantly",
    });
  } catch (err) {
    return sendStoreError(res, err);
  }
}

function mimeFor(ext) {
  const MIME = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
    avif: "image/avif", gif: "image/gif", svg: "image/svg+xml", ico: "image/x-icon",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/x-m4v",
    ogv: "video/ogg", mp3: "audio/mpeg", wav: "audio/wav", pdf: "application/pdf",
  };
  return MIME[ext] || "application/octet-stream";
}
