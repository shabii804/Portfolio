import { useEffect } from "react";

/* Per-page <title> + meta description for the multi-page build (v28).
   Restores the previous values on unmount so admin-runtime overrides and
   the index.html defaults never leak across route changes. */
const DEFAULT_TITLE = "Shoaib Arshad — Full Stack Developer | React, Node.js, Java, Flutter";

export default function usePageSEO(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const prevTitle = document.title;
    const prevDesc = meta?.getAttribute("content") ?? null;

    document.title = title || DEFAULT_TITLE;
    if (description && meta) meta.setAttribute("content", description);

    return () => {
      document.title = prevTitle;
      if (prevDesc && meta) meta.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}
