import { flushSync } from "react-dom";
import { useCallback, useEffect, useState } from "react";

const KEY = "sa-theme";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* private mode */
  }
  return "dark"; // the brand lives in dark; light is an opt-in
}

/**
 * Light/dark theme with a smooth cross-fade (html.theme-anim is applied for
 * the duration of the toggle only, so page load never animates colors).
 * Listens for the "sa:toggle-theme" window event so the command palette,
 * terminal and navbar can all trigger it.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    // Keep BOTH media-scoped theme-color metas in sync — the browser picks
    // per system preference, so we overwrite both to the active color
    const hex = theme === "dark" ? "#07070B" : "#F5F6FA";
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", hex));
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* private mode */
    }
    const t = setTimeout(() => root.classList.remove("theme-anim"), 550);
    return () => clearTimeout(t);
  }, [theme]);

  /* Toggle with a circular wipe from the button (View Transitions API when
     available, instant cross-fade fallback via .theme-anim otherwise). */
  const toggle = useCallback((origin) => {
    const apply = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    let reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* old engines */ }
    if (typeof document.startViewTransition !== "function" || reduce) {
      apply();
      return;
    }
    const root = document.documentElement;
    const x = origin?.x ?? window.innerWidth - 72;
    const y = origin?.y ?? 60;
    root.style.setProperty("--wipe-x", `${Math.round(x)}px`);
    root.style.setProperty("--wipe-y", `${Math.round(y)}px`);
    document.startViewTransition(() => flushSync(apply));
  }, []);

  useEffect(() => {
    const onToggle = (e) => toggle(e?.detail);
    window.addEventListener("sa:toggle-theme", onToggle);
    return () => window.removeEventListener("sa:toggle-theme", onToggle);
  }, [toggle]);

  return { theme, toggle };
}
