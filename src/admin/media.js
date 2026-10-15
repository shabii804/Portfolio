// ─────────────────────────────────────────────────────────────────────────────
// Upload routing for the admin panel — picks the transport per environment:
//
//   test mode  → IndexedDB in this browser (any size, instant, local only)
//
//   ≤ 3 MB     → POST /api/upload (serverless): Supabase (instant public URL)
//                or GitHub commit or dev disk. 503 → fall through below.
//   > 3 MB     → POST /api/upload-url → browser PUTs the raw file straight to
//                Supabase Storage (signed URL — no serverless body cap, up to
//                48 MB). Hero videos take this route whenever Supabase is
//                configured on the server.
//   fallback   → browser GitHub bridge directly (≤ 25 MB; Vercel caps request
//                bodies at ~4.5 MB so big files can NEVER use /api/upload).
// ─────────────────────────────────────────────────────────────────────────────

import { api } from "./api.js";
import { BRIDGE_MAX_MB, bridgeUpload, ghConnected } from "./ghBridge.js";
import { localModeOn, localUpload } from "./localStore.js";

export const SERVER_MAX_MB = 3;
export const SUPABASE_MAX_MB = 48;

export function maxUploadMb() {
  if (localModeOn()) return SUPABASE_MAX_MB; // IndexedDB — no server round trip
  return ghConnected() ? BRIDGE_MAX_MB : SUPABASE_MAX_MB;
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",").pop() || "");
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}

// Server has Supabase configured → mint a signed upload URL and PUT the raw
// file from the browser (bypasses the Vercel body cap entirely).
async function uploadViaSupabaseSigned(file) {
  const mint = await api("/api/upload-url", {
    method: "POST",
    body: { name: file.name, size: file.size, contentType: file.type || "" },
  });
  const put = await fetch(mint.uploadUrl, {
    method: "PUT",
    headers: file.type ? { "Content-Type": file.type } : undefined,
    body: file,
  });
  if (!put.ok) {
    throw new Error(`Supabase upload failed (${put.status}) — try again.`);
  }
  return {
    ok: true,
    path: mint.path,
    size: file.size,
    storage: "supabase",
    message: mint.message || "Uploaded to Supabase — live instantly",
  };
}

export async function uploadMedia(file) {
  const mb = file.size / 1024 / 1024;

  // 0) Local test mode — nothing leaves this browser.
  if (localModeOn()) {
    return localUpload(file);
  }

  // 1) Small files: the serverless route (Supabase / GitHub / dev disk).
  if (mb <= SERVER_MAX_MB) {
    try {
      const data = await readAsBase64(file);
      const res = await api("/api/upload", { method: "POST", body: { name: file.name, data } });
      // A GitHub-mode upload still needs a rebuild before it serves; if the
      // bridge is connected we could pre-warm, but the server already
      // committed — just surface its message.
      return res;
    } catch (err) {
      // 503 = persistence not configured on the server — fall through to the
      // bridge when it's connected; anything else is a real error.
      if (!(err?.status === 503 && ghConnected())) throw err;
    }
  } else {
    // 2) Big files: try the Supabase signed-URL route first (instant), then
    //    the GitHub bridge. A 503/404/405 from the mint call means "Supabase
    //    not configured on this deployment" → fall through silently; other
    //    errors only fall through when the bridge can actually take over.
    try {
      return await uploadViaSupabaseSigned(file);
    } catch (err) {
      const notConfigured = [503, 404, 405].includes(err?.status);
      if (!notConfigured && (!ghConnected() || mb > BRIDGE_MAX_MB)) throw err;
    }
  }

  // 3) Browser GitHub bridge fallback.
  if (!ghConnected()) {
    throw new Error(
      mb > SERVER_MAX_MB
        ? `Files over ${SERVER_MAX_MB} MB need Supabase (Vercel → SUPABASE_URL + SUPABASE_SERVICE_KEY) or connect GitHub in Settings for up to ${BRIDGE_MAX_MB} MB.`
        : "Upload storage is not configured — connect GitHub in Settings, or set SUPABASE_URL + SUPABASE_SERVICE_KEY on the server."
    );
  }
  if (mb > BRIDGE_MAX_MB) {
    throw new Error(`"${file.name}" is ${mb.toFixed(1)} MB — the GitHub bridge caps at ${BRIDGE_MAX_MB} MB. Use Supabase for files up to ${SUPABASE_MAX_MB} MB.`);
  }

  const data = await readAsBase64(file);
  const res = await bridgeUpload(file.name, data);
  return {
    ok: true,
    path: res.path,
    size: file.size,
    storage: "github-browser",
    message: "Uploaded via GitHub — committing… live in ~1 min",
  };
}
