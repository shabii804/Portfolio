// ─────────────────────────────────────────────────────────────────────────────
// GitHub Contents API driver — turns the repo into a tiny JSON CMS.
//
//   GITHUB_TOKEN   env var → PAT with repo contents write access (required
//                            to enable this driver; otherwise the local file
//                            driver is used, which only works in dev)
//   GITHUB_REPO    env var → "owner/repo"   (default: shabii804/Portfolio)
//   GITHUB_BRANCH  env var → branch name    (default: main)
//
// Saving content commits to main → Vercel rebuilds → the change is live in
// about a minute. Message-inbox commits use "[skip ci]" so they do NOT
// trigger deployments.
// ─────────────────────────────────────────────────────────────────────────────

const API = "https://api.github.com";

export function ghConfig() {
  return {
    token: process.env.GITHUB_TOKEN || "",
    repo: process.env.GITHUB_REPO || "shabii804/Portfolio",
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

async function ghFetch(path, init = {}) {
  const { token, repo, branch } = ghConfig();
  const url = `${API}/repos/${repo}/contents/${path}${init.noRef ? "" : `?ref=${encodeURIComponent(branch)}`}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "portfolio-admin-api",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}

// Returns { text, sha } or null when the file does not exist yet.
export async function ghRead(path) {
  const res = await ghFetch(path);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const data = await res.json();
  if (data.encoding !== "base64" || typeof data.content !== "string") return null;
  return { text: Buffer.from(data.content, "base64").toString("utf8"), sha: data.sha };
}

// Creates or updates a file. Retries once on sha conflicts (409).
export async function ghWrite(path, text, message) {
  const { branch } = ghConfig();
  let existing = null;
  try {
    existing = await ghRead(path);
  } catch {
    /* sha is optional — a missing read just means create-without-sha */
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const body = {
      message,
      content: Buffer.from(text, "utf8").toString("base64"),
      branch,
      ...(existing?.sha ? { sha: existing.sha } : {}),
    };
    const res = await ghFetch(path, { method: "PUT", noRef: true, body: JSON.stringify(body) });
    if (res.ok) return true;
    if (res.status === 409) {
      existing = await ghRead(path); // someone else committed — retry with fresh sha
      continue;
    }
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub write failed (${res.status}): ${detail.slice(0, 180)}`);
  }
  throw new Error("GitHub write failed after retries (conflict)");
}
