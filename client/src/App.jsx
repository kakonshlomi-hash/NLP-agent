import React, { useState } from "react";
import { Brain, FileText, Sparkles } from "lucide-react";
import CSS from "./components/styles.js";
import InputTab from "./components/InputTab.jsx";
import ReportTab from "./components/ReportTab.jsx";
import ScriptTab from "./components/ScriptTab.jsx";
import { runAnalyze, runPlan, runScript } from "./api.js";
import { buildClientCard, parseClientCard } from "./utils/clientCard.js";

const SAMPLE = {
  name: "דנה",
  background: "בת 34, מנהלת צוות בהייטק, פנתה בעקבות לחץ מתמשך",
  challenge: "תקיעות בקבלת החלטות, ביקורת עצמית גבוהה",
  goal: "אני רוצה להפסיק להרגיש לחוצה",
  transcript:
    "אני פשוט לא מצליחה לראות את התמונה הגדולה. כל פעם שאני צריכה להחליט אני נתקעת. תמיד ככה אצלי — אני חייבת לעשות הכל מושלם אחרת זה לא שווה. אני מרגישה שכולם מסתכלים עליי ומחכים שאני אפשל. הבוס שלי גורם לי להרגיש קטנה.",
  notes: "נשימה רדודה, כתפיים מכווצות, מדברת מהר. הסיטה מבט כשדיברה על הבוס.",
  rapport: 7,
};

export default function App() {
  const [tab, setTab] = useState("input");
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

  const loadSample = () => {
    setProfile({ name: SAMPLE.name, background: SAMPLE.background, challenge: SAMPLE.challenge, goal: SAMPLE.goal });
    setTranscript(SAMPLE.transcript);
    setNotes(SAMPLE.notes);
    setRapport(SAMPLE.rapport);
  };

  const clearAll = () => {
    setProfile({ name: "", background: "", challenge: "", goal: "" });
    setTranscript(""); setNotes(""); setRapport(7); setSessionNumber(1); setPreviousPlan("");
    setClientCard(null); setClientCardInput(""); setShowCardInput(false); setCardCopied(false);
    setAnalysis(null); setError(""); setStage("");
    setCorrections({}); setDirtyCorrections(false); setChangeDecisions({});
    setScriptInstruction(""); setScriptError(""); setTab("input");
  };

  const setCorrection = (quote, role) => {
    setCorrections((prev) => ({ ...prev, [quote]: role }));
    setDirtyCorrections(true);
  };

  const editProgram = (idx, field, value) => {
    setAnalysis((prev) => {
      if (!prev?.program?.sessions) return prev;
      const sessions = prev.program.sessions.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
      return { ...prev, program: { ...prev.program, sessions } };
    });
  };

  const decideChange = (changeIdx, decision) => {
    setChangeDecisions((prev) => ({ ...prev, [changeIdx]: decision }));
    if (decision !== "accepted") return;
    setAnalysis((prev) => {
      const ch = prev?.plan_update?.changes?.[changeIdx];
      if (!ch || !prev.program) return prev;
      let sessions = [...(prev.program.sessions || [])];
      if (ch.type === "הסרה") {
        sessions = sessions.filter((s) => s.n !== ch.n);
      } else if (ch.type === "הוספה") {
        if (!sessions.some((s) => s.n === ch.n)) sessions.push({ n: ch.n, focus: ch.to, main_content: ch.to });
      } else {
        sessions = sessions.map((s) => (s.n === ch.n ? { ...s, main_content: ch.to } : s));
      }
      sessions.sort((x, y) => (x.n || 0) - (y.n || 0));
      return { ...prev, program: { ...prev.program, sessions } };
    });
  };

  const analyze = async (speakerCorrections = null) => {
    setError("");
    if (!transcript.trim() && !notes.trim()) {
      setError("יש להזין תמליל/ציטוטים או הערות תצפית לפני ניתוח.");
      return;
    }
    const isReRun = !!speakerCorrections;
    isReRun ? setReRunning(true) : setLoading(true);

    try {
      setStage(isReRun ? "מריץ מחדש עם התיקונים…" : "מנתח את המקרה…");
      const analysisResult = await runAnalyze({
        profile, transcript, notes, rapport, sessionNumber,
        previousPlan, clientCard,
        speakerCorrections: speakerCorrections || null,
        strictWFO, includeEcology,
      });

      setStage("בונה תכנית מפגשים…");
      const existingProgram = clientCard?.program || null;
      const existingPlanText = existingProgram
        ? "הערכת מפגשים: " + (existingProgram.total_sessions_estimate || "—") + "\n" +
          (existingProgram.sessions || []).map((s) => `מפגש ${s.n}: ${s.focus} — ${s.main_content}`).join("\n")
        : previousPlan.trim();
      const hasExistingPlan = sessionNumber >= 2 && !!existingPlanText;

      let plan = {};
      try {
        plan = await runPlan({
          sessionNumber, profile,
          analysisState: analysisResult,
          existingPlanText,
          hasExistingPlan,
          transcript, notes,
        });
      } catch { /* plan failure non-fatal */ }

      const baseProgram = hasExistingPlan ? (existingProgram || plan.program) : plan.program;
      const merged = {
        ...analysisResult,
        program: baseProgram || null,
        plan_update: hasExistingPlan
          ? (plan.plan_update || { is_update: true, summary: "", changes: [] })
          : null,
        next_session: plan.next_session || null,
      };

      setAnalysis((prev) => ({
        ...merged,
        suggestion_script: isReRun ? prev?.suggestion_script || null : null,
      }));

      const updatedCard = buildClientCard(merged, profile, sessionNumber, rapport, clientCard);
      setClientCard(updatedCard);
      if (!isReRun) setCorrections({});
      if (!isReRun) setChangeDecisions({});
      setDirtyCorrections(false);
      setTab("report");
    } catch (e) {
      const m = e.message || "";
      if (m.startsWith("API")) setError("שגיאת מנוע הניתוח — " + m);
      else setError("שגיאה: " + (m || "לא ידועה") + " — נסה שוב.");
    }
    setStage("");
    isReRun ? setReRunning(false) : setLoading(false);
  };

  const generateScript = async () => {
    if (!analysis) return;
    setScriptError("");
    setScriptLoading(true);
    try {
      const script = await runScript({
        vak: analysis.vak,
        state: analysis.state || "",
        goal: profile.goal || "",
        leadTechnique: analysis.technique_recommendations?.[0]?.name || "",
        instruction: scriptInstruction,
      });
      setAnalysis((prev) => ({ ...prev, suggestion_script: script }));
    } catch (e) {
      setScriptError("יצירת הסקריפט נכשלה — " + (e.message || "נסה שוב."));
    }
    setScriptLoading(false);
  };

  const copy = (key, txt) => {
    navigator.clipboard.writeText(txt).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1800);
    });
  };

  return (
    <div dir="rtl" className="nlp-root">
      <style>{CSS}</style>

      <header className="hdr">
        <div className="hdr-mark"><Brain size={20} /></div>
        <div className="hdr-text">
          <h1>NLP Master Assistant</h1>
          <p>Phase 2 · כלי תמיכת-החלטה למנחה · Backend מאובטח</p>
        </div>
      </header>

      <nav className="tabs">
        <button className={tab === "input" ? "tab on" : "tab"} onClick={() => setTab("input")}>
          <FileText size={15} /> קלט
        </button>
        <button
          className={tab === "report" ? "tab on" : "tab"}
          disabled={!analysis}
          onClick={() => analysis && setTab("report")}
        >
          <Brain size={15} /> דוח ניתוח
        </button>
        <button
          className={tab === "script" ? "tab on" : "tab"}
          disabled={!analysis}
          onClick={() => analysis && setTab("script")}
        >
          <Sparkles size={15} /> סקריפט סוגסטיה
        </button>
      </nav>

      <main className="main">
        {tab === "input" && (
          <InputTab
            profile={profile} setProfile={setProfile}
            transcript={transcript} setTranscript={setTranscript}
            notes={notes} setNotes={setNotes}
            rapport={rapport} setRapport={setRapport}
            sessionNumber={sessionNumber} setSessionNumber={setSessionNumber}
            previousPlan={previousPlan} setPreviousPlan={setPreviousPlan}
            clientCard={clientCard} setClientCard={setClientCard}
            clientCardInput={clientCardInput} setClientCardInput={setClientCardInput}
            showCardInput={showCardInput} setShowCardInput={setShowCardInput}
            includeEcology={includeEcology} setIncludeEcology={setIncludeEcology}
            loading={loading} stage={stage} error={error}
            onAnalyze={() => analyze()}
            onLoadSample={loadSample}
            onClear={clearAll}
            onFileLoad={(card) => { setClientCard(card); setShowCardInput(true); }}
          />
        )}
        {tab === "report" && analysis && (
          <ReportTab
            a={analysis} profile={profile}
            onCopy={copy} copied={copied}
            corrections={corrections} onSetCorrection={setCorrection}
            dirtyCorrections={dirtyCorrections}
            onReRun={() => analyze(corrections)} reRunning={reRunning}
            onEditProgram={editProgram}
            changeDecisions={changeDecisions} onDecideChange={decideChange}
            clientCard={clientCard}
            cardCopied={cardCopied}
            onCopyCard={(json) => {
              navigator.clipboard.writeText(json).then(() => {
                setCardCopied(true);
                setTimeout(() => setCardCopied(false), 1800);
              });
            }}
          />
        )}
        {tab === "script" && analysis && (
          <ScriptTab
            a={analysis}
            onCopy={copy} copied={copied}
            instruction={scriptInstruction} onInstruction={setScriptInstruction}
            onGenerate={generateScript}
            loading={scriptLoading} error={scriptError}
          />
        )}
      </main>

      <footer className="ftr">
        פרטיות: מפתח ה-API נשמר בשרת בלבד. הכלי תומך בשיקול הדעת של המנחה, אינו מחליפו ואינו מספק אבחנה רפואית.
      </footer>
    </div>
  );
}
