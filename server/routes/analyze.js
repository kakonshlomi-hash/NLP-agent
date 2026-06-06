const express = require("express");
const router = express.Router();
const { callClaude } = require("../lib/llm");
const { applyRules } = require("../lib/rule-engine");
const { SYSTEM_PROMPT } = require("../data/prompts");

router.post("/", async (req, res) => {
  const {
    profile = {},
    transcript = "",
    notes = "",
    rapport = 7,
    sessionNumber = 1,
    previousPlan = "",
    clientCard = null,
    speakerCorrections = null,
    strictWFO = false,
    includeEcology = false,
  } = req.body;

  let correctionNote = "";
  if (speakerCorrections && Object.keys(speakerCorrections).length) {
    correctionNote =
      "\n\n== תיקוני ייחוס דובר (מאת המנחה — מחייבים) ==\n" +
      Object.entries(speakerCorrections)
        .map(([quote, role]) => `• האמירה "${quote}" נאמרה ע"י: ${role}. נתח בהתאם.`)
        .join("\n") +
      "\nאם אמירה יוחסה לצד-שלישי או למנחה — אל תתייחס אליה כעדות על מפת המונחה.";
  }

  const userContent =
    `== פרופיל ==\nשם: ${profile.name || ""}\nרקע: ${profile.background || ""}\nאתגרים: ${profile.challenge || ""}\nמטרת פגישה: ${profile.goal || ""}\nמספר הפגישה (session_number): ${sessionNumber}\nרמת ראפור (Rapport) (1-10): ${rapport}\n\n` +
    `== תמליל / ציטוטים ==\n${transcript || "(אין)"}\n\n` +
    `== הערות תצפית ==\n${notes || "(אין)"}` +
    (sessionNumber >= 2 && previousPlan.trim()
      ? `\n\n== התוכנית מהמפגש הקודם (להשוואה) ==\n${previousPlan.trim()}`
      : "") +
    (clientCard
      ? `\n\n== כרטיס מונחה (זיכרון מצטבר מפגישות קודמות) ==` +
        `\nVAK דומיננטי שזוהה: ${clientCard.identity?.vak_dominant || "—"}` +
        `\nהמלצת שפה: ${clientCard.identity?.language_recommendation || "—"}` +
        `\nערכי ליבה שזוהו: ${(clientCard.identity?.core_values || []).join(", ") || "—"}` +
        `\nאמונות מגבילות שזוהו: ${(clientCard.identity?.limiting_beliefs || []).join(", ") || "—"}` +
        `\nטכניקות שהשתמשנו: ${(clientCard.history?.sessions || []).map((s) => `פגישה ${s.n}: ${(s.techniques || []).join(", ") || "—"}`).join(" | ") || "—"}` +
        `\nנושאים פתוחים: ${(clientCard.history?.open_threads || []).join(", ") || "—"}` +
        `\nהוראה: אל תחזור על טכניקות שכבר השתמשנו בהן אלא אם המקרה מצדיק זאת במיוחד.`
      : "") +
    correctionNote;

  try {
    const analysis = await callClaude(SYSTEM_PROMPT, userContent);
    const withRules = applyRules(analysis, rapport, { strictWFO, includeEcology });
    res.json({ ok: true, analysis: withRules });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || "שגיאה לא ידועה" });
  }
});

module.exports = router;
