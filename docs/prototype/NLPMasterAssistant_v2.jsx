import React, { useState, useEffect } from "react";
import {
  Brain, FileText, Sparkles, AlertTriangle, ShieldAlert, Info,
  Copy, Check, Loader2, Eye, Ear, Hand, MessageSquare, Lock,
  Wand2, BookOpen, Users
} from "lucide-react";

/* =========================================================================
   NLP Master Assistant — v2 (Artifact Edition)
   כלי תמיכת-החלטה למנחה NLP ברמת Master Practitioner.
   ========================================================================= */

const RAPPORT_THRESHOLD = 6;

/* ---- שאלונים מובנים (מוצגים נאמן למקור — לא עוברים דרך ה-LLM) ---- */
const QUESTIONNAIRES = {
  "הטבעה מחדש": {
    title: "הטבעה מחדש — שינוי אמונת שורש",
    intro: [
      "אירוע משמעותי מהעבר בו התפתחה אצל האדם אמונה או אשכול אמונות; לרוב ברמת הזהות.",
      "גיל ההטבעה (Imprint Period) הוא 0–7. כוונת-העל בזמן ההטבעה היא הישרדות.",
      "הטבעה נוצרת לרוב מחיקוי דמויות סמכות (הורים), אמירותיהם והסביבה התרבותית.",
    ],
    legend: "מקרא עמדות: עמדה 1 = מונחה בחיבור · עמדה 2 = אנשים משמעותיים בחיבור · עמדה 3 = מונחה בא-חיבור",
    sections: [
      { h: "שיחה מקדימה לחשיפת האמונה השורשית", items: [
        "מה המטרה שקשה לך להשיג?",
        "מה מונע ממך להגיע למטרה? איזו אמונה מסתתרת מאחורי זה? מה אתה חושב שחסר בך כדי להשיג אותה?",
        "איך אתה יודע שהאמונה נכונה? מה הקריטריונים וההוכחות שלך לכך?",
        "מה זה אומר עבורך שהאמונה נכונה? למה זה חשוב לך?",
      ]},
      { h: "הפקת קו זמן והרפיה", items: [
        "הפקת קו זמן יזומה: לברר אם העתיד קדימה והעבר אחורה, או העתיד מימין והעבר משמאל.",
        "הרפיה בינונית.",
      ]},
      { h: "הכנת עוגן רגשי לרגרסיה", items: [
        "להיזכר בשני מקרים שבהם האמונה השלילית באה לידי ביטוי — מה מרגיש? מה חש בגוף?",
        "יצירת עוגן שלילי המכיל את התחושות הפיזיות והרגשיות השליליות (ברך ימין).",
      ]},
      { h: "מעבר לאירוע ההטבעה (עמדה 1)", items: [
        "לחיצה על העוגן השלילי כגשר רגשי-פיזי ללכת אחורה בזמן עד האירוע הראשוני.",
        '"בזמן שאתה הולך אחורה לאט בזמן, האם האמונה המגבילה קיימת כאן?" (בכל נקודת עצירה).',
        "תמשיך לצעוד אחורה — אם לא, צעד קדימה לאירוע שבו הופיעה לראשונה — בן כמה אתה?",
      ]},
      { h: "שחזור אירוע ההטבעה (עמדה 1)", items: [
        "מה קורה באירוע? מה אתה רואה? שומע? עם מי אתה נמצא?",
        "מה קרה שם בדיוק שיצר את האמונה המגבילה?",
        "מה אתה מרגיש? מה אתה חושב? מה אתה חש בגוף?",
      ]},
      { h: "מציאת תובנות (עמדה 3)", items: [
        "כשאתה מביט בעצמך הצעיר כצופה מן הצד — מה האירוע בא ללמד אותך?",
        "מה אולי הרווחת באופן עקיף מהאירוע? מה הכוונה החיובית של אירוע ההטבעה?",
        "למה היה שווה לך לשמר את הסימפטומים שיצר האירוע עד היום?",
      ]},
      { h: "זיהוי המשמעותיים (עמדה 3)", items: [
        "מיהם האנשים המשמעותיים שהיו מעורבים באירוע?",
        "איפה אתה ממקם את האנשים המשמעותיים במרחב?",
      ]},
      { h: "תשאול המשמעותיים (עמדה 2)", items: [
        "להיכנס לגופו של האדם המשמעותי ולהתחבר לאמונות, לערכים, לזיכרונות ולהתנהגות שלו.",
        '"כשאתה בתוך נעליו של המשמעותי, איך אתה חווה את האירוע?"',
        '"מה הכוונה החיובית שלך באופן שבו נהגת עבור המונחה?" [זהה לכל משמעותי]',
      ]},
      { h: "זיהוי משאב חסר למשמעותיים (עמדה 3)", items: [
        "מה היה חסר למשמעותיים אז באירוע?",
        "האם יש משאב משותף שלו היו נוהגים אחרת?",
      ]},
      { h: "חיבור למשאב החסר (עמדה 3 ← עמדה 1)", items: [
        "לנוע קדימה על קו הזמן ולמצוא אירוע שבו המשאב היה קיים אצלך בשפע.",
        "להטעין את המשאב בעוגן חיובי (ברך שמאל). לשחרר ולעלות לעמדה 3.",
      ]},
      { h: "שליחת המשאב למשמעותיים (עמדה 3)", items: [
        "לנוע לכיוון אירוע ההטבעה ולשדר את המשאב למשמעותיים — לחיצה על העוגן החיובי.",
        '"כשאתה משדר את המשאב למשמעותיים, איך זה נראה? מה אתה מרגיש?"',
      ]},
      { h: "העברת המשאב למשמעותיים (עמדה 2)", items: [
        "לרדת לאדם המשמעותי ולמלא אותו במשאב — לדבר אליו בגוף ראשון.",
        '"מה השינוי שאתה מרגיש? איך אתה מתנהג אחרת כעת?" [לכל המשמעותיים]',
      ]},
      { h: "הטבעה מחדש (עמדה 1)", items: [
        "לשחרר את העוגן החיובי, לצאת מגופי המשמעותיים ולחזור לעצמך.",
        '"כשאתה חוזר לעצמך הצעיר, איך משתנה החוויה? מה משתנה? איך משתנות האמונות שלך?"',
        '"איזו אמונה חדשה מתגבשת בך כעת? במה אתה מתחיל להאמין?"',
      ]},
      { h: "ניקוי קו הזמן ובדיקה וסיום", items: [
        "להתקדם להווה — איך אתה מקרין את האמונה החדשה בכל נקודה על קו הזמן?",
        "דרך ההווה לעתיד הקרוב — איך האמונה החדשה משנה את ההתנהגות?",
        'סיום: הובלה עתידית — "מהיום והלאה...", ויציאה מהרפיה.',
      ]},
    ],
  },
};

/* ---- פרומפטים ---- */
const SYSTEM_PROMPT = `אתה מנוע ניתוח NLP (Neuro-Linguistic Programming) עבור מנחה מקצועי ברמת Master Practitioner.
כתוב הכל בעברית מקצועית ברמת עמיתים — ללא הסברי רקע ובלי הגדרות בסיסיות.
שפה: כתוב כל מונח בעברית, והוסף את המונח הלועזי בסוגריים בפעם הראשונה שהוא מופיע. אל תכתוב מונח באנגלית בלבד.
הסתמך אך ורק על בסיס הידע שלהלן. אל תמציא מודלים או טכניקות שאינם ברשימה.

== מערכת ייצוג (VAK) ==
V חזותי · A שמיעתי · K תחושתי · Ad דיאלוג פנימי (Auditory Digital). אבחן לפי מנבאים לשוניים (predicates) בשפה.

== מודל מטא (Meta Model) — 3 קטגוריות ==
מחיקה (מחיקה פשוטה, אינדקס התייחסות חסר, פעלים לא-מוגדרים, מחיקת השוואה),
הכללה (מכמתים אוניברסליים, אופרטורים מודאליים),
עיוות (קריאת מחשבות, פרפורמטיב אבוד, סיבה-תוצאה, אקוויוולנט מורכב, הנחות מוקדמות, נומינליזציות).
לכל הפרה: ציטוט + קטגוריה + שאלת תיגור.

== מטא-תוכניות (Meta Programs) (6) ==
כיוון מוטיבציה (לקראת/הרחק), מסגרת התייחסות (פנימי/חיצוני), גודל נתח (chunk: גלובלי/ספציפי),
ציר זמן, דמיון/הבדל, פרוצדורלי/אפשרויות.

== טכניקות בסיסיות (12) ==
שאלון מקדם מטרה, החלפת מפות, זבוב על הקיר, מחולל התנהגות חדשה, עוגן, מעגל המצוינות,
וולט דיסני, הכנסת מטרה לשרירים, סוויש ויזואלי, שיחה עם חלק, טיפול מהיר בפוביה (FPC), דמיון מודרך.

== טכניקות מתקדמות (11) ==
שינוי היסטוריה, מיפוי ערכים, איחוי חלקים, הטבעה מחדש, משמיד ההחלטות, שינוי אמונות בהליכה,
יועצים פנימיים, שחרור ממלכוד, שחרור מתלות רגשית, יציאה ממעגל ההתמכרות, רמות לוגיות ו-Dilts.

== תקינות מטרה (Well-Formed Outcome / WFO) ==
תנאים: מנוסחת חיובית, ביוזמת/שליטת המונחה, ספציפית להקשר, בעלת עדות חושית, נשענת על משאבים, עוברת אקולוגיה.
goal_well_formed הוא מידע בלבד — לא חסם. אם אינה מלאה, ציין ב-goal_note אילו תנאים חסרים, אך המשך להמליץ על טכניקות מתאימות.

== ייחוס דוברים (קריטי) ==
התמליל אינו מסומן בדוברים. נתח VAK, Meta Model, ערכים ואמונות אך ורק לפי אמירות שמקורן במונחה.
התעלם מאמירות המנחה (שאלות פתוחות, שיקוף, Pacing, Milton) — הן אינן עדות על מפת המונחה.
אמירה שהמונחה מצטט מפי אדם אחר אינה אמונה של המונחה.
כשאינך בטוח מי הדובר — רשום בשדה speaker_uncertainty עם assumed.

== דגלים אדומים ==
סמן מצבים שעשויים לחרוג מתחום ה-NLP (מצוקה נפשית חריפה, אובדנות, חשד לפסיכופתולוגיה). אל תאבחן.

לכל תובנה ציין מקור מתוך: "פרופיל" / "תמליל" / "הערות".

החזר JSON תקין בלבד, ללא טקסט עוטף וללא markdown. היה תמציתי. מבנה מדויק:
{
 "vak":{"dominant":"V|A|K|Ad","scores":{"V":0,"A":0,"K":0,"Ad":0},"evidence":[{"quote":"","source":""}],"language_recommendation":""},
 "state":"תיאור מצב רגשי (State) עדכני",
 "pacing_recommendations":["",""],
 "meta_model":[{"quote":"","category":"מחיקה|הכללה|עיוות","pattern":"","challenge":"","source":""}],
 "values_beliefs":{"core_values":[""],"limiting_beliefs":[""],"empowering_beliefs":[""]},
 "goal_well_formed":true,
 "goal_note":"",
 "internal_conflict_detected":false,
 "technique_recommendations":[{"name":"","table":"בסיסית|מתקדמת","difficulty":"","rationale":"","expected_outcome":""}],
 "red_flags":[{"type":"","note":""}],
 "speaker_uncertainty":[{"quote":"","assumed":"מונחה|מנחה|צד-שלישי","note":""}]
}
מגבלות תמציתיות (חובה):
· ציטוטים: עד 8 מילים. אל תשכפל ציטוט שכבר הופיע.
· vak.evidence: עד 3 · pacing_recommendations: עד 2 · meta_model: עד 4 · ערכים/אמונות: עד 3 בכל קטגוריה.
· technique_recommendations: בדיוק 3, מדורגות לפי התאמה · rationale ו-expected_outcome: משפט אחד קצר.
· state ו-goal_note: משפט אחד. אל תוסיף שדות מעבר לסכמה.
speaker_uncertainty: רק כשאי-אפשר להכריע. אם אין — החזר [].`;

const PLAN_PROMPT = `אתה מנוע תכנון מסע הנחיה ב-NLP עבור מנחה ברמת Master Practitioner. כתוב בעברית; מונח לועזי — בעברית עם הלועזי בסוגריים.
יינתנו לך מספר הפגישה, תקציר הניתוח, ואולי תוכנית קודמת.
החזר JSON תקין בלבד, ללא טקסט עוטף וללא markdown, במבנה מדויק:
{"program":{"total_sessions_estimate":"","sessions":[{"n":1,"focus":"","main_content":""}]},
 "plan_update":{"is_update":false,"summary":"","changes":[{"n":1,"type":"שינוי|הוספה|הסרה","from":"","to":"","reason":""}]},
 "next_session":{"n":1,"duration_min":90,"steps":[{"step":"","duration_min":0}]}}

program = מבנה ההנחיה לכל המסע: total_sessions_estimate (טווח מציאותי, למשל "6-8"), sessions = רשימת המפגשים. עד 8 מפגשים. חובה למלא תמיד.
next_session = פירוט שעתי של הפגישה הבאה בלבד.
תקרות זמן: פגישה ראשונה → 90 דק׳; פגישה שנייה ואילך → 60–75 דק׳. 3-5 שלבים, סכום ≤ duration_min.
אם session_number=1: מטרתו הערכה ובניית הקשר. plan_update.is_update=false.
אם session_number≥2: program חייב לשקף את התוכנית הקיימת כפי שהיא. שינויים רק ב-plan_update.changes. plan_update.is_update=true.`;

const SCRIPT_PROMPT = `אתה מנוע יצירת סקריפט סוגסטיה (מודל אריקסון / Milton) עבור מנחה NLP ברמת Master Practitioner.
כתוב בעברית מקצועית. כל מונח לועזי — בעברית עם הלועזי בסוגריים בהופעה ראשונה.
השתמש במנבאים לשוניים (predicates) תואמים למערכת הייצוג הדומיננטית שתינתן לך.
מבנה: קצב (Pacing) → השריה (Induction) → העמקה (Deepening) → סוגסטיה מרכזית. שמור יחס 70/30.
החזר JSON תקין בלבד, ללא טקסט עוטף וללא markdown:
{"suggestion_script":{"pacing":"","induction":"","deepening":"","core_suggestion":"","rationale":[{"choice":"","why":""}]}}
כל קטע בפרוזה קצרה וממוקדת. rationale: עד 3 בחירות עם נימוק.`;

const SAMPLE = {
  name: "דנה", background: "בת 34, מנהלת צוות בהייטק, פנתה בעקבות לחץ מתמשך",
  challenge: "תקיעות בקבלת החלטות, ביקורת עצמית גבוהה",
  goal: "אני רוצה להפסיק להרגיש לחוצה",
  transcript: "אני פשוט לא מצליחה לראות את התמונה הגדולה. כל פעם שאני צריכה להחליט אני נתקעת. תמיד ככה אצלי — אני חייבת לעשות הכל מושלם אחרת זה לא שווה. אני מרגישה שכולם מסתכלים עליי ומחכים שאני אפשל. הבוס שלי גורם לי להרגיש קטנה.",
  notes: "נשימה רדודה, כתפיים מכווצות, מדברת מהר. הסיטה מבט כשדיברה על הבוס.",
  rapport: 7,
};

/* ---- כלי עזר ---- */
function safeParseJSON(text) {
  if (!text) return null;
  let t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const first = t.indexOf("{");
  if (first === -1) return null;
  const last = t.lastIndexOf("}");
  if (last !== -1) { try { return JSON.parse(t.slice(first, last + 1)); } catch { /* continue */ } }
  let s = t.slice(first);
  const cut = Math.max(s.lastIndexOf('"}'), s.lastIndexOf("]"), s.lastIndexOf("}"));
  if (cut > 0) s = s.slice(0, cut + 1);
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

async function callClaude(instructions, userContent, { retries = 1 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: instructions + "\n\n" + userContent }],
        }),
      });
      const bodyText = await res.text();
      let data = null;
      try { data = JSON.parse(bodyText); } catch { /* not JSON */ }
      if (!res.ok) throw new Error(`API ${res.status}: ${data?.error?.message || bodyText.slice(0, 180)}`);
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

/* ---- מנוע חוקים דטרמיניסטי ---- */
function applyRules(a, rapport, opts = {}) {
  const { strictWFO = false, includeEcology = false } = opts;
  const warnings = [];
  let recs = Array.isArray(a.technique_recommendations) ? [...a.technique_recommendations] : [];
  let gated = false;

  if (Array.isArray(a.red_flags) && a.red_flags.length) {
    warnings.push({ level: "red", text: "זוהו סימנים שעשויים לחרוג מתחום ה-NLP. שקול הפניה למטפל/רופא מורשה. הכלי אינו מספק אבחנה." });
  }
  if (rapport < RAPPORT_THRESHOLD) {
    gated = true;
    warnings.push({ level: "amber", text: `רמת ראפור (Rapport) ${rapport}/10 מתחת לסף. כלל #1: מומלץ לבסס ראפור לפני טכניקת שינוי.` });
  }
  if (a.goal_well_formed === false) {
    warnings.push({ level: "info", text: "המטרה עדיין אינה מוגדרת כהלכה (Well-Formed Outcome / WFO)" + (a.goal_note ? ` — ${a.goal_note}` : "") + '. ניתן לעבוד כך ולחדד לאורך המפגשים.' });
    if (strictWFO && !recs.some((r) => (r.name || "").includes("שאלון מקדם מטרה"))) {
      recs.unshift({ name: "שאלון מקדם מטרה", table: "בסיסית", difficulty: "נמוכה", rationale: "עיצוב המטרה כתנאי מקדים.", expected_outcome: "מטרה WFO לעבודה.", _injected: true });
      recs = recs.slice(0, 3);
    }
  }
  if (a.internal_conflict_detected) {
    warnings.push({ level: "info", text: 'זוהה קונפליקט פנימי. כלל #8: מומלץ בירור חלקים ("שיחה עם חלק" / "איחוי חלקים") לפני טכניקה חיצונית.' });
  }

  let nsOut = null;
  if (a.next_session && Array.isArray(a.next_session.steps) && a.next_session.steps.length) {
    const ns = { ...a.next_session };
    let steps = [...ns.steps];
    const hasEcology = steps.some((s) => /אקולוג/i.test(s.step || ""));
    const hasFuture = steps.some((s) => /future|עתיד|קיבוע/i.test(s.step || ""));
    if (includeEcology && !hasEcology) steps.push({ step: "בדיקת אקולוגיה (Ecology Check)", duration_min: 5, _injected: true });
    if (!includeEcology) steps = steps.filter((s) => !/אקולוג/i.test(s.step || ""));
    if (!hasFuture) steps.push({ step: "קיבוע עתידי (Future Pacing) — ביסוס וייצוב השינוי", duration_min: 5, _injected: true });
    ns.steps = steps;
    nsOut = ns;
  }
  return { ...a, technique_recommendations: recs, next_session: nsOut, _warnings: warnings, _gated: gated };
}

/* ---- כרטיס מונחה ---- */
function mergeLists(a, b, max = 5) {
  const seen = new Set();
  return [...(a || []), ...(b || [])].filter((x) => { const k = String(x || "").trim(); if (!k || seen.has(k)) return false; seen.add(k); return true; }).slice(0, max);
}

function buildClientCard(analysis, profile, sessionNumber, rapport, prevCard) {
  const prev = prevCard || {};
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
      sessions: [...(prev.history?.sessions || []), { n: sessionNumber, date: new Date().toLocaleDateString("he-IL"), rapport, techniques: (analysis.technique_recommendations || []).map((t) => t.name).slice(0, 2) }],
      open_threads: prev.history?.open_threads || [],
    },
    program: analysis.program || prev.program || null,
  };
}

function parseClientCard(text) {
  if (!text?.trim()) return null;
  try { return JSON.parse(text.trim().replace(/```json|```/g, "").trim()); } catch { return null; }
}

async function extractCardFromFile(file) {
  try {
    const text = await file.text();
    const m = text.match(/<script[^>]+id="nlp-client-card"[^>]*>([\s\S]*?)<\/script>/i);
    if (m) { try { return JSON.parse(m[1].trim()); } catch { /* continue */ } }
    return parseClientCard(text);
  } catch { return null; }
}

function findQuestionnaire(techniqueName) {
  if (!techniqueName) return null;
  const name = techniqueName.trim();
  if (QUESTIONNAIRES[name]) return QUESTIONNAIRES[name];
  const key = Object.keys(QUESTIONNAIRES).find((k) => name.includes(k) || k.includes(name));
  return key ? QUESTIONNAIRES[key] : null;
}

/* ---- ייצוא ---- */
function esc(t) { return String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function reportToMarkdown(a, profile) {
  const L = [`# דוח ניתוח NLP — ${profile.name || "ללא שם"}`];
  if (a._warnings?.length) { L.push("\n## התראות"); a._warnings.forEach((w) => L.push(`- ${w.text}`)); }
  L.push(`\n## VAK\nדומיננטי: ${a.vak?.dominant} · ${a.vak?.language_recommendation}`);
  L.push(`\n## מצב רגשי\n${a.state}`);
  L.push("\n## Meta Model");
  (a.meta_model || []).forEach((m) => L.push(`- "${m.quote}" — ${m.category}/${m.pattern} → ${m.challenge}`));
  L.push(`\n## ערכים\nליבה: ${(a.values_beliefs?.core_values||[]).join(", ")}\nמגבילות: ${(a.values_beliefs?.limiting_beliefs||[]).join(", ")}`);
  L.push("\n## המלצות");
  (a.technique_recommendations || []).forEach((t, i) => L.push(`${i + 1}. ${t.name} — ${t.rationale}`));
  if (a.program) { L.push(`\n## תכנית — ${a.program.total_sessions_estimate} מפגשים`); (a.program.sessions||[]).forEach((s) => L.push(`- מפגש ${s.n}: ${s.focus}`)); }
  if (a.next_session) { L.push(`\n## פגישה הבאה (${a.next_session.duration_min} דק׳)`); (a.next_session.steps||[]).forEach((s) => L.push(`- ${s.step} (${s.duration_min} דק׳)`)); }
  return L.join("\n");
}

function buildReportHTML(a, profile, forWord, card) {
  const sec = (title, body) => `<h2>${esc(title)}</h2>${body}`;
  const list = (arr, fn) => `<ul>${(arr || []).map(fn).join("")}</ul>`;
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>דוח NLP — ${esc(profile.name||"")}</title>
  <style>@page{margin:18mm}body{font-family:'Frank Ruhl Libre',serif;color:#1C2B27;direction:rtl;padding:24px;max-width:800px;margin:0 auto;line-height:1.7}h1{font-size:24px;border-bottom:3px solid #0F6E56;padding-bottom:8px}h2{font-size:17px;color:#0F6E56;margin-top:22px}ul,ol{padding-inline-start:22px}li{margin-bottom:5px}.q{font-style:italic;color:#444}.src{font-size:11px;color:#888}.warn{background:#FBF1DA;border:1px solid #EAD8AC;border-radius:8px;padding:10px;margin:6px 0;font-size:13px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px 9px;text-align:right;font-size:13px}.muted{color:#888}</style></head><body>
  <h1>דוח ניתוח NLP — ${esc(profile.name||"ללא שם")}</h1>
  <p class="muted">אתגרים: ${esc(profile.challenge)} · מטרה: ${esc(profile.goal)}</p>
  ${(a._warnings||[]).length?sec("התראות",(a._warnings||[]).map((x)=>`<div class="warn">${esc(x.text)}</div>`).join("")):""}
  ${sec("VAK",`<p>דומיננטי: <b>${esc(a.vak?.dominant)}</b> · ${esc(a.vak?.language_recommendation)}</p>`+list(a.vak?.evidence,(e)=>`<li class="q">"${esc(e.quote)}" <span class="src">${esc(e.source)}</span></li>`))}
  ${sec("מצב רגשי",`<p>${esc(a.state)}</p>`+list(a.pacing_recommendations,(p)=>`<li>${esc(p)}</li>`))}
  ${sec("Meta Model",list(a.meta_model,(m)=>`<li>"${esc(m.quote)}" — ${esc(m.category)}/${esc(m.pattern)} → <b>${esc(m.challenge)}</b></li>`))}
  ${sec("ערכים",`<p><b>ליבה:</b> ${esc((a.values_beliefs?.core_values||[]).join(", "))}</p><p><b>מגבילות:</b> ${esc((a.values_beliefs?.limiting_beliefs||[]).join(", "))}</p>`)}
  ${sec("המלצות טכניקה",`<ol>${(a.technique_recommendations||[]).map((t)=>`<li><b>${esc(t.name)}</b> [${esc(t.table)}] — ${esc(t.rationale)}</li>`).join("")}</ol>`)}
  ${a.program?sec(`תכנית — ${esc(a.program.total_sessions_estimate)} מפגשים`,`<table><tr><th>מפגש</th><th>מוקד</th><th>תוכן</th></tr>${(a.program.sessions||[]).map((s)=>`<tr><td>${esc(s.n)}</td><td>${esc(s.focus)}</td><td>${esc(s.main_content)}</td></tr>`).join("")}</table>`):""}
  ${a.next_session?sec(`פגישה הבאה — מפגש ${esc(a.next_session.n)} (${esc(a.next_session.duration_min)} דק׳)`,`<ol>${(a.next_session.steps||[]).map((s)=>`<li>${esc(s.step)} (${esc(s.duration_min)} דק׳)</li>`).join("")}</ol>`):""}
  ${a.suggestion_script?sec("סקריפט סוגסטיה",`<p><b>קצב:</b> ${esc(a.suggestion_script.pacing)}</p><p><b>השריה:</b> ${esc(a.suggestion_script.induction)}</p><p><b>העמקה:</b> ${esc(a.suggestion_script.deepening)}</p><p><b>סוגסטיה מרכזית:</b> ${esc(a.suggestion_script.core_suggestion)}</p>`):""}
  <p class="muted" style="margin-top:28px;border-top:1px solid #ddd;padding-top:8px;">הופק ע"י NLP Master Assistant · כלי תומך-החלטה · אינו מספק אבחנה רפואית.</p>
  ${card?`<script type="application/json" id="nlp-client-card">${JSON.stringify(card)}<\/script>`:""}
  </body></html>`;
}

function downloadFile(filename, content, mime) {
  const blob = new Blob(["﻿" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function exportReport(a, profile, format, card) {
  const n = (profile.name || "report").replace(/[^֐-׿\w]+/g, "_");
  if (format === "word") downloadFile(`דוח_NLP_${n}.doc`, buildReportHTML(a, profile, true, card), "application/msword");
  else downloadFile(`דוח_NLP_${n}.html`, buildReportHTML(a, profile, false, card), "text/html");
}

/* ===================== UI COMPONENTS ===================== */

function Field({ label, value, onChange }) {
  return <div className="field"><label className="lbl">{label}</label><input className="inp" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Warning({ level, text }) {
  const icon = level === "red" ? <ShieldAlert size={16} /> : level === "amber" ? <AlertTriangle size={16} /> : <Info size={16} />;
  return <div className={"banner " + level}>{icon}<span>{text}</span></div>;
}

function Section({ title, right, children }) {
  return <div className="sec"><div className="sec-h"><h3>{title}</h3>{right}</div><div className="sec-b">{children}</div></div>;
}

function BeliefRow({ label, items, tone }) {
  if (!items?.length) return null;
  return <div className="belief"><span className="belief-lbl">{label}</span><div className="chips">{items.map((it, i) => <span key={i} className={"chip " + tone}>{it}</span>)}</div></div>;
}

function QuestionnaireCard({ q }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fullText = () => {
    const L = [q.title, "", ...(q.intro||[]).map((x) => "• " + x), "", q.legend||"", ""];
    (q.sections||[]).forEach((s) => { L.push("— " + s.h); (s.items||[]).forEach((it) => L.push("  " + it)); L.push(""); });
    return L.join("\n");
  };
  return (
    <div className="qn">
      <button className="qn-toggle" onClick={() => setOpen((o) => !o)}>
        <BookOpen size={14} /><span>שאלון מובנה: {q.title}</span>
        <span className={"qn-chev" + (open ? " open" : "")}>▾</span>
      </button>
      {open && (
        <div className="qn-body">
          <p className="qn-note">מוצג נאמן למקור — פרוטוקול קבוע, לא נוצר ע"י המודל.</p>
          {(q.intro||[]).map((x, i) => <p key={i} className="qn-intro">• {x}</p>)}
          {q.legend && <p className="qn-legend">{q.legend}</p>}
          {(q.sections||[]).map((s, i) => (
            <div key={i} className="qn-sec"><h5>{s.h}</h5><ul>{(s.items||[]).map((it, j) => <li key={j}>{it}</li>)}</ul></div>
          ))}
          <button className="btn ghost sm qn-copy" onClick={() => navigator.clipboard.writeText(fullText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })}>
            {copied ? <><Check size={13} /> הועתק</> : <><Copy size={13} /> העתק שאלון</>}
          </button>
        </div>
      )}
    </div>
  );
}

function ClientCardPanel({ card, cardInput, onInput, onLoad, onClear, showInput, onToggle, onFileLoad }) {
  const [showPaste, setShowPaste] = useState(false);
  const [fileErr, setFileErr] = useState("");
  const handleFile = async (e) => {
    setFileErr(""); const file = e.target.files?.[0]; if (!file) return;
    const result = await extractCardFromFile(file);
    if (result) onFileLoad(result); else { setFileErr("לא נמצא כרטיס. נסה להדביק ידנית."); setShowPaste(true); }
    e.target.value = "";
  };
  return (
    <div className="ccard-wrap">
      <button className="ccard-toggle" onClick={onToggle}>
        <Users size={14} />
        <span>{card ? `כרטיס מונחה: ${card.client?.name||""} · פגישה ${card.last_session}` : "העלה דוח מפגישה קודמת (טעינת כרטיס מונחה)"}</span>
        <span className={"qn-chev" + (showInput ? " open" : "")}>▾</span>
      </button>
      {showInput && (
        <div className="ccard-body">
          {card ? (
            <>
              <div className="ccard-sum">
                <div className="ccard-row"><span className="ccard-lbl">VAK דומיננטי</span><span className="ccard-val">{card.identity?.vak_dominant||"—"}</span></div>
                {(card.identity?.core_values||[]).length>0 && <div className="ccard-row"><span className="ccard-lbl">ערכי ליבה</span><span className="ccard-val">{card.identity.core_values.join(" · ")}</span></div>}
                {(card.history?.sessions||[]).length>0 && <div className="ccard-row"><span className="ccard-lbl">היסטוריה</span><span className="ccard-val">{card.history.sessions.map((s)=>`פג׳ ${s.n}: ${(s.techniques||[]).join(", ")||"—"}`).join(" | ")}</span></div>}
              </div>
              <button className="btn ghost sm" style={{marginTop:10}} onClick={onClear}>הסר כרטיס</button>
            </>
          ) : (
            <>
              <p className="qn-note" style={{marginBottom:10}}>העלה קובץ דוח (HTML) מהפגישה הקודמת — הכרטיס ייטען אוטומטית.</p>
              <label className="upload-label"><input type="file" accept=".html,.doc,.htm,.json" onChange={handleFile} style={{display:"none"}} /><span className="btn primary sm"><FileText size={14} /> בחר קובץ</span></label>
              {fileErr && <p className="banner amber" style={{marginTop:8,fontSize:12}}><AlertTriangle size={13} /> {fileErr}</p>}
              <button className="upload-alt" onClick={() => setShowPaste((o) => !o)}>או הדבק JSON ידנית</button>
              {showPaste && (<><textarea className="ta" rows={3} value={cardInput} onChange={(e) => onInput(e.target.value)} placeholder='{"client":{"name":"..."}, ...}' style={{marginTop:6,marginBottom:6}} /><button className="btn primary sm" onClick={onLoad} disabled={!cardInput.trim()}>טען</button></>)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const VAK_META = {
  V: { label: "חזותי (V)", icon: <Eye size={14} /> },
  A: { label: "שמיעתי (A)", icon: <Ear size={14} /> },
  K: { label: "תחושתי (K)", icon: <Hand size={14} /> },
  Ad: { label: "דיאלוג פנימי (Ad)", icon: <MessageSquare size={14} /> },
};

/* ===================== MAIN APP ===================== */
export default function NLPMasterAssistant() {
  const [tab, setTab] = useState("input");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [profile, setProfile] = useState({ name: "", background: "", challenge: "", goal: "" });
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [rapport, setRapport] = useState(7);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [previousPlan, setPreviousPlan] = useState("");
  const [clientCard, setClientCard] = useState(null);
  const [clientCardInput, setClientCardInput] = useState("");
  const [showCardInput, setShowCardInput] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState("");
  const [corrections, setCorrections] = useState({});
  const [dirtyCorrections, setDirtyCorrections] = useState(false);
  const [reRunning, setReRunning] = useState(false);
  const [strictWFO] = useState(false);
  const [includeEcology, setIncludeEcology] = useState(false);
  const [changeDecisions, setChangeDecisions] = useState({});
  const [scriptInstruction, setScriptInstruction] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("nlp_api_key");
    if (saved) setApiKey(saved);
  }, []);

  const saveKey = (k) => { setApiKey(k); if (k) sessionStorage.setItem("nlp_api_key", k); else sessionStorage.removeItem("nlp_api_key"); };

  const callClaudeWithKey = (sys, ctx) => {
    if (!apiKey.trim()) throw new Error("NO_KEY");
    return callClaude(sys, ctx);
  };

  const clearAll = () => {
    setProfile({ name: "", background: "", challenge: "", goal: "" });
    setTranscript(""); setNotes(""); setRapport(7); setSessionNumber(1); setPreviousPlan("");
    setClientCard(null); setClientCardInput(""); setShowCardInput(false); setCardCopied(false);
    setAnalysis(null); setError(""); setStage("");
    setCorrections({}); setDirtyCorrections(false); setChangeDecisions({});
    setScriptInstruction(""); setScriptError(""); setTab("input");
  };

  const analyze = async (speakerCorrections = null) => {
    setError("");
    if (!apiKey.trim()) { setError("יש להזין מפתח API."); return; }
    if (!transcript.trim() && !notes.trim()) { setError("יש להזין תמליל/ציטוטים או הערות תצפית לפני ניתוח."); return; }
    const isReRun = !!speakerCorrections;
    isReRun ? setReRunning(true) : setLoading(true);

    let correctionNote = "";
    if (isReRun && Object.keys(speakerCorrections).length) {
      correctionNote = "\n\n== תיקוני ייחוס דובר (מאת המנחה — מחייבים) ==\n" +
        Object.entries(speakerCorrections).map(([q, r]) => `• האמירה "${q}" נאמרה ע"י: ${r}.`).join("\n");
    }

    const userContent =
      `== פרופיל ==\nשם: ${profile.name}\nרקע: ${profile.background}\nאתגרים: ${profile.challenge}\nמטרת פגישה: ${profile.goal}\nמספר הפגישה: ${sessionNumber}\nרמת ראפור: ${rapport}\n\n` +
      `== תמליל / ציטוטים ==\n${transcript||"(אין)"}\n\n== הערות תצפית ==\n${notes||"(אין)"}` +
      (sessionNumber >= 2 && previousPlan.trim() ? `\n\n== התוכנית מהמפגש הקודם ==\n${previousPlan.trim()}` : "") +
      (clientCard ? `\n\n== כרטיס מונחה ==\nVAK: ${clientCard.identity?.vak_dominant||"—"}\nערכי ליבה: ${(clientCard.identity?.core_values||[]).join(", ")||"—"}\nאמונות מגבילות: ${(clientCard.identity?.limiting_beliefs||[]).join(", ")||"—"}\nטכניקות שהשתמשנו: ${(clientCard.history?.sessions||[]).map((s)=>`פגישה ${s.n}: ${(s.techniques||[]).join(", ")||"—"}`).join(" | ")||"—"}\nאל תחזור על טכניקות שכבר השתמשנו בהן.` : "") +
      correctionNote;

    try {
      setStage(isReRun ? "מריץ מחדש עם התיקונים…" : "מנתח את המקרה…");
      const a = await callClaudeWithKey(SYSTEM_PROMPT, userContent);

      setStage("בונה תכנית מפגשים…");
      const existingProgram = clientCard?.program || null;
      const existingPlanText = existingProgram
        ? "הערכת מפגשים: " + (existingProgram.total_sessions_estimate||"—") + "\n" + (existingProgram.sessions||[]).map((s)=>`מפגש ${s.n}: ${s.focus} — ${s.main_content}`).join("\n")
        : previousPlan.trim();
      const hasExistingPlan = sessionNumber >= 2 && !!existingPlanText;

      let plan = {};
      try {
        const planCtx =
          `מספר הפגישה: ${sessionNumber}\nמטרה: ${profile.goal||""}\nאתגרים: ${profile.challenge||""}\nמצב רגשי: ${a?.state||""}\nהמלצות: ${(a?.technique_recommendations||[]).map((t)=>t.name).join(", ")}` +
          (hasExistingPlan ? `\n\n== התוכנית הקיימת (בסיס סמכותי) ==\n${existingPlanText}\n\n== התקדמות ==\n${transcript||notes||"(אין)"}` : "");
        plan = await callClaudeWithKey(PLAN_PROMPT, planCtx);
      } catch { /* plan failure non-fatal */ }

      const baseProgram = hasExistingPlan ? (existingProgram || plan.program) : plan.program;
      const merged = {
        ...a,
        program: baseProgram || null,
        plan_update: hasExistingPlan ? (plan.plan_update || { is_update: true, summary: "", changes: [] }) : null,
        next_session: plan.next_session || null,
      };

      setAnalysis((prev) => applyRules({ ...merged, suggestion_script: isReRun ? prev?.suggestion_script||null : null }, rapport, { strictWFO, includeEcology }));
      setClientCard(buildClientCard(merged, profile, sessionNumber, rapport, clientCard));
      if (!isReRun) { setCorrections({}); setChangeDecisions({}); }
      setDirtyCorrections(false);
      setTab("report");
    } catch (e) {
      const m = e.message || "";
      if (m === "NO_KEY") setError("יש להזין מפתח API תחילה.");
      else if (m === "TRUNCATED") setError("פלט נקטע — קצר את התמליל ונסה שוב.");
      else if (m === "PARSE") setError("פלט לא תקין — נסה שוב.");
      else setError("שגיאה: " + m);
    }
    setStage(""); isReRun ? setReRunning(false) : setLoading(false);
  };

  const generateScript = async () => {
    if (!analysis) return;
    setScriptError(""); setScriptLoading(true);
    try {
      const ctx =
        `מערכת ייצוג דומיננטית: ${analysis.vak?.dominant||"K"}\nהמלצת שפה: ${analysis.vak?.language_recommendation||""}\nמצב רגשי: ${analysis.state||""}\nמטרה: ${profile.goal||""}\nטכניקה מובילה: ${analysis.technique_recommendations?.[0]?.name||""}` +
        (scriptInstruction.trim() ? `\n\n== הנחיית המנחה (מחייבת) ==\n${scriptInstruction.trim()}` : "");
      const s = await callClaudeWithKey(SCRIPT_PROMPT, ctx);
      setAnalysis((prev) => ({ ...prev, suggestion_script: s.suggestion_script||null }));
    } catch (e) { setScriptError("יצירת הסקריפט נכשלה — " + (e.message||"נסה שוב.")); }
    setScriptLoading(false);
  };

  const decideChange = (idx, decision) => {
    setChangeDecisions((prev) => ({ ...prev, [idx]: decision }));
    if (decision !== "accepted") return;
    setAnalysis((prev) => {
      const ch = prev?.plan_update?.changes?.[idx];
      if (!ch || !prev.program) return prev;
      let sessions = [...(prev.program.sessions||[])];
      if (ch.type === "הסרה") sessions = sessions.filter((s) => s.n !== ch.n);
      else if (ch.type === "הוספה") { if (!sessions.some((s) => s.n === ch.n)) sessions.push({ n: ch.n, focus: ch.to, main_content: ch.to }); }
      else sessions = sessions.map((s) => s.n === ch.n ? { ...s, main_content: ch.to } : s);
      sessions.sort((x, y) => (x.n||0) - (y.n||0));
      return { ...prev, program: { ...prev.program, sessions } };
    });
  };

  const copy = (key, txt) => { navigator.clipboard.writeText(txt).then(() => { setCopied(key); setTimeout(() => setCopied(""), 1800); }); };
  const liveCard = clientCard ? { ...clientCard, program: analysis?.program||clientCard.program } : null;

  return (
    <div dir="rtl" className="nlp-root">
      <style>{CSS}</style>
      <header className="hdr">
        <div className="hdr-mark"><Brain size={20} /></div>
        <div className="hdr-text">
          <h1>NLP Master Assistant</h1>
          <p>כלי תמיכת-החלטה למנחה · מופעל ע״י Claude</p>
        </div>
      </header>

      {/* API Key */}
      <div style={{maxWidth:780,margin:"0 auto 14px"}}>
        <div className="ccard-wrap">
          <button className="ccard-toggle" onClick={() => setShowKey((o) => !o)}>
            <Lock size={14} />
            <span>{apiKey ? "מפתח API מוגדר ✓" : "הזן מפתח API (נדרש לניתוח)"}</span>
            <span className={"qn-chev" + (showKey ? " open" : "")}>▾</span>
          </button>
          {showKey && (
            <div className="ccard-body">
              <p className="qn-note" style={{marginBottom:8}}>המפתח נשמר ב-sessionStorage בלבד — נמחק בסגירת הדפדפן. לא נשלח לשום מקום מלבד Anthropic.</p>
              <input className="inp" type="password" value={apiKey} onChange={(e) => saveKey(e.target.value)} placeholder="sk-ant-api03-..." style={{marginBottom:8}} />
              {apiKey && <button className="btn ghost sm" onClick={() => saveKey("")}>נקה</button>}
            </div>
          )}
        </div>
      </div>

      <nav className="tabs">
        <button className={tab==="input"?"tab on":"tab"} onClick={() => setTab("input")}><FileText size={15} /> קלט</button>
        <button className={tab==="report"?"tab on":"tab"} disabled={!analysis} onClick={() => analysis && setTab("report")}><Brain size={15} /> דוח ניתוח</button>
        <button className={tab==="script"?"tab on":"tab"} disabled={!analysis} onClick={() => analysis && setTab("script")}><Sparkles size={15} /> סקריפט סוגסטיה</button>
      </nav>

      <main className="main">
        {tab === "input" && (
          <section className="card">
            <div className="grid2">
              <Field label="שם המונחה" value={profile.name} onChange={(v) => setProfile({...profile,name:v})} />
              <Field label="רקע" value={profile.background} onChange={(v) => setProfile({...profile,background:v})} />
              <Field label="אתגרים" value={profile.challenge} onChange={(v) => setProfile({...profile,challenge:v})} />
              <Field label="מטרת פגישה" value={profile.goal} onChange={(v) => setProfile({...profile,goal:v})} />
            </div>

            <label className="lbl">תמליל / ציטוטים</label>
            <textarea className="ta" rows={5} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="הדבק כאן תמליל שיחה, ציטוטים או תיאור מונחה…" />

            <label className="lbl">הערות תצפית (פיזיולוגיה, קליברציה)</label>
            <textarea className="ta" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="שפת גוף, נשימה, מתח שרירי, קשר עין…" />

            <div className="sessno">
              <span className="sessno-lbl">מספר הפגישה</span>
              <div className="sessno-btns">
                {[1,2,3,4,5].map((n) => <button key={n} className={"sessno-btn"+(sessionNumber===n?" on":"")} onClick={() => setSessionNumber(n)}>{n===5?"5+":n}</button>)}
              </div>
              <span className="sessno-hint">{sessionNumber===1?"פגישה ראשונה · 90 דק׳ · תכנון המסע":"פגישה ממשיכה · 60–75 דק׳ · הערכת התקדמות"}</span>
            </div>

            <ClientCardPanel card={clientCard} cardInput={clientCardInput} onInput={setClientCardInput}
              onLoad={() => { const c = parseClientCard(clientCardInput); if (c) { setClientCard(c); setClientCardInput(""); }}}
              onClear={() => { setClientCard(null); setClientCardInput(""); }}
              showInput={showCardInput} onToggle={() => setShowCardInput((o) => !o)}
              onFileLoad={(card) => { setClientCard(card); setShowCardInput(true); }} />

            {sessionNumber >= 2 && (
              <div className="prevplan">
                <label className="lbl">התוכנית מהמפגש הקודם (הדבק מהדוח הקודם)</label>
                <textarea className="ta" rows={3} value={previousPlan} onChange={(e) => setPreviousPlan(e.target.value)} placeholder="הדבק כאן את תכנית ההנחיה מהדוח של המפגש הקודם…" />
              </div>
            )}

            <div className="rapport">
              <div className="rapport-head">
                <span>רמת ראפור (Rapport)</span>
                <span className={"rapport-val"+(rapport<RAPPORT_THRESHOLD?" low":"")}>{rapport}/10</span>
              </div>
              <input type="range" min={1} max={10} value={rapport} onChange={(e) => setRapport(Number(e.target.value))} className="slider" />
              {rapport < RAPPORT_THRESHOLD && <p className="rapport-note"><Info size={12} /> מתחת לסף — מנוע החוקים ימליץ לבסס ראפור לפני טכניקת שינוי</p>}
            </div>

            {error && <div className="banner red"><AlertTriangle size={16} /> {error}</div>}

            <div className="prefs">
              <label className="pref"><input type="checkbox" checked={includeEcology} onChange={(e) => setIncludeEcology(e.target.checked)} /><span>כלול בדיקת אקולוגיה (Ecology Check) בתכנית</span></label>
            </div>

            <div className="actions">
              <button className="btn primary" onClick={() => analyze()} disabled={loading}>
                {loading ? <><Loader2 size={16} className="spin" /> {stage||"מנתח…"}</> : <><Brain size={16} /> נתח</>}
              </button>
              <button className="btn ghost" onClick={() => { setProfile({name:SAMPLE.name,background:SAMPLE.background,challenge:SAMPLE.challenge,goal:SAMPLE.goal}); setTranscript(SAMPLE.transcript); setNotes(SAMPLE.notes); setRapport(SAMPLE.rapport); }} disabled={loading}>טען דוגמה</button>
              <button className="btn ghost" onClick={clearAll} disabled={loading}>נקה</button>
            </div>
          </section>
        )}

        {tab === "report" && analysis && (
          <section className="card report">
            {(analysis._warnings||[]).map((w, i) => <Warning key={i} {...w} />)}

            {Array.isArray(analysis.speaker_uncertainty) && analysis.speaker_uncertainty.length > 0 && (
              <div className="banner amber" style={{alignItems:"flex-start"}}>
                <MessageSquare size={16} style={{marginTop:2,flexShrink:0}} />
                <span style={{flex:1}}>
                  <b>אי-ודאות לגבי דובר:</b>
                  <span className="su-list">
                    {analysis.speaker_uncertainty.map((u, i) => {
                      const current = corrections[u.quote]||u.assumed||"מונחה";
                      return (
                        <span key={i} className="su-item-row">
                          <span className="su-quote">"{u.quote}"{u.note?` — ${u.note}`:""}</span>
                          <span className="su-btns">
                            {["מונחה","מנחה","צד-שלישי"].map((role) => (
                              <button key={role} className={"su-btn"+(current===role?" on":"")} onClick={() => { setCorrections((p)=>({...p,[u.quote]:role})); setDirtyCorrections(true); }}>{role}</button>
                            ))}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                  {dirtyCorrections && <button className="btn primary su-rerun" onClick={() => analyze(corrections)} disabled={reRunning}>{reRunning?<><Loader2 size={14} className="spin"/>מריץ מחדש…</>:<><Brain size={14}/>הרץ מחדש עם התיקונים</>}</button>}
                </span>
              </div>
            )}

            <Section title="מערכת ייצוג (VAK)" right={<span className="pill teal">דומיננטי: {VAK_META[analysis.vak?.dominant]?.label||analysis.vak?.dominant}</span>}>
              <div className="vak">
                {["V","A","K","Ad"].map((k) => {
                  const max = Math.max(1,...Object.values(analysis.vak?.scores||{}).map((n)=>Number(n)||0));
                  return <div key={k} className="vak-row"><span className="vak-lbl">{VAK_META[k].icon} {VAK_META[k].label}</span><div className="bar"><div className="bar-fill" style={{width:`${((Number(analysis.vak?.scores?.[k])||0)/max)*100}%`}}/></div><span className="vak-num">{Number(analysis.vak?.scores?.[k])||0}</span></div>;
                })}
              </div>
              {analysis.vak?.language_recommendation && <p className="note"><b>המלצת שפה:</b> {analysis.vak.language_recommendation}</p>}
              {(analysis.vak?.evidence||[]).map((e,i)=><p key={i} className="ev">"{e.quote}" <span className="src">{e.source}</span></p>)}
            </Section>

            <Section title="מצב רגשי וקצב (Pacing)">
              <p>{analysis.state}</p>
              {(analysis.pacing_recommendations||[]).length>0 && <ul className="ul">{(analysis.pacing_recommendations||[]).map((p,i)=><li key={i}>{p}</li>)}</ul>}
            </Section>

            <Section title="מודל מטא (Meta Model) — הפרות שפה">
              {(analysis.meta_model||[]).length===0 && <p className="muted">לא זוהו הפרות מובהקות.</p>}
              {(analysis.meta_model||[]).map((m,i)=>(
                <div key={i} className="mm">
                  <p className="mm-q">"{m.quote}" <span className="src">{m.source}</span></p>
                  <div className="mm-tags"><span className="pill">{m.category}</span>{m.pattern&&<span className="pill light">{m.pattern}</span>}</div>
                  <p className="mm-ch"><b>תיגור:</b> {m.challenge}</p>
                </div>
              ))}
            </Section>

            <Section title="ערכים ואמונות">
              <BeliefRow label="ערכי ליבה" items={analysis.values_beliefs?.core_values} tone="teal" />
              <BeliefRow label="אמונות מגבילות" items={analysis.values_beliefs?.limiting_beliefs} tone="amber" />
              <BeliefRow label="אמונות מחזקות" items={analysis.values_beliefs?.empowering_beliefs} tone="green" />
            </Section>

            <Section title="המלצות טכניקה (מדורגות)" right={analysis._gated?<span className="pill amber">לבסס ראפור תחילה</span>:null}>
              {(analysis.technique_recommendations||[]).map((t,i)=>(
                <div key={i} className="tech">
                  <div className="tech-h"><span className="rank">{i+1}</span><span className="tech-name">{t.name}</span><span className="pill light">{t.table}</span>{t.difficulty&&<span className="pill light">קושי: {t.difficulty}</span>}{t._injected&&<span className="pill teal">מנוע החוקים</span>}</div>
                  <p className="tech-r">{t.rationale}</p>
                  {t.expected_outcome&&<p className="tech-o"><b>תוצאה צפויה:</b> {t.expected_outcome}</p>}
                  {findQuestionnaire(t.name)&&<QuestionnaireCard q={findQuestionnaire(t.name)} />}
                </div>
              ))}
            </Section>

            {analysis.plan_update?.is_update && (
              <Section title="עדכון תוכנית — אימות מול המפגש הקודם" right={(analysis.plan_update.changes||[]).length===0?<span className="pill teal">אין שינוי</span>:<span className="pill amber">{(analysis.plan_update.changes||[]).length} הצעות</span>}>
                {analysis.plan_update.summary&&<p className="note">{analysis.plan_update.summary}</p>}
                {(analysis.plan_update.changes||[]).length===0?<p className="muted">התוכנית נשארת בעינה.</p>:(analysis.plan_update.changes||[]).map((c,i)=>{
                  const d=changeDecisions[i];
                  return <div key={i} className={"change"+(d?" "+d:"")}>
                    <div className="change-h"><span className="pill light">מפגש {c.n}</span><span className="pill amber">{c.type}</span>{d==="accepted"&&<span className="pill teal">✓ התקבל</span>}{d==="rejected"&&<span className="pill">✕ נדחה</span>}</div>
                    {c.from&&<p className="change-line"><b>מ:</b> {c.from}</p>}<p className="change-line"><b>ל:</b> {c.to}</p>{c.reason&&<p className="change-reason">{c.reason}</p>}
                    {!d&&<div className="change-btns"><button className="btn primary sm" onClick={()=>decideChange(i,"accepted")}>קבל</button><button className="btn ghost sm" onClick={()=>decideChange(i,"rejected")}>דחה</button></div>}
                    {d==="rejected"&&<button className="change-undo" onClick={()=>decideChange(i,undefined)}>בטל בחירה</button>}
                  </div>;
                })}
              </Section>
            )}

            {analysis.program && (
              <Section title="תכנית הנחיה (ניתנת לעריכה)" right={<span className="pill light">הערכת מפגשים: {analysis.program.total_sessions_estimate||"—"}</span>}>
                <div className="prog">
                  {(analysis.program.sessions||[]).map((s,i)=>(
                    <div key={i} className="prog-row">
                      <span className="prog-n">{s.n}</span>
                      <div className="prog-fields">
                        <input className="prog-inp focus" value={s.focus||""} onChange={(e)=>setAnalysis((prev)=>{if(!prev?.program?.sessions)return prev;const sessions=prev.program.sessions.map((x,j)=>i===j?{...x,focus:e.target.value}:x);return{...prev,program:{...prev.program,sessions}};} )} placeholder="מוקד המפגש" />
                        <textarea className="prog-inp" rows={2} value={s.main_content||""} onChange={(e)=>setAnalysis((prev)=>{if(!prev?.program?.sessions)return prev;const sessions=prev.program.sessions.map((x,j)=>i===j?{...x,main_content:e.target.value}:x);return{...prev,program:{...prev.program,sessions}};} )} placeholder="תוכן מרכזי מוצע" />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {analysis.next_session && (
              <Section title={`פירוט הפגישה הבאה — מפגש ${analysis.next_session.n}`} right={<span className="pill teal">{analysis.next_session.duration_min} דק׳</span>}>
                <ol className="plan">
                  {(analysis.next_session.steps||[]).map((s,i)=>(
                    <li key={i}><span>{s.step}{s._injected&&<span className="pill teal mini">חובה</span>}</span><span className="dur">{s.duration_min} דק׳</span></li>
                  ))}
                </ol>
              </Section>
            )}

            {liveCard && (
              <Section title="כרטיס מונחה — נשמר בקובץ הדוח">
                <div className="banner info" style={{marginBottom:12}}><Info size={15}/><span>הכרטיס מוטמע בקובץ הדוח. בפגישה הבאה — העלה את הקובץ לטעינת הכרטיס.</span></div>
                <div className="ccard-sum">
                  <div className="ccard-row"><span className="ccard-lbl">פגישה אחרונה</span><span className="ccard-val">{liveCard.last_session} · {liveCard.updated}</span></div>
                  <div className="ccard-row"><span className="ccard-lbl">VAK</span><span className="ccard-val">{liveCard.identity?.vak_dominant||"—"}</span></div>
                  {(liveCard.identity?.core_values||[]).length>0&&<div className="ccard-row"><span className="ccard-lbl">ערכי ליבה</span><span className="ccard-val">{liveCard.identity.core_values.join(" · ")}</span></div>}
                  {(liveCard.history?.sessions||[]).length>0&&<div className="ccard-row"><span className="ccard-lbl">פגישות</span><span className="ccard-val">{liveCard.history.sessions.map((s)=>`פג׳ ${s.n}: ${(s.techniques||[]).join(", ")||"—"}`).join(" | ")}</span></div>}
                </div>
                <button className="btn ghost sm" style={{marginTop:10}} onClick={()=>navigator.clipboard.writeText(JSON.stringify(liveCard,null,2)).then(()=>{setCardCopied(true);setTimeout(()=>setCardCopied(false),1800);})}>
                  {cardCopied?<><Check size={13}/>הועתק</>:<><Copy size={13}/>העתק JSON (גיבוי)</>}
                </button>
              </Section>
            )}

            <div className="export-row">
              <button className="btn ghost" onClick={()=>copy("report",reportToMarkdown(analysis,profile))}>{copied==="report"?<><Check size={15}/>הועתק</>:<><Copy size={15}/>העתק טקסט</>}</button>
              <button className="btn ghost" onClick={()=>exportReport(analysis,profile,"word",liveCard)}><FileText size={15}/> הורד Word</button>
              <button className="btn primary" onClick={()=>exportReport(analysis,profile,"pdf",liveCard)}><FileText size={15}/> הורד ל-PDF</button>
            </div>
          </section>
        )}

        {tab === "script" && analysis && (
          <section className="card">
            <div className="composer">
              <label className="lbl">הנחיה לסקריפט (אופציונלי)</label>
              <textarea className="ta" rows={3} value={scriptInstruction} onChange={(e)=>setScriptInstruction(e.target.value)} placeholder="לדוגמה: סוגסטיה קצרה לרגיעה בפתיחה; דגש על שחרור ביקורת עצמית…" />
              <button className="btn primary wide" onClick={generateScript} disabled={scriptLoading}>
                {scriptLoading?<><Loader2 size={15} className="spin"/>מחולל סקריפט…</>:<><Sparkles size={15}/>{analysis.suggestion_script?"צור סקריפט מחדש":"צור סקריפט סוגסטיה"}</>}
              </button>
              {scriptError&&<div className="banner red" style={{marginTop:12}}><AlertTriangle size={16}/><span>{scriptError}</span></div>}
            </div>
            {!analysis.suggestion_script && (
              <div className="banner info"><Info size={16}/><span>הסקריפט לא נוצר אוטומטית. לחץ ליצירה — מותאם ל-{VAK_META[analysis.vak?.dominant]?.label||analysis.vak?.dominant}.</span></div>
            )}
            {analysis.suggestion_script && (() => {
              const s = analysis.suggestion_script;
              const parts = [["קצב (Pacing)",s.pacing],["השריה (Induction)",s.induction],["העמקה (Deepening)",s.deepening],["סוגסטיה מרכזית",s.core_suggestion]];
              const full = parts.map(([t,b])=>`${t}:\n${b}`).join("\n\n");
              return <>
                <div className="script-meta"><span className="pill teal"><Wand2 size={12}/> VAK: {VAK_META[analysis.vak?.dominant]?.label||analysis.vak?.dominant}</span><span className="pill light">Pacing/Leading 70/30</span></div>
                {parts.map(([t,body],i)=><div key={i} className="script-step"><div className="script-num">{i+1}</div><div className="script-body"><h4>{t}</h4><p>{body}</p></div></div>)}
                {(s.rationale||[]).length>0&&<Section title="נימוק לבחירות לשוניות">{(s.rationale||[]).map((r,i)=><p key={i} className="rat"><b>{r.choice}:</b> {r.why}</p>)}</Section>}
                <button className="btn ghost wide" onClick={()=>copy("script",full)}>{copied==="script"?<><Check size={15}/>הועתק</>:<><Copy size={15}/>העתק סקריפט</>}</button>
              </>;
            })()}
          </section>
        )}
      </main>

      <footer className="ftr">פרטיות: המפתח נשמר בזיכרון הדפדפן בלבד ונמחק בסגירה. הכלי תומך בשיקול דעת המנחה ואינו מספק אבחנה רפואית.</footer>
    </div>
  );
}

const CSS = `
.nlp-root{--paper:#F7F4EE;--card:#FFFEFB;--ink:#1C2B27;--teal:#0F6E56;--teal2:#5DCAA5;--teal-soft:#E4F3EC;--amber:#9A6B12;--amber-soft:#FBF1DA;--red:#9B3A2E;--red-soft:#F7E6E1;--muted:#727A74;--line:#E6E0D4;font-family:'Heebo',-apple-system,sans-serif;color:var(--ink);background:radial-gradient(circle at 12% 0%,#FBF9F3 0%,transparent 55%),var(--paper);min-height:100vh;padding:22px 16px 40px;direction:rtl;line-height:1.6;}
.nlp-root *{box-sizing:border-box;margin:0;}
.hdr{max-width:780px;margin:0 auto 18px;display:flex;align-items:center;gap:13px;}
.hdr-mark{width:42px;height:42px;border-radius:12px;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(15,110,86,.28);}
.hdr-text h1{font-family:'Frank Ruhl Libre',serif;font-weight:900;font-size:24px;letter-spacing:-.3px;}
.hdr-text p{font-size:12px;color:var(--muted);margin-top:1px;}
.tabs{max-width:780px;margin:0 auto 14px;display:flex;gap:6px;background:#EFEADF;padding:5px;border-radius:12px;}
.tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-family:inherit;font-size:13px;font-weight:500;padding:9px;border:none;border-radius:9px;background:transparent;color:var(--muted);cursor:pointer;transition:.18s;}
.tab:hover:not(:disabled){color:var(--ink);}
.tab.on{background:var(--card);color:var(--teal);box-shadow:0 2px 8px rgba(28,43,39,.08);font-weight:700;}
.tab:disabled{opacity:.4;cursor:not-allowed;}
.main{max-width:780px;margin:0 auto;}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 6px 24px rgba(28,43,39,.05);}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}
.field{display:flex;flex-direction:column;}
.lbl{font-size:11px;font-weight:700;color:var(--teal);margin-bottom:5px;letter-spacing:.2px;}
.inp,.ta{font-family:inherit;font-size:14px;color:var(--ink);background:#FCFBF7;border:1px solid var(--line);border-radius:9px;padding:9px 11px;width:100%;outline:none;transition:.15s;resize:vertical;}
.inp:focus,.ta:focus{border-color:var(--teal2);box-shadow:0 0 0 3px var(--teal-soft);}
.ta{margin-bottom:14px;}
.rapport{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:13px 14px;margin-bottom:14px;}
.rapport-head{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:700;margin-bottom:8px;}
.rapport-val{font-family:'Frank Ruhl Libre',serif;font-size:18px;color:var(--teal);}
.rapport-val.low{color:var(--amber);}
.slider{width:100%;accent-color:var(--teal);height:5px;cursor:pointer;}
.rapport-note{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--amber);margin-top:8px;}
.sessno{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:13px 14px;margin-bottom:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.sessno-lbl{font-size:13px;font-weight:700;}
.sessno-btns{display:flex;gap:6px;}
.sessno-btn{font-family:inherit;font-size:13px;font-weight:700;width:34px;height:34px;border-radius:9px;border:1px solid var(--line);background:#fff;color:var(--muted);cursor:pointer;transition:.14s;}
.sessno-btn:hover{background:#F3EFE5;}
.sessno-btn.on{background:var(--teal);color:#fff;border-color:var(--teal);}
.sessno-hint{font-size:11px;color:var(--muted);flex:1;min-width:160px;text-align:start;}
.composer{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:14px;margin-bottom:16px;}
.composer .ta{margin-bottom:10px;}
.prog{display:flex;flex-direction:column;gap:9px;}
.prog-row{display:flex;gap:9px;align-items:flex-start;}
.prog-n{width:24px;height:24px;flex-shrink:0;border-radius:7px;background:var(--teal-soft);color:var(--teal);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:4px;}
.prog-fields{flex:1;display:flex;flex-direction:column;gap:5px;}
.prog-inp{font-family:inherit;font-size:13px;color:var(--ink);background:#FCFBF7;border:1px solid var(--line);border-radius:8px;padding:7px 10px;width:100%;outline:none;resize:vertical;transition:.14s;}
.prog-inp.focus{font-weight:600;}
.prog-inp:focus{border-color:var(--teal2);box-shadow:0 0 0 3px var(--teal-soft);}
.export-row{display:flex;gap:9px;margin-top:18px;}
.export-row .btn{flex:1;justify-content:center;}
.prevplan{margin-bottom:14px;}
.prevplan .ta{margin-bottom:0;}
.ccard-wrap{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:0;margin-bottom:14px;overflow:hidden;}
.ccard-toggle{display:flex;align-items:center;gap:8px;width:100%;font-family:inherit;font-size:12px;font-weight:700;color:var(--teal);background:none;border:none;cursor:pointer;padding:11px 13px;}
.ccard-toggle span:nth-child(2){flex:1;text-align:start;}
.ccard-body{padding:12px 13px;border-top:1px solid var(--line);}
.ccard-sum{display:flex;flex-direction:column;gap:6px;}
.ccard-row{display:flex;gap:8px;align-items:flex-start;font-size:12px;}
.ccard-lbl{color:var(--muted);min-width:100px;flex-shrink:0;}
.ccard-val{color:var(--ink);flex:1;line-height:1.5;}
.upload-label{display:inline-block;cursor:pointer;}
.upload-alt{margin-top:10px;font-family:inherit;font-size:11px;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0;display:block;}
.btn{font-family:inherit;font-size:14px;font-weight:600;border-radius:10px;padding:10px 18px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;border:1px solid transparent;transition:.16s;}
.btn:disabled{opacity:.55;cursor:not-allowed;}
.btn.primary{background:var(--teal);color:#fff;box-shadow:0 3px 12px rgba(15,110,86,.25);}
.btn.primary:hover:not(:disabled){background:#0c5a47;}
.btn.ghost{background:transparent;border-color:var(--line);color:var(--ink);}
.btn.ghost:hover:not(:disabled){background:#F3EFE5;}
.btn.wide{width:100%;justify-content:center;margin-top:16px;}
.btn.sm{font-size:13px;padding:6px 16px;}
.spin{animation:sp 1s linear infinite;}@keyframes sp{to{transform:rotate(360deg);}}
.banner{display:flex;align-items:center;gap:9px;font-size:13px;border-radius:10px;padding:11px 13px;margin-bottom:13px;line-height:1.5;}
.banner.red{background:var(--red-soft);color:var(--red);border:1px solid #E8C7BF;}
.banner.amber{background:var(--amber-soft);color:var(--amber);border:1px solid #EAD8AC;}
.banner.info{background:var(--teal-soft);color:var(--teal);border:1px solid #C3E6D5;}
.prefs{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;padding:11px 13px;background:#FCFBF7;border:1px solid var(--line);border-radius:11px;}
.pref{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;cursor:pointer;}
.pref input{width:16px;height:16px;accent-color:var(--teal);cursor:pointer;}
.actions{display:flex;gap:9px;flex-wrap:wrap;}
.su-list{display:flex;flex-direction:column;gap:8px;margin-top:8px;}
.su-item-row{display:flex;flex-direction:column;gap:5px;background:#fff;border:1px solid #EAD8AC;border-radius:8px;padding:8px 10px;}
.su-quote{font-size:12px;font-style:italic;}
.su-btns{display:flex;gap:5px;}
.su-btn{font-family:inherit;font-size:11px;font-weight:600;padding:3px 11px;border-radius:20px;border:1px solid #E0D6C0;background:#FCFBF7;color:var(--muted);cursor:pointer;transition:.14s;}
.su-btn:hover{background:#F3EFE5;}
.su-btn.on{background:var(--teal);color:#fff;border-color:var(--teal);}
.su-rerun{margin-top:10px;font-size:13px;padding:8px 14px;}
.report .sec:first-of-type{margin-top:2px;}
.sec{border-top:1px solid var(--line);padding-top:15px;margin-top:15px;}
.sec:first-child{border-top:none;padding-top:0;margin-top:0;}
.sec-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.sec-h h3{font-family:'Frank Ruhl Libre',serif;font-size:17px;font-weight:700;}
.note{font-size:13px;color:var(--ink);margin-top:8px;}
.muted{color:var(--muted);font-size:13px;}
.ev{font-size:12px;color:var(--muted);margin-top:5px;font-style:italic;}
.src{font-size:10px;background:#EFEADF;color:var(--muted);padding:1px 7px;border-radius:20px;font-style:normal;margin-inline-start:4px;}
.vak{display:flex;flex-direction:column;gap:8px;}
.vak-row{display:grid;grid-template-columns:110px 1fr 32px;align-items:center;gap:9px;}
.vak-lbl{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:500;}
.bar{background:#EFEADF;height:9px;border-radius:6px;overflow:hidden;}
.bar-fill{height:100%;background:linear-gradient(90deg,var(--teal2),var(--teal));border-radius:6px;transition:width .5s;}
.vak-num{font-size:12px;font-weight:700;color:var(--teal);text-align:left;}
.pill{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:#EFEADF;color:var(--muted);}
.pill.teal{background:var(--teal-soft);color:var(--teal);}
.pill.amber{background:var(--amber-soft);color:var(--amber);}
.pill.light{background:#F3EFE5;color:var(--muted);font-weight:500;}
.pill.mini{font-size:9px;padding:1px 6px;margin-inline-start:6px;}
.ul{padding-inline-start:18px;font-size:13px;margin-top:6px;}
.ul li{margin-bottom:3px;}
.mm{background:#FCFBF7;border:1px solid var(--line);border-radius:10px;padding:11px 12px;margin-bottom:9px;}
.mm-q{font-size:13px;font-style:italic;}
.mm-tags{display:flex;gap:6px;margin:7px 0;}
.mm-ch{font-size:13px;}
.belief{display:flex;gap:10px;align-items:flex-start;margin-bottom:9px;}
.belief-lbl{font-size:11px;font-weight:700;color:var(--muted);min-width:84px;padding-top:4px;}
.chips{display:flex;flex-wrap:wrap;gap:6px;}
.chip{font-size:12px;padding:4px 11px;border-radius:8px;}
.chip.teal{background:var(--teal-soft);color:var(--teal);}
.chip.amber{background:var(--amber-soft);color:var(--amber);}
.chip.green{background:#E7F1E4;color:#3F6B36;}
.tech{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:12px 13px;margin-bottom:10px;}
.tech-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.rank{width:22px;height:22px;border-radius:50%;background:var(--teal);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;}
.tech-name{font-family:'Frank Ruhl Libre',serif;font-size:15px;font-weight:700;}
.tech-r{font-size:13px;margin-top:7px;}
.tech-o{font-size:12px;color:var(--muted);margin-top:4px;}
.qn{margin-top:10px;border-top:1px dashed var(--line);padding-top:9px;}
.qn-toggle{display:flex;align-items:center;gap:7px;width:100%;font-family:inherit;font-size:12px;font-weight:700;color:var(--teal);background:none;border:none;cursor:pointer;padding:2px 0;}
.qn-toggle span:nth-child(2){flex:1;text-align:start;}
.qn-chev{transition:transform .2s;font-size:11px;}
.qn-chev.open{transform:rotate(180deg);}
.qn-body{margin-top:9px;background:#FCFBF7;border:1px solid var(--line);border-radius:9px;padding:11px 12px;}
.qn-note{font-size:10px;color:var(--muted);background:#EFEADF;border-radius:5px;padding:3px 7px;display:inline-block;margin-bottom:8px;}
.qn-intro{font-size:12px;color:var(--ink);margin-bottom:2px;}
.qn-legend{font-size:11px;color:var(--muted);font-style:italic;margin:7px 0;padding:5px 8px;background:#F3EFE5;border-radius:6px;}
.qn-sec{margin-top:9px;}
.qn-sec h5{font-family:'Frank Ruhl Libre',serif;font-size:13px;color:var(--teal);margin-bottom:4px;}
.qn-sec ul{padding-inline-start:18px;font-size:12.5px;line-height:1.7;}
.qn-sec li{margin-bottom:3px;}
.qn-copy{margin-top:12px;}
.change{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:12px 13px;margin-bottom:10px;transition:.15s;}
.change.accepted{border-color:var(--teal2);background:var(--teal-soft);}
.change.rejected{opacity:.55;}
.change-h{display:flex;gap:6px;align-items:center;margin-bottom:7px;flex-wrap:wrap;}
.change-line{font-size:13px;margin-top:3px;}
.change-reason{font-size:12px;color:var(--muted);margin-top:5px;}
.change-btns{display:flex;gap:8px;margin-top:10px;}
.change-undo{margin-top:9px;font-family:inherit;font-size:11px;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0;}
.plan{list-style:none;counter-reset:p;padding:0;}
.plan li{counter-increment:p;display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:9px 0;border-bottom:1px dashed var(--line);}
.plan li:last-child{border-bottom:none;}
.plan li::before{content:counter(p);width:20px;height:20px;border-radius:6px;background:var(--teal-soft);color:var(--teal);font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;margin-inline-end:9px;}
.plan li>span:first-child{flex:1;display:flex;align-items:center;}
.dur{font-size:11px;color:var(--muted);white-space:nowrap;}
.script-meta{display:flex;gap:7px;margin-bottom:16px;}
.script-step{display:flex;gap:12px;margin-bottom:14px;}
.script-num{width:26px;height:26px;flex-shrink:0;border-radius:8px;background:var(--teal);color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;}
.script-body h4{font-family:'Frank Ruhl Libre',serif;font-size:15px;color:var(--teal);margin-bottom:3px;}
.script-body p{font-size:14px;line-height:1.75;white-space:pre-wrap;}
.rat{font-size:12.5px;margin-bottom:6px;color:var(--ink);}
.ftr{max-width:780px;margin:20px auto 0;font-size:11px;color:var(--muted);text-align:center;line-height:1.6;}
@media(max-width:560px){.grid2{grid-template-columns:1fr;}.vak-row{grid-template-columns:96px 1fr 28px;}}
`;
