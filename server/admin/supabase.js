// ─────────────────────────────────────────────────────────────────────────────
// Supabase Storage driver — the third persistence backend (zero-infra CMS):
//
//   SUPABASE_URL          https://<project-ref>.supabase.co
//   SUPABASE_SERVICE_KEY  service_role key (server ONLY — never in the browser)
//   SUPABASE_BUCKET       optional, defaults to "portfolio"
//
// Everything is plain REST (no SDK): the service key auto-creates the public
// bucket, content.json + messages.json live under data/, media under uploads/.
// Public objects are served straight from Supabase's CDN, so uploads and
// content saves go LIVE INSTANTLY — no Vercel rebuild in the loop.
//
// Big uploads (hero videos) bypass the Vercel ~4.5 MB body cap entirely:
// api/upload-url.js mints a short-lived signed upload URL (admin-gated) and
// the browser PUTs the raw file straight to Supabase.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BUCKET = "portfolio";
const MAX_FILE_BYTES = 48 * 1024 * 1024; // Supabase free-tier object ceiling is 50 MB

export function sbConfig() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return {
    url,
    key,
    bucket: process.env.SUPABASE_BUCKET || DEFAULT_BUCKET,
    enabled: Boolean(url && key),
    maxFileBytes: MAX_FILE_BYTES,
  };
}

export const sbEnabled = () => sbConfig().enabled;

function assertConfig() {
  const cfg = sbConfig();
  if (!cfg.enabled) throw new Error("PERSISTENCE_NOT_CONFIGURED");
  return cfg;
}

async function sbFetch(cfg, path, { method = "GET", body, headers = {}, timeoutMs = 20000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(`${cfg.url}/storage/v1${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${cfg.key}`,
        apikey: cfg.key,
        ...(body !== undefined && !(body instanceof Uint8Array) ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : typeof body === "string" || body instanceof Uint8Array
            ? body
            : JSON.stringify(body),
    });
  } finally {
    clearTimeout(timer);
  }
}

// ── bucket bootstrap (service key may create buckets) ────────────────────────
export async function sbEnsureBucket() {
  const cfg = assertConfig();
  const res = await sbFetch(cfg, `/bucket/${cfg.bucket}`);
  if (res.ok) return { created: false };
  // 400 = "Bucket not found" in Supabase's storage API — treat both as absent.
  if (res.status === 400 || res.status === 404) {
    const create = await sbFetch(cfg, "/bucket", {
      method: "POST",
      body: { name: cfg.bucket, public: true, file_size_limit: MAX_FILE_BYTES },
    });
    if (!create.ok) {
      const detail = await create.text().catch(() => "");
      throw new Error(`Supabase bucket create failed (${create.status}) ${detail.slice(0, 140)}`);
    }
    return { created: true };
  }
  throw new Error(`Supabase bucket check failed (${res.status}).`);
}

// ── JSON documents (content.json, messages.json) ─────────────────────────────
export async function sbReadText(objectPath) {
  const cfg = assertConfig();
  const res = await sbFetch(cfg, `/object/${cfg.bucket}/${objectPath}`);
  if (res.status === 400 || res.status === 404) return null;
  if (!res.ok) throw new Error(`Supabase read failed (${res.status}).`);
  return res.text();
}

export async function sbWriteText(objectPath, text, contentType = "application/json") {
  const cfg = assertConfig();
  await sbEnsureBucket();
  const res = await sbFetch(cfg, `/object/${cfg.bucket}/${objectPath}`, {
    method: "POST",
    body: text,
    headers: { "Content-Type": contentType, "x-upsert": "true" },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase write failed (${res.status}) ${detail.slice(0, 140)}`);
  }
  return true;
}

// ── media uploads ────────────────────────────────────────────────────────────
export function sbPublicUrl(objectPath) {
  const cfg = sbConfig();
  return `${cfg.url}/storage/v1/object/public/${cfg.bucket}/${objectPath}`;
}

// Small uploads (≤3 MB, already base64-decoded server-side by api/upload.js).
export async function sbUploadFile(objectPath, buffer, contentType) {
  const cfg = assertConfig();
  if (buffer.length > MAX_FILE_BYTES) {
    throw new Error(`File too large for Supabase (${(buffer.length / 1024 / 1024).toFixed(1)} MB > 48 MB).`);
  }
  await sbEnsureBucket();
  const res = await sbFetch(cfg, `/object/${cfg.bucket}/${objectPath}`, {
    method: "POST",
    body: new Uint8Array(buffer),
    headers: { "Content-Type": contentType || "application/octet-stream", "x-upsert": "true" },
    timeoutMs: 60000,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase upload failed (${res.status}) ${detail.slice(0, 140)}`);
  }
  return { path: sbPublicUrl(objectPath), size: buffer.length };
}

// Big uploads: hand the BROWSER a short-lived signed upload URL so raw bytes
// go browser → Supabase directly, never through the serverless body cap.
export async function sbCreateSignedUploadUrl(objectPath, contentType) {
  const cfg = assertConfig();
  await sbEnsureBucket();
  const res = await sbFetch(cfg, `/object/upload/sign/${cfg.bucket}/${objectPath}`, {
    method: "POST",
    body: contentType ? { contentType } : {},
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase signed URL failed (${res.status}) ${detail.slice(0, 140)}`);
  }
  const data = await res.json();
  if (!data?.url) throw new Error("Supabase signed URL response missing url.");
  return {
    uploadUrl: `${cfg.url}/storage/v1${data.url}`,
    publicPath: sbPublicUrl(objectPath),
    bucket: cfg.bucket,
  };
}
