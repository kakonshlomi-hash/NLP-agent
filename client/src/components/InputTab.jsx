import React from "react";
import { Brain, Loader2, AlertTriangle, Info } from "lucide-react";
import Field from "./Field.jsx";
import ClientCardPanel from "./ClientCardPanel.jsx";

const RAPPORT_THRESHOLD = 6;

export default function InputTab({
  profile, setProfile,
  transcript, setTranscript,
  notes, setNotes,
  rapport, setRapport,
  sessionNumber, setSessionNumber,
  previousPlan, setPreviousPlan,
  clientCard, setClientCard,
  clientCardInput, setClientCardInput,
  showCardInput, setShowCardInput,
  includeEcology, setIncludeEcology,
  loading, stage, error,
  onAnalyze, onLoadSample, onClear,
  onFileLoad,
}) {
  const handleCardLoad = () => {
    const c = JSON.parse(clientCardInput.replace(/```json|```/g, "").trim());
    if (c) { setClientCard(c); setClientCardInput(""); }
  };

  return (
    <section className="card">
      <div className="grid2">
        <Field label="שם המונחה" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
        <Field label="רקע" value={profile.background} onChange={(v) => setProfile({ ...profile, background: v })} />
        <Field label="אתגרים" value={profile.challenge} onChange={(v) => setProfile({ ...profile, challenge: v })} />
        <Field label="מטרת פגישה" value={profile.goal} onChange={(v) => setProfile({ ...profile, goal: v })} />
      </div>

      <label className="lbl">תמליל / ציטוטים</label>
      <textarea
        className="ta" rows={5} value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="הדבק כאן תמליל שיחה, ציטוטים או תיאור מונחה…"
      />

      <label className="lbl">הערות תצפית (פיזיולוגיה, קליברציה)</label>
      <textarea
        className="ta" rows={2} value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="שפת גוף, נשימה, מתח שרירי, קשר עין…"
      />

      <div className="sessno">
        <span className="sessno-lbl">מספר הפגישה</span>
        <div className="sessno-btns">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={"sessno-btn" + (sessionNumber === n ? " on" : "")}
              onClick={() => setSessionNumber(n)}
            >
              {n === 5 ? "5+" : n}
            </button>
          ))}
        </div>
        <span className="sessno-hint">
          {sessionNumber === 1
            ? "פגישה ראשונה · 90 דק׳ · תכנון המסע"
            : "פגישה ממשיכה · 60–75 דק׳ · הערכת התקדמות"}
        </span>
      </div>

      <ClientCardPanel
        card={clientCard}
        cardInput={clientCardInput}
        onInput={setClientCardInput}
        onLoad={handleCardLoad}
        onClear={() => { setClientCard(null); setClientCardInput(""); }}
        showInput={showCardInput}
        onToggle={() => setShowCardInput((o) => !o)}
        onFileLoad={onFileLoad}
      />

      {sessionNumber >= 2 && (
        <div className="prevplan">
          <label className="lbl">התוכנית מהמפגש הקודם (הדבק מהדוח הקודם)</label>
          <textarea
            className="ta" rows={3} value={previousPlan}
            onChange={(e) => setPreviousPlan(e.target.value)}
            placeholder="הדבק כאן את תכנית ההנחיה מהדוח של המפגש הקודם…"
          />
        </div>
      )}

      <div className="rapport">
        <div className="rapport-head">
          <span>רמת ראפור (Rapport)</span>
          <span className={"rapport-val" + (rapport < RAPPORT_THRESHOLD ? " low" : "")}>{rapport}/10</span>
        </div>
        <input
          type="range" min={1} max={10} value={rapport}
          onChange={(e) => setRapport(Number(e.target.value))}
          className="slider"
        />
        {rapport < RAPPORT_THRESHOLD && (
          <p className="rapport-note">
            <Info size={12} /> מתחת לסף — מנוע החוקים ימליץ לבסס ראפור (Rapport) לפני טכניקת שינוי
          </p>
        )}
      </div>

      {error && (
        <div className="banner red">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="prefs">
        <label className="pref">
          <input
            type="checkbox" checked={includeEcology}
            onChange={(e) => setIncludeEcology(e.target.checked)}
          />
          <span>כלול בדיקת אקולוגיה (Ecology Check) בתכנית</span>
        </label>
        <span className="pref-hint">לפי עמדתך המקצועית</span>
      </div>

      <div className="actions">
        <button className="btn primary" onClick={onAnalyze} disabled={loading}>
          {loading
            ? <><Loader2 size={16} className="spin" /> {stage || "מנתח…"}</>
            : <><Brain size={16} /> נתח</>}
        </button>
        <button className="btn ghost" onClick={onLoadSample} disabled={loading}>טען דוגמה</button>
        <button className="btn ghost" onClick={onClear} disabled={loading}>נקה</button>
      </div>
    </section>
  );
}
