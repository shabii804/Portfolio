// ─────────────────────────────────────────────────────────────────────────────
// /api/projects — CRUD for portfolio projects (stored inside content.json).
//
//   GET     public → { ok, projects }
//   POST    admin  body { project }              → adds (id auto-generated)
//   PUT     admin  ?id=…  body { project }       → replaces (unknown fields preserved)
//   DELETE  admin  ?id=…                         → removes
//
// The admin UI edits the whole array via PUT /api/content { content:{projects} };
// these granular endpoints exist for programmatic/API-first use.
// ─────────────────────────────────────────────────────────────────────────────

import { applyCors, deepSanitize, error, getQuery, json, optionsEcho, parseBody } from "../server/admin/http.js";
import { isAuthorized } from "../server/admin/auth.js";
import { readContent, sendStoreError, writeContent } from "../server/admin/store.js";

const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : typeof v === "number" ? String(v) : "");
const strArr = (v, maxItems, maxLen) =>
  Array.isArray(v)
    ? v.filter((x) => typeof x === "string").map((s) => s.slice(0, maxLen)).slice(0, maxItems)
    : [];

function cleanProject(input) {
  if (!input || typeof input !== "object") return null;
  const title = str(input.title, 120).trim();
  if (!title) return null;
  const out = {
    id:
      typeof input.id === "string" && /^[a-z0-9-]{1,60}$/.test(input.id)
        ? input.id
        : `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    num: str(input.num, 4) || null,
    title,
    subtitle: str(input.subtitle, 160),
    tagline: str(input.tagline, 240),
    description: str(input.description, 6000),
    date: str(input.date, 40),
    badge: str(input.badge, 60),
    live: str(input.live, 300) || null,
    github: str(input.github, 300) || null,
    accentHex: /^#[0-9a-fA-F]{3,8}$/.test(input.accentHex || "") ? input.accentHex : "#818cf8",
    stack: strArr(input.stack, 24, 60),
    features: strArr(input.features, 24, 120),
    details: strArr(input.details, 40, 2000),
    impact: strArr(input.impact, 12, 200),
    screenshots: strArr(input.screenshots, 12, 200),
    caseStudy: null,
  };
  if (input.caseStudy && typeof input.caseStudy === "object") {
    out.caseStudy = deepSanitize(input.caseStudy, 4);
  }
  return out;
}

async function persist(res, projects, verb, title) {
  const content = await readContent();
  const next = { ...(content || {}), projects };
  next.meta = { ...(content?.meta || {}), updatedAt: new Date().toISOString(), updatedSections: ["projects"] };
  const result = await writeContent(next, ["projects"]);
  return json(res, 200, { ok: true, projects, storage: result.mode, message: result.message, verb, title });
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return optionsEcho(res);
  applyCors(res);

  let content;
  try {
    content = await readContent();
  } catch (err) {
    return sendStoreError(res, err);
  }
  const projects = Array.isArray(content?.projects) ? content.projects : [];

  if (req.method === "GET") {
    return json(res, 200, { ok: true, projects });
  }

  if (!isAuthorized(req)) return error(res, 401, "Unauthorized");

  if (req.method === "POST") {
    const body = await parseBody(req);
    const cleaned = cleanProject(body?.project);
    if (!cleaned) return error(res, 400, "project.title is required");
    cleaned.num = cleaned.num || String(projects.length + 1).padStart(2, "0");
    return persist(res, [...projects, cleaned], "add", cleaned.title);
  }

  const id = getQuery(req).get("id");
  if (!id) return error(res, 400, "Missing ?id=");
  const index = projects.findIndex((p) => p?.id === id);
  if (index === -1) return error(res, 404, "Project not found");

  if (req.method === "PUT") {
    const body = await parseBody(req);
    const cleaned = cleanProject({ ...projects[index], ...(body?.project || {}) });
    if (!cleaned) return error(res, 400, "project.title is required");
    cleaned.id = projects[index].id; // id is immutable
    const next = [...projects];
    next[index] = cleaned;
    return persist(res, next, "update", cleaned.title);
  }

  if (req.method === "DELETE") {
    const removed = projects[index];
    const next = projects.filter((_, i) => i !== index);
    return persist(res, next, "remove", removed?.title || id);
  }

  return error(res, 405, "Use GET, POST, PUT or DELETE");
}
