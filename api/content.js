// ─────────────────────────────────────────────────────────────────────────────
// /api/content — portfolio content (the data behind every section of the site).
//
//   GET  public  → { ok, content }
//   PUT  admin   body { content: { personal?, media?, settings?, skills?,
//                                projects?, experience?, journey? } }
//                → merges the provided sections, updates meta, persists.
//
// Persisting = committing src/data/content.json + regenerating
// src/data/portfolio.js. On production this triggers a Vercel rebuild, so
// changes go live in ~1 minute.
// ─────────────────────────────────────────────────────────────────────────────

import { applyCors, deepSanitize, error, json, optionsEcho, parseBody } from "../server/admin/http.js";
import { isAuthorized } from "../server/admin/auth.js";
import { readContent, sendStoreError, writeContent } from "../server/admin/store.js";

const SECTIONS = ["personal", "media", "settings", "skills", "projects", "experience", "journey"];

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return optionsEcho(res);
  applyCors(res);

  if (req.method === "GET") {
    try {
      const content = await readContent();
      return json(res, 200, { ok: true, content });
    } catch (err) {
      return sendStoreError(res, err);
    }
  }

  if (req.method !== "PUT") return error(res, 405, "Use GET or PUT");
  if (!isAuthorized(req)) return error(res, 401, "Unauthorized");

  const body = await parseBody(req);
  const patch = deepSanitize(body?.content ?? body);
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return error(res, 400, "Invalid body — send { content: { section: value } }");
  }

  const sections = SECTIONS.filter((s) => patch[s] !== undefined);
  if (sections.length === 0) {
    return error(res, 400, `Nothing to update — send one of: ${SECTIONS.join(", ")}`);
  }

  if (patch.personal !== undefined && (typeof patch.personal !== "object" || Array.isArray(patch.personal))) {
    return error(res, 400, "personal must be an object");
  }
  if (patch.media !== undefined && (typeof patch.media !== "object" || Array.isArray(patch.media))) {
    return error(res, 400, "media must be an object");
  }
  if (patch.settings !== undefined && (typeof patch.settings !== "object" || Array.isArray(patch.settings))) {
    return error(res, 400, "settings must be an object");
  }
  if (patch.skills !== undefined && (typeof patch.skills !== "object" || Array.isArray(patch.skills))) {
    return error(res, 400, "skills must be an object of arrays");
  }
  for (const key of ["projects", "experience", "journey"]) {
    if (patch[key] !== undefined && !Array.isArray(patch[key])) {
      return error(res, 400, `${key} must be an array`);
    }
  }
  if (JSON.stringify(patch).length > 600_000) {
    return error(res, 413, "Content too large");
  }

  try {
    const current = (await readContent()) || {};
    const next = { ...current };
    for (const s of sections) {
      if (s === "personal") {
        // personal merges per-field: a partial patch must not wipe the
        // untouched fields (phone, roles, links…). Arrays elsewhere replace.
        next.personal = { ...(current.personal || {}), ...patch.personal };
      } else if (s === "settings") {
        // Site switches merge per-field too (toggling the chatbot must not
        // reset the SEO title).
        next.settings = { ...(current.settings || {}), ...patch.settings };
      } else if (s === "media") {
        // Media merges per-field AND one level deeper into heroBackground so
        // swapping only the poster never drops the video sources.
        const cur = current.media || {};
        const pm = patch.media;
        next.media = { ...cur, ...pm };
        if (pm.heroBackground || cur.heroBackground) {
          next.media.heroBackground = {
            ...(cur.heroBackground || {}),
            ...(pm.heroBackground || {}),
          };
        }
      } else {
        next[s] = patch[s];
      }
    }
    next.meta = {
      ...(current.meta || {}),
      updatedAt: new Date().toISOString(),
      updatedSections: sections,
    };
    const result = await writeContent(next, sections);
    return json(res, 200, { ok: true, content: next, storage: result.mode, message: result.message });
  } catch (err) {
    return sendStoreError(res, err);
  }
}
