/* Primary + gradient hues per journey milestone — shared by TimelineItem
   (badges, year gradient, card tint) and Journey (nodes, connectors).
   Separate file: react-refresh/only-export-components forbids non-component
   exports alongside components. */

export const TAG_COLORS = {
  Education: "#6366f1",
  Desktop: "#0ea5e9",
  "Full-Stack": "#6366f1",
  Internship: "#f59e0b",
  "Client Work": "#22d3ee",
  Next: "#8b5cf6",
};

export const TAG_GRADIENTS = {
  Education: ["#6366f1", "#8b5cf6"],
  Desktop: ["#0ea5e9", "#22d3ee"],
  "Full-Stack": ["#6366f1", "#22d3ee"],
  Internship: ["#f59e0b", "#f97316"],
  "Client Work": ["#22d3ee", "#10b981"],
  Next: ["#8b5cf6", "#ec4899"],
};
