function safeParseJSON(text) {
  if (!text) return null;
  let t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const first = t.indexOf("{");
  if (first === -1) return null;
  const last = t.lastIndexOf("}");
  // ניסיון ראשון: JSON שלם ותקין
  if (last !== -1) {
    try { return JSON.parse(t.slice(first, last + 1)); } catch { /* נמשיך לתיקון */ }
  }
  // ניסיון שני (רשת ביטחון): תיקון JSON שנקטע — חיתוך לאיבר שלם אחרון וסגירת סוגריים פתוחים
  let s = t.slice(first);
  // הסר זנב חלקי אחרי האיבר השלם האחרון
  const cut = Math.max(s.lastIndexOf('"}'), s.lastIndexOf("]"), s.lastIndexOf("}"));
  if (cut > 0) s = s.slice(0, cut + 1);
  // אזן סוגריים שנותרו פתוחים (מחוץ למחרוזות)
  let depthC = 0, depthB = 0, inStr = false, esc = false;
  for (const ch of s) {
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') inStr = !inStr;
    if (inStr) continue;
    if (ch === "{") depthC++; else if (ch === "}") depthC--;
    else if (ch === "[") depthB++; else if (ch === "]") depthB--;
  }
  s = s.replace(/,\s*$/, "");
  s += "]".repeat(Math.max(0, depthB)) + "}".repeat(Math.max(0, depthC));
  try { return JSON.parse(s); } catch { return null; }
}

module.exports = { safeParseJSON };
