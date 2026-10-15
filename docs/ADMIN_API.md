# Portfolio Admin Panel & API

The portfolio ships with a full admin panel at **`/admin`** and a REST API under **`/api/*`**.
The API is implemented as Vercel Serverless Functions (pure Node, no framework) with a local
Vite middleware so the exact same handlers run in `vite dev` / `vite preview`.

## What the admin panel can manage

| Section | What you can do |
|---|---|
| **Overview** | Stats (projects, skills, journey, messages/unread), storage health, latest message, quick actions |
| **Content** | Name, title, email, phone, location, LinkedIn/GitHub/Slack, bio, hero typewriter roles, availability, profile/CV paths |
| **Hero & Media** | The hero background end-to-end: switch video / image / off, upload new clips (desktop MP4, WebM, mobile MP4), posters and images (≤3 MB each), or paste URLs — plus framing (object position, dark overlay strength, film grain, vignette) with a live preview |
| **Projects** | Full CRUD: add / edit / duplicate / delete / reorder, all fields incl. stack, features, screenshots, impact and the deep case-study (JSON) |
| **Skills & Journey** | Skill groups (categories), experience roles with highlight bullets, journey timeline milestones (reorderable) |
| **Messages** | Contact-form inbox: read/unread, delete, reply via mailto, filter unread |
| **Settings** | Site switches (SEO title/description, preloader, custom cursor, scroll progress, back-to-top, chatbot, GitHub activity) + environment checklist, production setup guide, full API reference |
| **Tools** | Copy Polisher (client-side text cleanup, kept from the original admin) |

Saves are persisted to **`src/data/content.json`** (canonical) and regenerate **`src/data/portfolio.js`**
(the module the site + AI chatbot import), so the whole site — including chatbot answers — stays in sync.
Uploaded media lands in **`public/uploads/`** (committed through the same GitHub driver) and is served
from the Vercel CDN after the automatic redeploy.

## Storage drivers

| Driver | When | Behavior |
|---|---|---|
| **GitHub CMS** | `GITHUB_TOKEN` env set (production) | Commits to the repo (`src/data/content.json` + regenerated `portfolio.js`) → Vercel redeploys → live in ~1 min. Message inbox commits use `[skip ci]` (no deploy). |
| **Local file** | No `GITHUB_TOKEN` (sandbox/dev) | Writes the same files on disk → Vite HMR picks changes up instantly. Inbox lives in `data/messages.json` (gitignored). |

Without `GITHUB_TOKEN` in production, saves fail with a clear `503` (serverless FS is read-only) —
that's the safe default. Set the env vars below to enable real persistence.

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | **yes (prod)** | Admin login password. Default while unset: `shoaib-admin-2026` (public in source — change it!) |
| `GITHUB_TOKEN` | for persistence | GitHub **fine-grained PAT** with *Contents: Read and write* on the repo |
| `GITHUB_REPO` | no | Defaults to `shabii804/Portfolio` |
| `GITHUB_BRANCH` | no | Defaults to `main` |
| `ADMIN_SECRET` | no | HMAC secret for tokens; defaults to a value derived from the password (rotating the password invalidates all tokens) |
| `GLM_API_KEY` | no | Chatbot provider key (Pollinations fallback works keyless) |

## API reference

Auth header for `admin` endpoints: `Authorization: Bearer <token from /api/auth>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth` | public | `{ password }` → `{ ok, token, expiresInMs }`. Rate limited 5/min/IP. |
| `GET` | `/api/content` | public | Full portfolio content JSON. |
| `PUT` | `/api/content` | admin | `{ content: { personal?, media?, settings?, skills?, projects?, experience?, journey? } }` — merges provided sections (`personal`, `media.heroBackground` and `settings` deep-merge per field), bumps `meta.updatedAt`. |
| `POST` | `/api/upload` | admin | `{ name, data }` (base64, ≤3 MB; images / mp4 / webm / pdf…) → `{ path: "/uploads/<file>" }` — plugs straight into the hero background or any URL field. Rate limited 12/10min/IP. |
| `GET` | `/api/projects` | public | Projects array. |
| `POST` | `/api/projects` | admin | `{ project }` → adds (id auto-generated). |
| `PUT` | `/api/projects?id=…` | admin | `{ project }` → replaces (unknown fields preserved). |
| `DELETE` | `/api/projects?id=…` | admin | Removes the project. |
| `GET` | `/api/messages` | admin | Inbox (newest first, capped at 200). |
| `POST` | `/api/messages` | public | `{ name, email, subject?, message, website? }` — honeypot + 5/10min/IP. |
| `PATCH` | `/api/messages?id=…` | admin | `{ read: true|false }`. |
| `DELETE` | `/api/messages?id=…` | admin | Deletes a message. |
| `GET` | `/api/status` | admin | Storage mode, env readiness (booleans only), counts, last update. |
| `POST` | `/api/chat` | public | AI chatbot (pre-existing, fact-grounded). |

All endpoints return JSON shaped `{ ok: boolean, … }` and set permissive CORS headers.
Every write is sanitized (prototype-pollution-safe, string caps, size caps).

### Quick start (curl)

```bash
# 1. login
TOKEN=$(curl -s -X POST https://YOUR-DOMAIN/api/auth \
  -H 'Content-Type: application/json' \
  -d '{"password":"YOUR_PASSWORD"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# 2. read content
curl -s https://YOUR-DOMAIN/api/content | head -c 400

# 3. update the bio
curl -s -X PUT https://YOUR-DOMAIN/api/content \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"content":{"personal":{"bio":"Updated bio from the API."}}}'
```

## Local development

```bash
npm run dev        # http://localhost:5173 — /api/* served by the Vite middleware
npm run preview    # http://localhost:4173 — same after a build
```

- Login at `http://localhost:5173/admin` with the default password (or `ADMIN_PASSWORD`).
- Saves write `src/data/content.json` + regenerate `src/data/portfolio.js`; Vite reloads the page.
- The inbox is stored in `data/messages.json` (gitignored).

## Security notes

- Tokens are HMAC-SHA256 signed, expire after 7 days, and are invalidated by rotating `ADMIN_PASSWORD`.
- Login attempts are rate limited (5/min/IP); contact submissions too (5/10min/IP).
- The status endpoint reports environment readiness as booleans only — never secret values.
- The honeypot field silently drops bot submissions.
- All content commits are visible in git history = a full audit log (and one `git revert` away from undo).
