// ─────────────────────────────────────────────────────────────────────────────
// Browser GitHub bridge — makes the admin panel fully functional on
// read-only hosts (Vercel serverless) WITHOUT any server-side env setup.
//
// Why: Vercel functions run on a read-only filesystem (EROFS on /var/task/**),
// and the server's GitHub driver needs a GITHUB_TOKEN env var + redeploy.
// This bridge instead commits straight from the admin user's browser via the
// GitHub Contents API, using a token stored ONLY in this browser's
// localStorage. Every save/upload becomes a commit on the repo → Vercel
// rebuilds → live in ~1 minute. It also lifts the upload cap from 3 MB
// (serverless request-body limit) to ~25 MB, which hero videos need.
//
// Mirrors server/admin/github.js + store.js semantics exactly:
//   • same default repo/branch, same sha-conflict retry loop
//   • same content-merge rules as api/content.js PUT
//   • same portfolio.js auto-render as store.js renderPortfolioModule
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = "sa-gh-token";
const REPO_KEY = "sa-gh-repo";
const BRANCH_KEY = "sa-gh-branch";

const DEFAULT_REPO = "shabii804/Portfolio";
const DEFAULT_BRANCH = "main";
const API = "https://api.github.com";

export const CONTENT_FILE = "src/data/content.json";
export const PORTFOLIO_FILE = "src/data/portfolio.js";
export const UPLOAD_DIR = "public/uploads";

const SECTIONS = ["personal", "media", "settings", "skills", "projects", "experience", "journey"];

// Fetch the CURRENT committed content.json (text) — or null when absent.
export async function ghGetFileText(path, cfg = getGhConfig()) {
  try {
    const res = await ghFetch(path, {}, cfg);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.content || data.encoding !== "base64") return null;
    return b64decode(data.content);
  } catch {
    return null;
  }
}

// Uploads via the bridge skip the serverless body cap; keep a sane guard
// (Contents API accepts large PUTs, git warns past 50 MB — stay well under).
export const BRIDGE_MAX_MB = 25;

const EXT_OK = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "gif", "svg", "ico",
  "mp4", "webm", "mov", "m4v", "ogv",
  "mp3", "wav", "pdf",
]);

const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* noop */ } },
};

// ── connection state ─────────────────────────────────────────────────────────
export function ghConnected() {
  return Boolean(ls.get(TOKEN_KEY));
}

export function getGhConfig() {
  return {
    token: ls.get(TOKEN_KEY) || "",
    repo: ls.get(REPO_KEY) || DEFAULT_REPO,
    branch: ls.get(BRANCH_KEY) || DEFAULT_BRANCH,
  };
}

export function setGhConfig({ token, repo, branch }) {
  ls.set(TOKEN_KEY, token);
  ls.set(REPO_KEY, repo || DEFAULT_REPO);
  ls.set(BRANCH_KEY, branch || DEFAULT_BRANCH);
}

export function clearGhConfig() {
  ls.del(TOKEN_KEY);
  ls.del(REPO_KEY);
  ls.del(BRANCH_KEY);
}

// Validate before saving: token identity + push access to the target repo.
export async function ghValidate({ token, repo, branch }) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const userRes = await fetch(`${API}/user`, { headers });
  if (userRes.status === 401) throw new Error("Token rejected by GitHub (401) — check the value.");
  if (!userRes.ok) throw new Error(`GitHub /user failed (${userRes.status}).`);
  const { login } = await userRes.json();

  const repoRes = await fetch(`${API}/repos/${repo}`, { headers });
  if (repoRes.status === 404) throw new Error(`Repo "${repo}" not visible to this token (404).`);
  if (!repoRes.ok) throw new Error(`GitHub /repos failed (${repoRes.status}).`);
  const repoData = await repoRes.json();
  if (repoData?.permissions?.push === false) {
    throw new Error(`Token has no push access to ${repo} — grant Contents: Read and write.`);
  }
  const branchRes = await fetch(`${API}/repos/${repo}/branches/${encodeURIComponent(branch || DEFAULT_BRANCH)}`, { headers });
  if (!branchRes.ok) throw new Error(`Branch "${branch}" not found on ${repo}.`);
  return { login, repo, branch: branch || DEFAULT_BRANCH, defaultBranch: repoData.default_branch };
}

// ── Contents API primitives ──────────────────────────────────────────────────
function ghFetch(path, { noRef = false, body } = {}, cfg = getGhConfig()) {
  const { token, repo, branch } = cfg;
  const url = `${API}/repos/${repo}/contents/${path}${noRef ? "" : `?ref=${encodeURIComponent(branch)}`}`;
  return fetch(url, {
    method: body ? "PUT" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function ghGetSha(path, cfg) {
  try {
    const res = await ghFetch(path, {}, cfg);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub read failed (${res.status}).`);
    const data = await res.json();
    return data.sha || null;
  } catch {
    return null; // sha is optional — a failed read just means create-without-sha
  }
}

// Same retry loop as the server driver: refresh the sha on 409 conflicts.
async function ghPutFile(path, base64Content, message, cfg = getGhConfig()) {
  let sha = await ghGetSha(path, cfg);
  for (let attempt = 0; attempt < 3; attempt++) {
    const body = { message, content: base64Content, branch: cfg.branch, ...(sha ? { sha } : {}) };
    const res = await ghFetch(path, { noRef: true, body }, cfg);
    if (res.ok) return true;
    if (res.status === 409) {
      sha = await ghGetSha(path, cfg);
      continue;
    }
    if (res.status === 401) throw new Error("GitHub rejected the token (401) — reconnect in Settings.");
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub write failed (${res.status}) ${detail.slice(0, 140)}`);
  }
  throw new Error("GitHub write failed after retries (commit conflict) — try again.");
}

// UTF-8-safe base64 (btoa alone chokes on non-Latin1 — bios contain emoji etc.)
function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64decode(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// ── content commit (mirrors api/content.js PUT merge + store.js render) ──────
function renderPortfolioModule(content) {
  return `// ⚠️ AUTO-GENERATED by the portfolio Admin panel (/admin) — do not edit by hand.
// Canonical data lives in src/data/content.json; this module is regenerated on
// every admin save so the site build and the AI chatbot fact sheet stay in sync.
export const content = ${JSON.stringify(content, null, 2)};

export const defaultProjects = content.projects;
export const defaultSkills = content.skills;
export const defaultPersonal = content.personal;
export const defaultExperience = content.experience;
export const defaultJourney = content.journey;
export const contentMeta = content.meta;
`;
}

function mergeContent(current, patch) {
  const next = { ...(current || {}) };
  const touched = [];
  for (const s of SECTIONS) {
    if (patch[s] === undefined) continue;
    touched.push(s);
    if (s === "personal") {
      next.personal = { ...(current?.personal || {}), ...patch.personal };
    } else if (s === "settings") {
      next.settings = { ...(current?.settings || {}), ...patch.settings };
    } else if (s === "media") {
      const cur = current?.media || {};
      const pm = patch.media;
      next.media = { ...cur, ...pm };
      if (pm.heroBackground || cur.heroBackground) {
        next.media.heroBackground = { ...(cur.heroBackground || {}), ...(pm.heroBackground || {}) };
      }
    } else {
      next[s] = patch[s];
    }
  }
  next.meta = {
    ...(current?.meta || {}),
    updatedAt: new Date().toISOString(),
    updatedSections: touched,
  };
  return { next, touched };
}

// Same merge rules as api/content.js PUT: personal/settings per-field,
// media deep-merges one level into heroBackground, arrays replace wholesale.
// (Exported for the local-test-mode driver — keep semantics in ONE place.)
export { mergeContent };

// Full save path for the bridge: fetch the LATEST committed content.json as
// the merge base (never trust the page's snapshot — it can be stale and would
// silently revert newer fields), apply the patch, commit JSON + module.
export async function bridgeSaveContent(current, patch) {
  const cfg = getGhConfig();
  if (!cfg.token) throw new Error("GitHub is not connected — open Settings → Connect GitHub.");
  let base = current || {};
  try {
    const remoteText = await ghGetFileText(CONTENT_FILE, cfg);
    if (remoteText) base = JSON.parse(remoteText);
  } catch {
    /* offline base — proceed with the page snapshot */
  }
  const { next, touched } = mergeContent(base, patch);
  if (!touched.length) throw new Error("Nothing to update.");
  const message = `feat(admin): update ${touched.join(", ")} via admin panel`;
  await ghPutFile(CONTENT_FILE, b64encode(JSON.stringify(next, null, 2) + "\n"), message, cfg);
  await ghPutFile(PORTFOLIO_FILE, b64encode(renderPortfolioModule(next)), message, cfg);
  return next;
}

// ── uploads (mirrors api/upload.js naming + whitelist) ───────────────────────
export function makeUploadName(original) {
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

export async function bridgeUpload(fileName, base64) {
  const cfg = getGhConfig();
  if (!cfg.token) throw new Error("GitHub is not connected — open Settings → Connect GitHub.");
  const safe = makeUploadName(fileName);
  await ghPutFile(`${UPLOAD_DIR}/${safe}`, base64, `feat(admin): upload ${safe} via admin panel`, cfg);
  return { path: `/uploads/${safe}`, storage: "github-browser" };
}

export { EXT_OK };
