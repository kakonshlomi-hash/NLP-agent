const { safeParseJSON } = require("./json-utils");

async function callClaude(instructions, userContent, { retries = 1 } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            { role: "user", content: instructions + "\n\n" + userContent },
          ],
        }),
      });

      const bodyText = await res.text();
      let data = null;
      try { data = JSON.parse(bodyText); } catch { /* גוף שאינו JSON */ }

      if (!res.ok) {
        const msg = data?.error?.message || bodyText.slice(0, 180) || `HTTP ${res.status}`;
        throw new Error(`API ${res.status}: ${msg}`);
      }
      if (data?.error) throw new Error("API: " + (data.error.message || "שגיאה לא ידועה"));
      if (!data) throw new Error("API: התקבלה תשובה שאינה JSON");

      const text = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
      const parsed = safeParseJSON(text);
      if (!parsed) throw new Error(data.stop_reason === "max_tokens" ? "TRUNCATED" : "PARSE");
      return parsed;
    } catch (e) {
      lastErr = e;
      const m = e.message || "";
      if (m === "TRUNCATED" || m === "PARSE" || m.startsWith("API 4")) break;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 700));
    }
  }
  throw lastErr;
}

module.exports = { callClaude };
