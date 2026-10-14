# Shoaib Arshad — Portfolio

> Personal portfolio website for Shoaib Arshad, Full Stack Web Developer & Java Desktop Application Developer.

Built with **React 19**, **Vite 8**, and **Tailwind CSS 3**. No Next.js, no other frameworks — pure React.

Design language: **restrained dark luxury** — near-black canvas (`#07070B`), 1px hairline borders, a single indigo→cyan gradient accent, Space Grotesk + Inter + JetBrains Mono, 8px spacing rhythm.

## ✨ Features

### Experience
- 🪐 **3D orbit hero** — react-three-fiber + drei scene: faceted "SA" monogram core, three tilted orbital rings, and the real stack (React, Node.js, TypeScript, Java, SQL, Firebase, Tailwind) orbiting as glowing chips. Lazy-loaded so first paint stays fast; static monogram fallback when WebGL is unavailable; honors `prefers-reduced-motion`.
- 🟢 **Availability badge** — pulsing "Available for opportunities" status in the hero and footer
- ⌨️ **Typewriter roles** in the hero
- ⌘K **Command palette** — navigate sections, download the CV, copy the email, open socials, launch the AI assistant. Full keyboard control (↑ ↓ ↵ Esc).
- 🧭 **Fixed 9-section order** — Nav → Hero → About → Skills → Projects → Journey → GitHub Activity → Contact → Footer
- 📊 **Scroll progress bar** + ⬆️ back-to-top button
- 🛡️ **Branded 404** and lazy-loaded `/admin` route

### Content
- 📚 **Full case studies for all 4 projects** — Problem → Approach → Outcome with metric tiles, feature lists, stack chips, screenshot gallery (modal), and live/source links: Farooq Agencies, SpendSmart, E-Shop, School Management System
- 🔍 **Project search & filter** by keyword and tech stack
- 🧭 **Journey timeline** — 2021 → now: degree, desktop app in a real school, full-stack builds, certified internship, live client launch, and what's next
- 🐙 **GitHub Activity section** — live public-API data (repos, stars, followers, language distribution, recent events feed), cached 30 min in `localStorage`, graceful fallback when GitHub rate-limits

### Intelligence
- 🤖 **AI chatbot grounded in a fact sheet** — `POST /api/chat` (Vercel Serverless Function) calls **Z.AI GLM** (free, no API key) with `src/data/factSheet.js` injected as the system prompt, so answers about CGPA, projects, or contact info can't drift into hallucination. If the endpoint is unreachable (local dev, other hosts), the client silently falls back to the built-in rule-based engine — the chat never breaks. Replies are badged **AI** (GLM) or **instant** (local).

### Craft
- 📨 **Working contact form** — EmailJS with graceful `mailto:` fallback (see `.env.example`)
- 📄 **CV download** — `public/resume.pdf` wired through hero, footer and command palette
- 🖼️ **AI-generated OG image** (`public/og-image.jpg`, 1200×630) for Open Graph / Twitter Cards
- 🔍 **SEO** — canonical URL, Open Graph, Twitter Cards, JSON-LD Person schema, `robots.txt`, `sitemap.xml`
- 📱 **PWA** — installable via `manifest.json`
- 🎯 **Accessibility** — skip-link, ARIA labels/roles, focus-visible rings, `prefers-reduced-motion` (3D rotation pauses), keyboard-operable cards & palette
- 📐 **Responsive 360px → 1440px+** — 3D hero moves above the fold on mobile

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Lint
npm run lint

# Production build + preview
npm run build && npm run preview
```

## 🤖 Chatbot & the `/api` function

- `api/chat.js` deploys automatically as a **Vercel Serverless Function** (works with the Vite SPA — no Next.js involved). `z-ai-web-dev-sdk` is a regular dependency; Vercel bundles it for Node.
- Grounding data lives in **one file**: edit `src/data/factSheet.js` (it derives from `src/data/portfolio.js`) and the AI's knowledge updates with it.
- Abuse protection: in-memory IP rate limit (10 req/min per instance) + 20 s client timeout + strict message sanitization.
- Local dev has no `/api` route — the chatbot uses its rule-based fallback automatically (that's by design).

## 📁 Structure

```
api/chat.js                  → Z.AI GLM serverless endpoint (fact-sheet grounded)
src/components/HeroOrbit.jsx → R3F 3D orbit scene (lazy-loaded)
src/components/Hero.jsx      → hero with availability badge + 3D
src/components/CommandPalette.jsx → ⌘K launcher
src/components/Journey.jsx   → career timeline
src/components/GitHubActivity.jsx → live GitHub public-API section
src/components/Projects.jsx  → case studies (search/filter + modal)
src/components/ChatBot.jsx   → hybrid AI chat (GLM → rule-based fallback)
src/data/portfolio.js        → all content (projects, journey, skills, personal)
src/data/factSheet.js        → chatbot ground truth (edit here!)
public/og-image.jpg          → AI-generated social card
```

## 🚢 Deploy (Vercel)

1. Push to GitHub — Vercel auto-detects Vite.
2. No environment variables are required (chatbot + activity work keyless). Add `VITE_EMAILJS_*` vars when the contact form should send in-page.
3. Canonical/OG URLs point at `https://shoaibarshad-seven.vercel.app/` — update `index.html` if the domain changes.

## 🛠 Admin panel

`/admin` — in-session content editor for personal info, projects and skills (changes reset on reload; edit `src/data/portfolio.js` to persist).
