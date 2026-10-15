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
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#07070B" : "#F3F3F8");
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* private mode */
    }
    const t = setTimeout(() => root.classList.remove("theme-anim"), 550);
    return () => clearTimeout(t);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  useEffect(() => {
    const onToggle = () => toggle();
    window.addEventListener("sa:toggle-theme", onToggle);
    return () => window.removeEventListener("sa:toggle-theme", onToggle);
  }, [toggle]);

  return { theme, toggle };
}
