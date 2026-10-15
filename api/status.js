// ─────────────────────────────────────────────────────────────────────────────
// GET /api/status — admin dashboard overview (requires auth).
// Reports storage mode, environment readiness (booleans only — never secrets),
// content/message counts and the last content update time.
// ─────────────────────────────────────────────────────────────────────────────

import { error, json, optionsEcho } from "../server/admin/http.js";
import { isAuthorized, usingDefaultPassword } from "../server/admin/auth.js";
import { ghConfig, readContent, readMessages, storageMode } from "../server/admin/store.js";
import { sbConfig } from "../server/admin/supabase.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return optionsEcho(res);
  if (req.method !== "GET") return error(res, 405, "Use GET");
  if (!isAuthorized(req)) return error(res, 401, "Unauthorized");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const content = (await readContent().catch(() => null)) || {};
  const messages = await readMessages().catch(() => []);

  const personal = content.personal || {};
  const skills = content.skills || {};

  const sb = sbConfig();

  return json(res, 200, {
    ok: true,
    storage: storageMode(),
    usingDefaultPassword: usingDefaultPassword(),
    repo: ghConfig().repo,
    branch: ghConfig().branch,
    supabaseBucket: sb.enabled ? sb.bucket : null,
    env: {
      ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
      ADMIN_SECRET: Boolean(process.env.ADMIN_SECRET),
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_SERVICE_KEY: sb.enabled,
      GITHUB_TOKEN: Boolean(process.env.GITHUB_TOKEN),
      GITHUB_REPO: Boolean(process.env.GITHUB_REPO),
      GITHUB_BRANCH: Boolean(process.env.GITHUB_BRANCH),
      CHATBOT_KEY: Boolean(
        process.env.GLM_API_KEY || process.env.ZAI_API_KEY || process.env.ZHIPU_API_KEY
      ),
    },
    counts: {
      projects: Array.isArray(content.projects) ? content.projects.length : 0,
      skills: Object.keys(skills).length,
      experience: Array.isArray(content.experience) ? content.experience.length : 0,
      journey: Array.isArray(content.journey) ? content.journey.length : 0,
      messages: messages.length,
      unread: messages.filter((m) => !m?.read).length,
    },
    contentUpdatedAt: content.meta?.updatedAt || null,
    siteEmail: personal.email || null,
  });
}
