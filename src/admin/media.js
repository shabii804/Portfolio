// ─────────────────────────────────────────────────────────────────────────────
// Upload routing for the admin panel — picks the transport per file size:
//
//   ≤ 3 MB   → POST /api/upload (serverless) — works in dev (disk) and on
//              production once the server GitHub driver is configured.
//   > 3 MB   → browser GitHub bridge directly (Vercel caps request bodies at
//              ~4.5 MB, so hero-size videos can NEVER go through /api/upload).
//
//   server 503 (read-only host / driver not configured) + bridge connected
//            → automatic retry through the bridge, so a plain "upload" just
//              works everywhere once GitHub is connected in Settings.
// ─────────────────────────────────────────────────────────────────────────────

import { api } from "./api.js";
import { BRIDGE_MAX_MB, bridgeUpload, ghConnected } from "./ghBridge.js";

export const SERVER_MAX_MB = 3;

export function maxUploadMb() {
  return ghConnected() ? BRIDGE_MAX_MB : SERVER_MAX_MB;
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",").pop() || "");
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadMedia(file) {
  const mb = file.size / 1024 / 1024;

  if (mb <= SERVER_MAX_MB) {
    try {
      const data = await readAsBase64(file);
      return await api("/api/upload", { method: "POST", body: { name: file.name, data } });
    } catch (err) {
      // 503 = read-only host without server-side persistence — fall through to
      // the bridge when it's connected; anything else is a real error.
      if (!(err?.status === 503 && ghConnected())) throw err;
    }
  } else if (mb > BRIDGE_MAX_MB) {
    throw new Error(`"${file.name}" is ${mb.toFixed(1)} MB — the limit is ${BRIDGE_MAX_MB} MB.`);
  }

  if (!ghConnected()) {
    throw new Error(
      mb > SERVER_MAX_MB
        ? `Files over ${SERVER_MAX_MB} MB upload straight from your browser — connect GitHub first (Settings → Connect GitHub).`
        : "Upload storage is not configured — connect GitHub in Settings, or set GITHUB_TOKEN on the server."
    );
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
