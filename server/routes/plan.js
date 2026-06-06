const express = require("express");
const router = express.Router();
const { callClaude } = require("../lib/llm");
const { PLAN_PROMPT } = require("../data/prompts");

router.post("/", async (req, res) => {
  const {
    sessionNumber = 1,
    profile = {},
    analysisState = {},
    existingPlanText = "",
    hasExistingPlan = false,
    transcript = "",
    notes = "",
  } = req.body;

  const planCtx =
    `מספר הפגישה (session_number): ${sessionNumber}\n` +
    `מטרת המונחה: ${profile.goal || ""}\n` +
    `אתגרים: ${profile.challenge || ""}\n` +
    `מצב רגשי: ${analysisState.state || ""}\n` +
    `המלצות טכניקה: ${(analysisState.technique_recommendations || []).map((t) => t.name).join(", ")}` +
    (hasExistingPlan
      ? `\n\n== התוכנית הקיימת (בסיס סמכותי — אל תשנה אותה אלא בהצעות נקודתיות) ==\n${existingPlanText}\n\n== מה דווח על ההתקדמות ==\n${transcript || notes || "(אין דיווח מפורש)"}`
      : "");

  try {
    const plan = await callClaude(PLAN_PROMPT, planCtx);
    res.json({ ok: true, plan });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || "שגיאה לא ידועה" });
  }
});

module.exports = router;
