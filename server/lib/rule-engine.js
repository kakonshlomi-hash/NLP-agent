const RAPPORT_THRESHOLD = 6;

function applyRules(a, rapport, opts = {}) {
  const { strictWFO = false, includeEcology = false } = opts;
  const warnings = [];
  let recs = Array.isArray(a.technique_recommendations) ? [...a.technique_recommendations] : [];
  let gated = false;

  if (Array.isArray(a.red_flags) && a.red_flags.length) {
    warnings.push({
      level: "red",
      text:
        "זוהו סימנים שעשויים לחרוג מתחום ה-NLP. שקול הפניה למטפל/רופא מורשה. ההמלצות שלהלן מוצגות לשיקול דעתך — הכלי אינו מספק אבחנה.",
    });
  }

  if (rapport < RAPPORT_THRESHOLD) {
    gated = true;
    warnings.push({
      level: "amber",
      text: `רמת ראפור (Rapport) ${rapport}/10 מתחת לסף. כלל #1: מומלץ לבסס ראפור (קצב והובלה (Pacing), הצטרפות והובלה) לפני התקדמות לטכניקת שינוי.`,
    });
  }

  if (a.goal_well_formed === false) {
    warnings.push({
      level: "info",
      text:
        "המטרה עדיין אינה מוגדרת כהלכה (Well-Formed Outcome / WFO)" +
        (a.goal_note ? ` — ${a.goal_note}` : "") +
        '. ניתן לעבוד כך, ולחדד את המטרה לאורך המפגשים. שקול "שאלון מקדם מטרה" אם תרצה לעצב אותה תחילה.',
    });
    if (strictWFO && !recs.some((r) => (r.name || "").includes("שאלון מקדם מטרה"))) {
      recs.unshift({
        name: "שאלון מקדם מטרה",
        table: "בסיסית",
        difficulty: "נמוכה",
        rationale: "מצב מחמיר: עיצוב המטרה כתנאי מקדים לטכניקת שינוי.",
        expected_outcome: "מטרה מוגדרת כהלכה (WFO) לעבודה.",
        _injected: true,
      });
      recs = recs.slice(0, 3);
    }
  }

  if (a.internal_conflict_detected) {
    warnings.push({
      level: "info",
      text: 'זוהה קונפליקט פנימי אפשרי. כלל #8: מומלץ בירור חלקים ("שיחה עם חלק" / "איחוי חלקים") לפני טכניקה חיצונית.',
    });
  }

  let nsOut = null;
  if (a.next_session && typeof a.next_session === "object" && Array.isArray(a.next_session.steps) && a.next_session.steps.length) {
    const ns = { ...a.next_session };
    let steps = [...ns.steps];
    const hasEcology = steps.some((s) => /אקולוג/i.test(s.step || ""));
    const hasFuture = steps.some((s) => /future|עתיד|קיבוע/i.test(s.step || ""));
    if (includeEcology && !hasEcology)
      steps.push({ step: "בדיקת אקולוגיה (Ecology Check)", duration_min: 5, _injected: true });
    if (!includeEcology)
      steps = steps.filter((s) => !/אקולוג/i.test(s.step || ""));
    if (!hasFuture)
      steps.push({ step: "קיבוע עתידי (Future Pacing) — ביסוס וייצוב השינוי", duration_min: 5, _injected: true });
    ns.steps = steps;
    nsOut = ns;
  }

  return { ...a, technique_recommendations: recs, next_session: nsOut, _warnings: warnings, _gated: gated };
}

module.exports = { applyRules, RAPPORT_THRESHOLD };
