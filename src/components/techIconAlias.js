/* Skill-name → icon-slug resolution (shared by TechIcon and Skills rails).
   Kept out of TechIcon.jsx so that file stays a pure component module
   (react-refresh/only-export-components). */

const ALIAS = {
  // frontend
  "react": "react", "react.js": "react", "react (vite)": "react", "reactjs": "react", "react native": "react", "context api": "react",
  "javascript": "javascript", "javascript es6+": "javascript", "js": "javascript", "es6+": "javascript",
  "html": "html5", "html5": "html5",
  "css": "css3", "css3": "css3",
  "tailwind": "tailwindcss", "tailwind css": "tailwindcss", "tailwindcss": "tailwindcss",
  "figma": "figma",
  "recharts": "recharts", "charts": "recharts", "data visualization": "recharts",
  // backend
  "node": "nodedotjs", "node.js": "nodedotjs", "nodejs": "nodedotjs",
  "express": "express", "express.js": "express", "expressjs": "express",
  "firebase": "firebase", "firebase authentication": "firebase", "firebase firestore": "firebase", "firebase hosting": "firebase", "firestore": "firebase",
  "supabase": "supabase",
  "rest apis": "braces", "rest api": "braces", "api": "braces", "apis": "braces", "restful api": "braces",
  // databases
  "microsoft sql server": "microsoftsqlserver", "mssql": "microsoftsqlserver", "sql server": "microsoftsqlserver",
  "oracle": "oracle", "oracle db": "oracle",
  "sql": "database", "database": "database", "databases": "database",
  // v22 — extended brand set (local color bundle)
  "typescript": "typescript", "ts": "typescript",
  "flutter": "flutter", "dart": "dart",
  "mysql": "mysql", "mongodb": "mongodb", "mongo": "mongodb",
  "postman": "postman",
  // languages
  "c": "c", "c++": "cplusplus", "cpp": "cplusplus", "c#": "csharp", "csharp": "csharp",
  "java": "java", "swing": "java",
  // tools
  "git": "git", "github": "github",
  "vs code": "vscode", "vscode": "vscode", "visual studio code": "vscode",
  "visual studio": "visualstudio",
  "whatsapp": "whatsapp", "whatsapp integration": "whatsapp",
  "agile": "infinity", "agile methodology": "infinity", "scrum": "infinity",
  "oop": "boxes", "object oriented programming": "boxes",
  // soft skills
  "communication": "message-circle", "problem solving": "lightbulb",
  "teamwork": "users", "collaboration": "users",
  "adaptability": "refresh-ccw", "time management": "clock",
  // category headers (Skills.jsx)
  "frontend": "code", "backend": "server", "languages": "binary", "tools": "wrench", "soft skills": "handshake",
  // About.jsx focus areas
  "web apps": "code", "desktop systems": "boxes", "ui engineering": "figma",
  // slug identities — headers/categories pass slugs straight through
  "code": "code", "server": "server", "binary": "binary", "wrench": "wrench",
  "handshake": "handshake", "infinity": "infinity",
  "boxes": "boxes", "braces": "braces", "clock": "clock", "lightbulb": "lightbulb",
  "users": "users", "message-circle": "message-circle", "refresh-ccw": "refresh-ccw",
};

/** Resolve a display name to an icon slug (null when unknown).
 *  Handles compound labels: "Node.js / Express" → node.js, "SQL / MSSQL" → sql,
 *  "JavaScript (ES6+)" → javascript. */
export function iconSlugFor(name) {
  const raw = String(name || "").trim();
  if (!raw) return null;
  const key = raw.toLowerCase();
  if (ALIAS[key]) return ALIAS[key];
  for (const part of key.split("/")) {
    const p = part.trim();
    if (ALIAS[p]) return ALIAS[p];
  }
  const stripped = key.replace(/\s*\([^)]*\)/g, "").trim();
  if (ALIAS[stripped]) return ALIAS[stripped];
  return null;
}
