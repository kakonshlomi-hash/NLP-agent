import React from "react";
import { Info, Copy, Check } from "lucide-react";
import Section from "./Section.jsx";

export default function ClientCardExport({ card, copied, onCopy }) {
  if (!card) return null;
  const json = JSON.stringify(card, null, 2);
  return (
    <Section title="כרטיס מונחה — נשמר בקובץ הדוח">
      <div className="banner info" style={{ marginBottom: 12 }}>
        <Info size={15} />
        <span>
          הכרטיס מוטמע אוטומטית בקובץ הדוח המיוצא. בפגישה הבאה — העלה את הקובץ בשדה "כרטיס מונחה" והניתוח ימשיך מאיפה שעצרת.
        </span>
      </div>
      <div className="ccard-sum">
        <div className="ccard-row">
          <span className="ccard-lbl">פגישה אחרונה</span>
          <span className="ccard-val">{card.last_session} · {card.updated}</span>
        </div>
        <div className="ccard-row">
          <span className="ccard-lbl">VAK</span>
          <span className="ccard-val">{card.identity?.vak_dominant || "—"}</span>
        </div>
        {(card.identity?.core_values || []).length > 0 && (
          <div className="ccard-row">
            <span className="ccard-lbl">ערכי ליבה</span>
            <span className="ccard-val">{card.identity.core_values.join(" · ")}</span>
          </div>
        )}
        {(card.identity?.limiting_beliefs || []).length > 0 && (
          <div className="ccard-row">
            <span className="ccard-lbl">אמונות מגבילות (מצטבר)</span>
            <span className="ccard-val">{card.identity.limiting_beliefs.join(" · ")}</span>
          </div>
        )}
        {(card.history?.sessions || []).length > 0 && (
          <div className="ccard-row">
            <span className="ccard-lbl">פגישות</span>
            <span className="ccard-val">
              {card.history.sessions.map((s) => `פג׳ ${s.n}: ${(s.techniques || []).join(", ") || "—"}`).join(" | ")}
            </span>
          </div>
        )}
        {card.program && (
          <div className="ccard-row">
            <span className="ccard-lbl">הערכת מסע</span>
            <span className="ccard-val">{card.program.total_sessions_estimate}</span>
          </div>
        )}
      </div>
      <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => onCopy(json)}>
        {copied ? <><Check size={13} /> הועתק</> : <><Copy size={13} /> העתק JSON (גיבוי)</>}
      </button>
    </Section>
  );
}
