// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload — admin-only media upload (hero background video/image,
// poster, resume…). Turns the repo into the media library:
//
//   body  { name, data }   name = original filename, data = base64 payload
//                          (a "data:<mime>;base64," prefix is tolerated)
//   →     { ok, path, size, storage }   path = "/uploads/<file>" — plug it
//         straight into content.media.heroBackground (or any other field).
//
// Files land in public/uploads/ (GitHub commit in production → Vercel
// rebuild serves them from the CDN edge; direct disk write in dev).
// Limits: 3 MB per file — Vercel caps request bodies at ~4.5 MB and base64
// inflates payloads by a third, so 3 MB is the safe ceiling.
// ─────────────────────────────────────────────────────────────────────────────

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
import { ghWriteRaw, mapStorageError, sendStoreError, storageMode } from "../server/admin/store.js";
import { sbUploadFile } from "../server/admin/supabase.js";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url))); // → Portfolio/
const UPLOAD_DIR = "public/uploads";
const MAX_BYTES = 3 * 1024 * 1024;

const EXT_OK = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "gif", "svg", "ico",
  "mp4", "webm", "mov", "m4v", "ogv",
  "mp3", "wav", "pdf",
]);

const MIME = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  avif: "image/avif", gif: "image/gif", svg: "image/svg+xml", ico: "image/x-icon",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/x-m4v",
  ogv: "video/ogg", mp3: "audio/mpeg", wav: "audio/wav", pdf: "application/pdf",
};

export function mimeForUpload(name) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return MIME[ext] || "application/octet-stream";
}

// Slug the original name: "My Hero Cut (final).mp4" → "my-hero-cut-final-3f2a1c.mp4"
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

  if (!rateLimit(`upload:${getClientIp(req)}`, 12, 10 * 60_000)) {
    return error(res, 429, "Too many uploads — try again in a few minutes.");
  }

  const body = await parseBody(req);
  const name = typeof body?.name === "string" ? body.name : "";
  let data = typeof body?.data === "string" ? body.data : "";

  if (!name || !data) return error(res, 400, "Send { name, data } — data is the base64 file content.");
  // Tolerate full data URLs pasted from the client.
  const comma = data.indexOf(",");
  if (data.startsWith("data:") && comma !== -1 && data.slice(0, comma).includes("base64")) {
    data = data.slice(comma + 1);
  }
  if (!/^[A-Za-z0-9+/=\s]+$/.test(data)) {
    return error(res, 400, "Invalid base64 payload.");
  }

  const buf = Buffer.from(data.replace(/\s/g, ""), "base64");
  if (!buf.length) return error(res, 400, "Empty file.");
  if (buf.length > MAX_BYTES) {
    return error(
      res,
      413,
      `File too large (${(buf.length / 1024 / 1024).toFixed(2)} MB). The panel accepts up to 3 MB per file — compress the video or use a shorter clip.`
    );
  }

  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (!EXT_OK.has(ext)) {
    return error(res, 415, `Unsupported file type ".${ext}" — allowed: ${[...EXT_OK].join(", ")}`);
  }

  const fileName = makeUploadName(name);
  const message = `feat(admin): upload ${fileName} via admin panel`;

  try {
    if (storageMode() === "supabase") {
      // Supabase Storage → public URL served instantly, no rebuild involved.
      const publicPath = await sbUploadFile(`uploads/${fileName}`, buf, mimeForUpload(fileName));
      return json(res, 200, {
        ok: true,
        path: publicPath.path,
        url: publicPath.path,
        size: buf.length,
        storage: "supabase",
        message: "Uploaded to Supabase — live instantly",
      });
    }
    if (storageMode() === "github") {
      await ghWriteRaw(`${UPLOAD_DIR}/${fileName}`, buf.toString("base64"), message);
    } else {
      const target = path.join(ROOT, UPLOAD_DIR, fileName);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, buf);
    }
  } catch (err) {
    // Read-only host (Vercel /var/task/**) → actionable 503, never a raw EROFS.
    return sendStoreError(res, mapStorageError(err));
  }

  return json(res, 200, {
    ok: true,
    path: `/uploads/${fileName}`,
    size: buf.length,
    storage: storageMode(),
    message:
      storageMode() === "github"
        ? "Uploaded — committing… live in ~1 min"
        : "Uploaded to local storage",
  });
}
