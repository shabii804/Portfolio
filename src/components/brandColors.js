/* Brand color per icon slug — drives per-skill hover glow (rails) and
   terminal skill bars. Monochrome marks (github, microsoftsqlserver) and
   unknown slugs fall back to the site accent. Kept out of TechIcon.jsx
   (react-refresh/only-export-components). */

const BRAND = {
  react: "#61dafb",
  javascript: "#f7df1e",
  typescript: "#3178c6",
  html5: "#e44d26",
  css3: "#1572b6",
  tailwindcss: "#38bdf8",
  figma: "#a259ff",
  recharts: "#818cf8",
  nodedotjs: "#68a063",
  express: "#c9d1d9",
  firebase: "#ffca28",
  supabase: "#3ecf8e",
  oracle: "#f80000",
  mysql: "#4479a1",
  mongodb: "#47a248",
  c: "#5c6bc0",
  cplusplus: "#00599c",
  csharp: "#823085",
  java: "#f89820",
  git: "#f05032",
  vscode: "#0ea5e9",
  visualstudio: "#8b5cf6",
  flutter: "#54c5f8",
  dart: "#0175c2",
  postman: "#ff6c37",
  whatsapp: "#25d366",
};

export const FALLBACK_BRAND = "#818cf8"; // site accent indigo

export function brandColorFor(slug) {
  return BRAND[slug] || FALLBACK_BRAND;
}
