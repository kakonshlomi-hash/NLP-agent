function mergeLists(a, b, max = 5) {
  const seen = new Set();
  return [...(a || []), ...(b || [])].filter((x) => {
    const k = String(x || "").trim();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, max);
}

export function buildClientCard(analysis, profile, sessionNumber, rapport, prevCard) {
  const prev = prevCard || {};
  const sessionRecord = {
    n: sessionNumber,
    date: new Date().toLocaleDateString("he-IL"),
    rapport,
    techniques: (analysis.technique_recommendations || []).map((t) => t.name).slice(0, 2),
  };
  return {
    client: { name: profile.name, background: profile.background, challenge: profile.challenge },
    last_session: sessionNumber,
    updated: new Date().toLocaleDateString("he-IL"),
    identity: {
      vak_dominant: analysis.vak?.dominant || prev.identity?.vak_dominant || "",
      language_recommendation: analysis.vak?.language_recommendation || prev.identity?.language_recommendation || "",
      core_values: mergeLists(prev.identity?.core_values, analysis.values_beliefs?.core_values),
      limiting_beliefs: mergeLists(prev.identity?.limiting_beliefs, analysis.values_beliefs?.limiting_beliefs),
      empowering_beliefs: mergeLists(prev.identity?.empowering_beliefs, analysis.values_beliefs?.empowering_beliefs),
    },
    history: {
      sessions: [...(prev.history?.sessions || []), sessionRecord],
      open_threads: prev.history?.open_threads || [],
    },
    program: analysis.program || prev.program || null,
  };
}

export function parseClientCard(text) {
  if (!text || !text.trim()) return null;
  const t = text.trim().replace(/```json|```/g, "").trim();
  try { return JSON.parse(t); } catch { return null; }
}

export async function extractCardFromFile(file) {
  try {
    const text = await file.text();
    const m = text.match(/<script[^>]+id="nlp-client-card"[^>]*>([\s\S]*?)<\/script>/i);
    if (m) { try { return JSON.parse(m[1].trim()); } catch { /* continue */ } }
    return parseClientCard(text);
  } catch { return null; }
}
