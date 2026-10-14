# Shoaib Arshad — Portfolio

> Personal portfolio website for Shoaib Arshad, Full Stack Web Developer & Java Desktop Application Developer.

Built with **React 19**, **Vite 8**, and **Tailwind CSS 3**. No Next.js, no other frameworks — pure React.

## ✨ Features

- 🎨 **Cosmic dark-mode design** with animated particle canvas, gradient blobs, and grid backdrop
- 🌗 **Light/dark theme toggle** with system persistence (saved to `localStorage`)
- ⌨️ **Typewriter effect** for rotating role titles in the hero
- 🖼️ **3D tilt profile card** with hover interactivity
- 🤖 **Built-in chatbot** answering questions about projects, skills, education & contact info
- 📨 **Working contact form** powered by EmailJS (graceful `mailto:` fallback when not configured)
- 🔍 **Project search & filter** by tech stack and keyword
- 📊 **Scroll progress bar** at the top of the page
- ⬆️ **Back-to-top floating button** appears after scrolling
- 🚀 **Lazy-loaded routes** (`/admin`, `/*`) for faster initial paint
- 🛡️ **Branded 404 page** for unknown URLs
- 🔐 **SEO-ready**: Open Graph, Twitter Cards, JSON-LD structured data, `robots.txt`, `sitemap.xml`
- 📱 **PWA support**: installable on mobile/desktop via `manifest.json`
- 🎯 **Accessibility**: `prefers-reduced-motion` support, skip-to-content link, ARIA labels, focus-visible
- 🛠️ **Admin panel** at `/admin` for editing portfolio content in-session

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview the production build
npm run preview

# Lint
npm run lint
```

## 🔧 Configuration

### Contact Form (EmailJS)

The contact form works without any backend via [EmailJS](https://www.emailjs.com/).
Until configured, it gracefully falls back to opening the visitor's email client.

1. Create a free account at https://dashboard.emailjs.com/
2. Set up a **Service** (e.g. Gmail) and a **Template**
3. Copy your credentials into a `.env` file (see `.env.example`):

```bash
cp .env.example .env
```

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

The template should accept these variables: `name`, `email`, `subject`, `message`, `to_email`, `portfolio_owner`.

### Static Assets

Place these files in `public/`:

| File | Purpose |
|------|---------|
| `profile.png` / `profile.jpeg` | Profile photo shown in hero & navbar |
| `resume.pdf` | Downloadable resume (hero + footer) |
| `favicon.svg` | Browser tab icon |
| `screenshots/*.png` | Project screenshots (referenced in `portfolio.js`) |

### Editing Content

All portfolio content lives in [`src/data/portfolio.js`](src/data/portfolio.js):

- `defaultPersonal` — name, bio, contact info, social links
- `defaultProjects` — project list (title, description, stack, screenshots, links)
- `defaultSkills` — categorized skill chips
- `defaultExperience` — work experience timeline entries

The chatbot's knowledge base lives in [`src/data/portfolioKnowledge.js`](src/data/portfolioKnowledge.js).

## 📂 Project Structure

```
src/
├── components/
│   ├── About.jsx           # About section
│   ├── BackToTop.jsx       # Floating scroll-to-top button
│   ├── ChatBot.jsx         # Inline chatbot window
│   ├── ChatButton.jsx      # Floating chat + WhatsApp buttons
│   ├── Contact.jsx         # Contact form (EmailJS) + direct links
│   ├── Experience.jsx      # Work experience + education timeline
│   ├── Footer.jsx          # Footer with links & resume actions
│   ├── Hero.jsx            # Hero section with particle canvas + typewriter
│   ├── LoadingFallback.jsx # Suspense fallback spinner
│   ├── Navbar.jsx          # Sticky nav with theme toggle + mobile menu
│   ├── NotFound.jsx        # 404 page (lazy-loaded)
│   ├── Projects.jsx        # Projects grid with search & filter
│   ├── ScrollProgress.jsx  # Top scroll-progress bar
│   └── Skills.jsx          # Skills grid + proficiency bars
├── context/
│   ├── PortfolioContext.jsx     # Provider component
│   └── portfolioContextObject.js # createContext (separated for Fast Refresh)
├── hooks/
│   └── usePortfolio.js     # Context hook (separated for Fast Refresh)
├── data/
│   ├── portfolio.js        # All portfolio content
│   └── portfolioKnowledge.js # Chatbot FAQ knowledge base
├── pages/
│   └── Admin.jsx           # /admin route (in-session editor + copy polisher)
├── utils/
│   └── chatbotLogic.js     # Chatbot matching logic
├── App.jsx                 # Main page composition
├── main.jsx                # Entry point + router
├── index.css              # Tailwind + custom styles
└── styles/                 # Component-specific CSS (chatbot, etc.)
```

## 🛠️ Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Routing | react-router-dom 7 |
| Email | @emailjs/browser 4 |
| Fonts | Space Grotesk (display), Inter (body), JetBrains Mono (mono) |

## 📦 Deployment

This is a static site — deploy the `dist/` folder anywhere:

- **Vercel**: `npm i -g vercel && vercel --prod`
- **Netlify**: drag-and-drop the `dist/` folder, or connect the repo with build command `npm run build` and publish directory `dist`
- **GitHub Pages**: `npm run build` then publish `dist/` via `gh-pages` package
- **Firebase Hosting**: `firebase init` then `firebase deploy`

## 📄 License

MIT © Shoaib Arshad
