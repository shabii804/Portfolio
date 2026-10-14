// Client-side bridge to the /api/chat GLM endpoint.
// Returns { reply, source } on success, or null on any failure so the caller
// can fall back to the local rule-based engine (chatbotLogic.js).

export async function askAI(history) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-8) }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.ok || typeof data.reply !== "string" || !data.reply.trim()) return null;

    return { reply: data.reply.trim(), source: data.source || "glm" };
  } catch {
    return null; // offline / rate-limited / endpoint missing → rule-based fallback
  }
}
