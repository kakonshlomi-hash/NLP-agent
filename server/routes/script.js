const express = require("express");
const router = express.Router();
const { callClaude } = require("../lib/llm");
const { SCRIPT_PROMPT } = require("../data/prompts");

router.post("/", async (req, res) => {
  const {
    vak = {},
    state = "",
    goal = "",
    leadTechnique = "",
    instruction = "",
  } = req.body;

  const ctx =
    `מערכת ייצוג דומיננטית: ${vak.dominant || "K"}\n` +
    `המלצת שפה: ${vak.language_recommendation || ""}\n` +
    `מצב רגשי: ${state}\n` +
    `מטרת המונחה: ${goal}\n` +
    `המלצת טכניקה מובילה: ${leadTechnique}\n` +
    (instruction.trim()
      ? `\n== הנחיית המנחה לסקריפט (מחייבת) ==\n${instruction.trim()}\nהתאם את הסקריפט להנחיה זו — אם, איך ומתי הסוגסטיה נכנסת למפגש ובאיזה תוכן.`
      : "");

  try {
    const result = await callClaude(SCRIPT_PROMPT, ctx);
    res.json({ ok: true, script: result.suggestion_script || null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || "שגיאה לא ידועה" });
  }
});

module.exports = router;
