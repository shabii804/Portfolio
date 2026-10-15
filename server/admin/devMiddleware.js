// ─────────────────────────────────────────────────────────────────────────────
// Vite dev/preview middleware that serves the exact same handlers as the
// Vercel serverless functions in api/. This gives the sandbox preview a fully
// working admin API (backed by the local file driver) with zero duplication:
//
//   /api/auth      → api/auth.js
//   /api/content   → api/content.js
//   /api/messages  → api/messages.js
//   /api/projects  → api/projects.js
//   /api/upload    → api/upload.js  (media uploads)
//   /api/status    → api/status.js
//   /api/chat      → api/chat.js   (bonus: the AI chatbot now works in dev too)
//
// Plus /uploads/* — freshly uploaded media is streamed straight from
// public/uploads/ so the panel can preview it without a rebuild (on
// production the committed files are served statically by the CDN).
//
// A tiny shim gives plain Node responses the Vercel-style helpers
// (res.status().json()) and pre-parses JSON bodies into req.body.
// ─────────────────────────────────────────────────────────────────────────────

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authHandler from "../../api/auth.js";
import contentHandler from "../../api/content.js";
import messagesHandler from "../../api/messages.js";
import projectsHandler from "../../api/projects.js";
import statusHandler from "../../api/status.js";
import uploadHandler, { mimeForUpload } from "../../api/upload.js";
import { optionsEcho, readRawBody, safeParse } from "./http.js";

// chat.js is imported LAZILY with a COMPUTED specifier: its module graph
// reaches src/data/portfolio.js, and any import the Vite config bundler can
// trace (even dynamic ones) gets watched — rewriting that file on every admin
// save would restart the dev server and kill in-flight requests. A computed
// path is opaque to the bundler, so it only resolves at request time.
let chatHandlerPromise = null;
const getChatHandler = () => {
  if (!chatHandlerPromise) {
    const spec = ["..", "..", "api", "chat.js"].join("/");
    chatHandlerPromise = import(/* @vite-ignore */ spec).then((m) => m.default);
  }
  return chatHandlerPromise;
};

const ROUTES = [
  ["POST", /^\/api\/auth\/?$/, authHandler],
  ["GET", /^\/api\/content\/?$/, contentHandler],
  ["PUT", /^\/api\/content\/?$/, contentHandler],
  ["GET", /^\/api\/messages\/?$/, messagesHandler],
  ["POST", /^\/api\/messages\/?$/, messagesHandler],
  ["PATCH", /^\/api\/messages\/?$/, messagesHandler],
  ["DELETE", /^\/api\/messages\/?$/, messagesHandler],
  ["GET", /^\/api\/projects\/?$/, projectsHandler],
  ["POST", /^\/api\/projects\/?$/, projectsHandler],
  ["PUT", /^\/api\/projects\/?$/, projectsHandler],
  ["DELETE", /^\/api\/projects\/?$/, projectsHandler],
  ["POST", /^\/api\/upload\/?$/, uploadHandler],
  ["GET", /^\/api\/status\/?$/, statusHandler],
  ["POST", /^\/api\/chat\/?$/, "chat"],
];

// Stream an uploaded file from public/uploads/ (name is strictly validated —
// no path traversal). Returns true when the request was handled.
async function serveUpload(req, res, pathname) {
  if (req.method !== "GET" || !pathname.startsWith("/uploads/")) return false;
  const name = pathname.slice("/uploads/".length);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name) || name.includes("..")) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "Invalid upload name" }));
    return true;
  }
  const ROOT = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
  const buf = await fs.readFile(path.join(ROOT, "public", "uploads", name)).catch(() => null);
  if (!buf) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "Upload not found" }));
    return true;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", mimeForUpload(name));
  res.setHeader("Content-Length", buf.length);
  res.setHeader("Cache-Control", "no-cache");
  res.end(buf);
  return true;
}

function shimResponse(res) {
  if (typeof res.status !== "function") {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
  }
  if (typeof res.json !== "function") {
    res.json = (obj) => {
      if (!res.getHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      res.end(JSON.stringify(obj));
      return res;
    };
  }
  return res;
}

async function handle(req, res, next) {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;
  // Freshly uploaded media — checked BEFORE the /api/ gate so /uploads/* reaches it.
  if (req.method === "GET" && pathname.startsWith("/uploads/")) {
    try {
      if (await serveUpload(req, res, pathname)) return;
    } catch (err) {
      console.error("[dev-api:uploads]", err);
      if (!res.writableEnded) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: "Upload serving failed" }));
      }
      return;
    }
  }
  if (!pathname.startsWith("/api/")) return next();

  try {
    if (req.method === "OPTIONS") return optionsEcho(res);

    // Pre-parse JSON bodies so handlers see req.body exactly like on Vercel.
    // 5 MB cap: media uploads are base64 inside JSON (3 MB file → ~4 MB body);
    // the Vercel runtime enforces its own ~4.5 MB ceiling in production.
    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      const raw = await readRawBody(req, 5_500_000).catch(() => "");
      req.body = raw ? (safeParse(raw) ?? raw) : {};
    }
    req.query = Object.fromEntries(url.searchParams);
    shimResponse(res);

    const match = ROUTES.find(([method, re]) => req.method === method && re.test(pathname));
    if (!match) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.end(JSON.stringify({ ok: false, error: "Not found" }));
    }
    const handler = match[2] === "chat" ? await getChatHandler() : match[2];
    await handler(req, res);
  } catch (err) {
    console.error("[dev-api]", err);
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, error: err?.message || "Server error" }));
    }
  }
}

// Vite plugin — registers the API on both the dev server and `vite preview`.
export function devApiPlugin() {
  return [
    {
      name: "portfolio-dev-api",
      configureServer(server) {
        server.middlewares.use(handle);
      },
      configurePreviewServer(server) {
        server.middlewares.use(handle);
      },
    },
  ];
}
