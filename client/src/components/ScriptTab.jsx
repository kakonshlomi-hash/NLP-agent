import React from "react";
import { Sparkles, Loader2, AlertTriangle, Info, Copy, Check, Wand2, Eye, Ear, Hand, MessageSquare } from "lucide-react";
import Section from "./Section.jsx";

const VAK_META = {
  V: { label: "חזותי (V)" },
  A: { label: "שמיעתי (A)" },
  K: { label: "תחושתי (K)" },
  Ad: { label: "דיאלוג פנימי (Ad)" },
};

export default function ScriptTab({ a, onCopy, copied, instruction, onInstruction, onGenerate, loading, error }) {
  const s = a.suggestion_script;
  const dom = VAK_META[a.vak?.dominant]?.label || a.vak?.dominant;

  const composer = (
    <div className="composer">
      <label className="lbl">הנחיה לסקריפט (אופציונלי)</label>
      <textarea
        className="ta" rows={3} value={instruction}
        onChange={(e) => onInstruction(e.target.value)}
        placeholder="לדוגמה: סוגסטיה קצרה לרגיעה בפתיחה; דגש על שחרור ביקורת עצמית…"
      />
      <button className="btn primary wide" onClick={onGenerate} disabled={loading}>
        {loading
          ? <><Loader2 size={15} className="spin" /> מחולל סקריפט…</>
          : <><Sparkles size={15} /> {s ? "צור סקריפט מחדש" : "צור סקריפט סוגסטיה"}</>}
      </button>
      {error && (
        <div className="banner red" style={{ marginTop: 12 }}>
          <AlertTriangle size={16} /><span>{error}</span>
        </div>
      )}
    </div>
  );

  if (!s) {
    return (
      <section className="card">
        <div className="banner info">
          <Info size={16} />
          <span>
            סקריפט הסוגסטיה אינו נוצר אוטומטית. דייק את ההנחיה (אופציונלי) ולחץ ליצירה — מותאם למערכת הייצוג הדומיננטית ({dom}).
          </span>
        </div>
        {composer}
      </section>
    );
  }

  const full = `קצב (Pacing):\n${s.pacing}\n\nהשריה (Induction):\n${s.induction}\n\nהעמקה (Deepening):\n${s.deepening}\n\nסוגסטיה מרכזית:\n${s.core_suggestion}`;
  const parts = [
    ["קצב (Pacing)", s.pacing],
    ["השריה (Induction)", s.induction],
    ["העמקה (Deepening)", s.deepening],
    ["סוגסטיה מרכזית", s.core_suggestion],
  ];

  return (
    <section className="card">
      {composer}
      <div className="script-meta">
        <span className="pill teal"><Wand2 size={12} /> מערכת ייצוג (VAK): {dom}</span>
        <span className="pill light">קצב/הובלה (Pacing/Leading) 70/30</span>
      </div>
      {parts.map(([t, body], i) => (
        <div key={i} className="script-step">
          <div className="script-num">{i + 1}</div>
          <div className="script-body">
            <h4>{t}</h4>
            <p>{body}</p>
          </div>
        </div>
      ))}
      {(s.rationale || []).length > 0 && (
        <Section title="נימוק לבחירות לשוניות">
          {(s.rationale || []).map((r, i) => (
            <p key={i} className="rat"><b>{r.choice}:</b> {r.why}</p>
          ))}
        </Section>
      )}
      <button className="btn ghost wide" onClick={() => onCopy("script", full)}>
        {copied === "script" ? <><Check size={15} /> הועתק</> : <><Copy size={15} /> העתק סקריפט</>}
      </button>
    </section>
  );
}
