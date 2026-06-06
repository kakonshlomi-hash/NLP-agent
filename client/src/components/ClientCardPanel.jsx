import React, { useState } from "react";
import { Users, FileText, AlertTriangle } from "lucide-react";
import { extractCardFromFile, parseClientCard } from "../utils/clientCard.js";

export default function ClientCardPanel({ card, cardInput, onInput, onLoad, onClear, showInput, onToggle, onFileLoad }) {
  const [showPaste, setShowPaste] = useState(false);
  const [fileErr, setFileErr] = useState("");

  const handleFile = async (e) => {
    setFileErr("");
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await extractCardFromFile(file);
    if (result) {
      onFileLoad(result);
    } else {
      setFileErr("לא נמצא כרטיס מונחה בקובץ. נסה להדביק ידנית.");
      setShowPaste(true);
    }
    e.target.value = "";
  };

  return (
    <div className="ccard-wrap">
      <button className="ccard-toggle" onClick={onToggle}>
        <Users size={14} />
        <span>
          {card
            ? `כרטיס מונחה: ${card.client?.name || ""} · פגישה ${card.last_session}`
            : "העלה דוח מפגישה קודמת (טעינת כרטיס מונחה)"}
        </span>
        <span className={"qn-chev" + (showInput ? " open" : "")}>▾</span>
      </button>
      {showInput && (
        <div className="ccard-body">
          {card ? (
            <>
              <div className="ccard-sum">
                <div className="ccard-row">
                  <span className="ccard-lbl">VAK דומיננטי</span>
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
                    <span className="ccard-lbl">אמונות מגבילות</span>
                    <span className="ccard-val">{card.identity.limiting_beliefs.join(" · ")}</span>
                  </div>
                )}
                {(card.history?.sessions || []).length > 0 && (
                  <div className="ccard-row">
                    <span className="ccard-lbl">היסטוריה</span>
                    <span className="ccard-val">
                      {card.history.sessions.map((s) => `פג׳ ${s.n}: ${(s.techniques || []).join(", ") || "—"}`).join(" | ")}
                    </span>
                  </div>
                )}
              </div>
              <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={onClear}>הסר כרטיס</button>
            </>
          ) : (
            <>
              <p className="qn-note" style={{ marginBottom: 10 }}>
                העלה את קובץ הדוח (HTML) שיוצא בסוף הפגישה הקודמת — הכרטיס ייטען אוטומטית.
              </p>
              <label className="upload-label">
                <input type="file" accept=".html,.doc,.htm,.json" onChange={handleFile} style={{ display: "none" }} />
                <span className="btn primary sm"><FileText size={14} /> בחר קובץ דוח</span>
              </label>
              {fileErr && (
                <p className="banner amber" style={{ marginTop: 8, fontSize: 12 }}>
                  <AlertTriangle size={13} /> {fileErr}
                </p>
              )}
              <button className="upload-alt" onClick={() => setShowPaste((o) => !o)}>
                או הדבק JSON ידנית
              </button>
              {showPaste && (
                <>
                  <textarea
                    className="ta"
                    rows={3}
                    value={cardInput}
                    onChange={(e) => onInput(e.target.value)}
                    placeholder='{"client":{"name":"..."}, ...}'
                    style={{ marginTop: 6, marginBottom: 6 }}
                  />
                  <button className="btn primary sm" onClick={onLoad} disabled={!cardInput.trim()}>טען</button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
