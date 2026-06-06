import React, { useState } from "react";
import { BookOpen, Copy, Check } from "lucide-react";

export default function QuestionnaireCard({ q }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullText = () => {
    const L = [q.title, "", ...(q.intro || []).map((x) => "• " + x), "", q.legend, ""];
    (q.sections || []).forEach((s) => {
      L.push("— " + s.h);
      (s.items || []).forEach((it) => L.push("  " + it));
      L.push("");
    });
    return L.join("\n");
  };

  const copy = () => {
    navigator.clipboard.writeText(fullText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="qn">
      <button className="qn-toggle" onClick={() => setOpen((o) => !o)}>
        <BookOpen size={14} />
        <span>שאלון מובנה: {q.title}</span>
        <span className={"qn-chev" + (open ? " open" : "")}>▾</span>
      </button>
      {open && (
        <div className="qn-body">
          <p className="qn-note">מוצג נאמן למקור — פרוטוקול קבוע, לא נוצר ע"י המודל.</p>
          {(q.intro || []).map((x, i) => <p key={i} className="qn-intro">• {x}</p>)}
          {q.legend && <p className="qn-legend">{q.legend}</p>}
          {(q.sections || []).map((s, i) => (
            <div key={i} className="qn-sec">
              <h5>{s.h}</h5>
              <ul>{(s.items || []).map((it, j) => <li key={j}>{it}</li>)}</ul>
            </div>
          ))}
          <button className="btn ghost sm qn-copy" onClick={copy}>
            {copied ? <><Check size={13} /> הועתק</> : <><Copy size={13} /> העתק שאלון</>}
          </button>
        </div>
      )}
    </div>
  );
}
