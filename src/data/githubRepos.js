/* ─────────────────────────────────────────────────────────────────────────────
   GitHub repos → project cards (v32).

   The /projects page shows the admin-curated case studies FIRST, then every
   other public repo synced live from the GitHub API (useGithubRepos hook).
   This module holds:

     · SEED_REPOS      — a baked snapshot of the user's public repos (fetched
                         2026-10-17) so the archive is never empty when the
                         API is rate-limited / offline. The hook refreshes it
                         live and caches for 30 min (same recipe as
                         GitHubActivity).
     · mapGithubRepos  — pure mapper: raw GitHub API repos → ProjectCard-shape
                         objects (deduped against the curated list, profile
                         README repo and forks excluded).
   ──────────────────────────────────────────────────────────────────────────── */

export const GH_USER = "shabii804";

/* GitHub's official language colors — accents for the synced cards. */
export const LANG_HEX = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dart: "#00B4AB",
  Python: "#3572A5",
  PHP: "#4F5D95",
  Shell: "#89e051",
};

/* Repos that are NOT projects: the profile-README repo and any fork. */
const NON_PROJECT_REPOS = new Set(["shabii804"]);

/* Hand-polished display titles for repos whose names are abbreviations or
   have casing quirks. Everything else goes through prettifyRepoName(). */
const TITLE_OVERRIDES = {
  "Portfolio": "Portfolio (This Site)",
  "FlutterTasks": "Flutter Tasks",
  "pulse-tech": "Pulse Tech",
  "coparete": "Coparete",
  "School-Mangment-System-app": "School Management App (TS)",
  "Spend-Smart": "Spend Smart (Flutter)",
  "card": "Business Card Site",
  "keybord": "Keybord",
  "Calculor": "Calculor",
  "Prlor": "Prlor",
  "Fashion-Web": "Fashion Web — LuxeHer",
  "E-Shop-Website": "E-Shop Website",
  "Nexus-project": "Nexus Project",
  "Background-Color-change": "Background Color Changer",
  "Digital-clock": "Digital Clock",
  "Hospital-Management-System": "Hospital Management System (C++)",
  "Student-Managment-in-Java-GUI-using-OOP": "Student Management — Java GUI (OOP)",
  "School-Mangment-System-C-": "School Management System (C++)",
};

export function prettifyRepoName(name) {
  return (
    TITLE_OVERRIDES[name] ||
    name
      .replace(/[-_]+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/* ─── Baked snapshot (sort=pushed) ────────────────────────────────────────── */
export const SEED_REPOS = [
  { name: "Portfolio", description: "Personal portfolio — the site you are looking at. React 19 + Vite + Tailwind, deployed on Vercel.", language: "JavaScript", stargazers_count: 1, forks_count: 0, homepage: "https://shoaibarshad-seven.vercel.app", html_url: "https://github.com/shabii804/Portfolio", topics: [], pushed_at: "2026-10-17T00:00:00Z", created_at: "2026-06-13T00:00:00Z" },
  { name: "FlutterTasks", description: "Mobile application development coursework — a set of assigned Flutter tasks.", language: "C++", stargazers_count: 1, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/FlutterTasks", topics: [], pushed_at: "2026-10-16T00:00:00Z", created_at: "2026-10-09T00:00:00Z" },
  { name: "pulse-tech", description: "", language: "HTML", stargazers_count: 0, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/pulse-tech", topics: [], pushed_at: "2026-10-15T00:00:00Z", created_at: "2026-10-15T00:00:00Z" },
  { name: "coparete", description: "", language: "TypeScript", stargazers_count: 0, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/coparete", topics: [], pushed_at: "2026-10-15T00:00:00Z", created_at: "2026-10-15T00:00:00Z" },
  { name: "School-Mangment-System-app", description: "", language: "TypeScript", stargazers_count: 0, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/School-Mangment-System-app", topics: [], pushed_at: "2026-10-15T00:00:00Z", created_at: "2026-10-15T00:00:00Z" },
  { name: "Spend-Smart", description: "", language: "Dart", stargazers_count: 1, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/Spend-Smart", topics: [], pushed_at: "2026-10-14T00:00:00Z", created_at: "2026-10-11T00:00:00Z" },
  { name: "card", description: "", language: "HTML", stargazers_count: 1, forks_count: 0, homepage: "https://mrprofessinals.vercel.app", html_url: "https://github.com/shabii804/card", topics: [], pushed_at: "2026-10-09T00:00:00Z", created_at: "2026-10-09T00:00:00Z" },
  { name: "keybord", description: "", language: "TypeScript", stargazers_count: 1, forks_count: 0, homepage: "https://keybord-teal.vercel.app", html_url: "https://github.com/shabii804/keybord", topics: [], pushed_at: "2026-10-02T00:00:00Z", created_at: "2026-10-02T00:00:00Z" },
  { name: "Calculor", description: "", language: "TypeScript", stargazers_count: 1, forks_count: 0, homepage: "https://calculor-xi.vercel.app", html_url: "https://github.com/shabii804/Calculor", topics: [], pushed_at: "2026-09-17T00:00:00Z", created_at: "2026-09-17T00:00:00Z" },
  { name: "Prlor", description: "", language: "TypeScript", stargazers_count: 1, forks_count: 0, homepage: "https://ashajan.vercel.app", html_url: "https://github.com/shabii804/Prlor", topics: [], pushed_at: "2026-07-15T00:00:00Z", created_at: "2026-07-13T00:00:00Z" },
  { name: "Fashion-Web", description: "LuxeHer is a luxury fashion e-commerce website offering stylish clothing with a modern shopping experience.", language: "HTML", stargazers_count: 1, forks_count: 0, homepage: "https://fashion-web-seven-peach.vercel.app", html_url: "https://github.com/shabii804/Fashion-Web", topics: [], pushed_at: "2026-06-17T00:00:00Z", created_at: "2026-06-14T00:00:00Z" },
  { name: "E-Shop-Website", description: "A desktop eCommerce frontend built with React and Bootstrap, implementing product listing and cart interactions.", language: "JavaScript", stargazers_count: 3, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/E-Shop-Website", topics: [], pushed_at: "2026-04-11T00:00:00Z", created_at: "2026-04-11T00:00:00Z" },
  { name: "Nexus-project", description: "Internship task — Nexus project build.", language: "TypeScript", stargazers_count: 3, forks_count: 0, homepage: "https://nexus-project-by-shoaib.vercel.app", html_url: "https://github.com/shabii804/Nexus-project", topics: [], pushed_at: "2026-04-11T00:00:00Z", created_at: "2026-04-11T00:00:00Z" },
  { name: "Background-Color-change", description: "", language: "CSS", stargazers_count: 3, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/Background-Color-change", topics: [], pushed_at: "2026-01-30T00:00:00Z", created_at: "2026-01-30T00:00:00Z" },
  { name: "Digital-clock", description: "Digital clock using HTML, CSS and JavaScript with time format switching.", language: "JavaScript", stargazers_count: 3, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/Digital-clock", topics: [], pushed_at: "2026-01-05T00:00:00Z", created_at: "2026-01-05T00:00:00Z" },
  { name: "Hospital-Management-System", description: "C++ Hospital Management System using Data Structures.", language: "C++", stargazers_count: 4, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/Hospital-Management-System", topics: [], pushed_at: "2025-12-15T00:00:00Z", created_at: "2025-12-15T00:00:00Z" },
  { name: "Student-Managment-in-Java-GUI-using-OOP", description: "A Java GUI-based School Management System built using Object-Oriented Programming.", language: "Java", stargazers_count: 4, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/Student-Managment-in-Java-GUI-using-OOP", topics: [], pushed_at: "2025-10-25T00:00:00Z", created_at: "2025-10-25T00:00:00Z" },
  { name: "School-Mangment-System-C-", description: "A C++ Console-Based Student Management System using structures.", language: "C++", stargazers_count: 4, forks_count: 0, homepage: "", html_url: "https://github.com/shabii804/School-Mangment-System-C-", topics: [], pushed_at: "2025-10-25T00:00:00Z", created_at: "2025-10-25T00:00:00Z" },
];

/* ─── Mapper: raw GitHub API repos → ProjectCard-shape objects ──────────────
   curatedUrls: Set of lowercase github URLs already presented as case
   studies — those repos are skipped so nothing appears twice. */
export function mapGithubRepos(rawRepos, curatedUrls) {
  const curated = curatedUrls instanceof Set ? curatedUrls : new Set(curatedUrls || []);
  const seen = new Set();
  const out = [];

  for (const r of Array.isArray(rawRepos) ? rawRepos : []) {
    if (!r?.name || r.fork || NON_PROJECT_REPOS.has(r.name)) continue;
    const url = (r.html_url || `https://github.com/${GH_USER}/${r.name}`).replace(/\/$/, "").toLowerCase();
    if (curated.has(url) || seen.has(url)) continue;
    seen.add(url);

    const title = prettifyRepoName(r.name);
    const language = r.language || "Code";
    const stack = [language, ...(r.topics || [])].filter(Boolean).slice(0, 5);
    const year = (r.created_at || "").slice(0, 4) || "";
    const desc = (r.description || "").trim();

    out.push({
      id: `gh-${r.name.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
      num: null, // assigned by the consumer (continues after the curated ones)
      title,
      subtitle: `${language} · synced from GitHub`,
      tagline: desc || `${title} — ${language} build, straight from GitHub.`,
      description: desc || `${title} is a public repository on GitHub. Open the source to browse the code, commits and history.`,
      date: year,
      badge: (r.stargazers_count || 0) > 0 ? `★ ${r.stargazers_count} · GitHub` : "GitHub",
      live: r.homepage || null,
      github: r.html_url,
      accentHex: LANG_HEX[language] || "#818cf8",
      stack,
      features: [],
      details: [],
      impact: [],
      screenshots: [],
      caseStudy: null,
      source: "github",
      ghMeta: {
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        language,
        pushedAt: r.pushed_at || null,
        topics: r.topics || [],
        url: r.html_url,
      },
    });
  }
  return out;
}
