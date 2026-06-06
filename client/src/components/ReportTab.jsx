import React from "react";
import { Eye, Ear, Hand, MessageSquare, Brain, Copy, Check, FileText, Loader2, AlertTriangle } from "lucide-react";
import Section from "./Section.jsx";
import Warning from "./Warning.jsx";
import BeliefRow from "./BeliefRow.jsx";
import QuestionnaireCard from "./QuestionnaireCard.jsx";
import ClientCardExport from "./ClientCardExport.jsx";
import { findQuestionnaire, reportToMarkdown, exportReport } from "../utils/export.js";

const VAK_META = {
  V: { label: "חזותי (V)", icon: <Eye size={14} /> },
  A: { label: "שמיעתי (A)", icon: <Ear size={14} /> },
  K: { label: "תחושתי (K)", icon: <Hand size={14} /> },
  Ad: { label: "דיאלוג פנימי (Ad)", icon: <MessageSquare size={14} /> },
};

export default function ReportTab({
  a, profile,
  onCopy, copied,
  corrections, onSetCorrection,
  dirtyCorrections, onReRun, reRunning,
  onEditProgram,
  changeDecisions, onDecideChange,
  clientCard, cardCopied, onCopyCard,
}) {
  const liveCard = clientCard ? { ...clientCard, program: a.program || clientCard.program } : null;
  const v = a.vak || {};
  const scores = v.scores || {};
  const max = Math.max(1, ...Object.values(scores).map((n) => Number(n) || 0));

  return (
    <section className="card report">
      {(a._warnings || []).map((w, i) => <Warning key={i} {...w} />)}

      {Array.isArray(a.speaker_uncertainty) && a.speaker_uncertainty.length > 0 && (
        <div className="banner amber" style={{ alignItems: "flex-start" }}>
          <MessageSquare size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            <b>אי-ודאות לגבי דובר:</b> ייחוס האמירות הבאות אינו ודאי. אשר או תקן את הדובר לכל אמירה.
            <span className="su-list">
              {a.speaker_uncertainty.map((u, i) => {
                const current = corrections[u.quote] || u.assumed || "מונחה";
                return (
                  <span key={i} className="su-item-row">
                    <span className="su-quote">"{u.quote}"{u.note ? ` — ${u.note}` : ""}</span>
                    <span className="su-btns">
                      {["מונחה", "מנחה", "צד-שלישי"].map((role) => (
                        <button
                          key={role}
                          className={"su-btn" + (current === role ? " on" : "")}
                          onClick={() => onSetCorrection(u.quote, role)}
                        >
                          {role}
                        </button>
                      ))}
                    </span>
                  </span>
                );
              })}
            </span>
            {dirtyCorrections && (
              <button className="btn primary su-rerun" onClick={onReRun} disabled={reRunning}>
                {reRunning
                  ? <><Loader2 size={14} className="spin" /> מריץ מחדש…</>
                  : <><Brain size={14} /> הרץ ניתוח מחדש עם התיקונים</>}
              </button>
            )}
          </span>
        </div>
      )}

      <Section
        title="מערכת ייצוג (VAK)"
        right={<span className="pill teal">דומיננטי: {VAK_META[v.dominant]?.label || v.dominant}</span>}
      >
        <div className="vak">
          {["V", "A", "K", "Ad"].map((k) => (
            <div key={k} className="vak-row">
              <span className="vak-lbl">{VAK_META[k].icon} {VAK_META[k].label}</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${((Number(scores[k]) || 0) / max) * 100}%` }} />
              </div>
              <span className="vak-num">{Number(scores[k]) || 0}</span>
            </div>
          ))}
        </div>
        {v.language_recommendation && <p className="note"><b>המלצת שפה:</b> {v.language_recommendation}</p>}
        {(v.evidence || []).map((e, i) => (
          <p key={i} className="ev">"{e.quote}" <span className="src">{e.source}</span></p>
        ))}
      </Section>

      <Section title="מצב רגשי וקצב (Pacing)">
        <p>{a.state}</p>
        {(a.pacing_recommendations || []).length > 0 && (
          <ul className="ul">{(a.pacing_recommendations || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
        )}
      </Section>

      <Section title="מודל מטא (Meta Model) — הפרות שפה">
        {(a.meta_model || []).length === 0 && <p className="muted">לא זוהו הפרות מובהקות.</p>}
        {(a.meta_model || []).map((m, i) => (
          <div key={i} className="mm">
            <p className="mm-q">"{m.quote}" <span className="src">{m.source}</span></p>
            <div className="mm-tags">
              <span className="pill">{m.category}</span>
              {m.pattern && <span className="pill light">{m.pattern}</span>}
            </div>
            <p className="mm-ch"><b>תיגור:</b> {m.challenge}</p>
          </div>
        ))}
      </Section>

      <Section title="ערכים ואמונות">
        <BeliefRow label="ערכי ליבה" items={a.values_beliefs?.core_values} tone="teal" />
        <BeliefRow label="אמונות מגבילות" items={a.values_beliefs?.limiting_beliefs} tone="amber" />
        <BeliefRow label="אמונות מחזקות" items={a.values_beliefs?.empowering_beliefs} tone="green" />
      </Section>

      <Section
        title="המלצות טכניקה (מדורגות)"
        right={a._gated ? <span className="pill amber">לבסס ראפור (Rapport) תחילה</span> : null}
      >
        {(a.technique_recommendations || []).map((t, i) => (
          <div key={i} className="tech">
            <div className="tech-h">
              <span className="rank">{i + 1}</span>
              <span className="tech-name">{t.name}</span>
              <span className="pill light">{t.table}</span>
              {t.difficulty && <span className="pill light">קושי: {t.difficulty}</span>}
              {t._injected && <span className="pill teal">מנוע החוקים</span>}
            </div>
            <p className="tech-r">{t.rationale}</p>
            {t.expected_outcome && <p className="tech-o"><b>תוצאה צפויה:</b> {t.expected_outcome}</p>}
            {findQuestionnaire(t.name) && <QuestionnaireCard q={findQuestionnaire(t.name)} />}
          </div>
        ))}
      </Section>

      {a.plan_update?.is_update && (
        <Section
          title="עדכון תוכנית — אימות מול המפגש הקודם"
          right={
            (a.plan_update.changes || []).length === 0
              ? <span className="pill teal">אין שינוי</span>
              : <span className="pill amber">{(a.plan_update.changes || []).length} הצעות</span>
          }
        >
          {a.plan_update.summary && <p className="note">{a.plan_update.summary}</p>}
          {(a.plan_update.changes || []).length > 0 && (a.plan_update.changes || []).some((c, i) => !changeDecisions[i]) && (
            <div className="banner amber" style={{ marginBottom: 12 }}>
              <AlertTriangle size={15} />
              <span>התוכנית הקיימת נשמרה כפי שהיא. השינויים הבאים מוצעים בלבד — יוחלו רק לאחר שתאשר כל אחד.</span>
            </div>
          )}
          {(a.plan_update.changes || []).length === 0 ? (
            <p className="muted">התוכנית נשארת בעינה — לא נדרש עדכון.</p>
          ) : (
            (a.plan_update.changes || []).map((c, i) => {
              const d = changeDecisions[i];
              return (
                <div key={i} className={"change" + (d ? " " + d : "")}>
                  <div className="change-h">
                    <span className="pill light">מפגש {c.n}</span>
                    <span className="pill amber">{c.type}</span>
                    {d === "accepted" && <span className="pill teal">✓ התקבל</span>}
                    {d === "rejected" && <span className="pill">✕ נדחה</span>}
                  </div>
                  {c.from && <p className="change-line"><b>מ:</b> {c.from}</p>}
                  <p className="change-line"><b>ל:</b> {c.to}</p>
                  {c.reason && <p className="change-reason">{c.reason}</p>}
                  {!d && (
                    <div className="change-btns">
                      <button className="btn primary sm" onClick={() => onDecideChange(i, "accepted")}>קבל</button>
                      <button className="btn ghost sm" onClick={() => onDecideChange(i, "rejected")}>דחה</button>
                    </div>
                  )}
                  {d === "rejected" && (
                    <button className="change-undo" onClick={() => onDecideChange(i, undefined)}>בטל בחירה</button>
                  )}
                </div>
              );
            })
          )}
        </Section>
      )}

      {a.program && (
        <Section
          title="תכנית הנחיה (הצעה — ניתנת לעריכה)"
          right={<span className="pill light">הערכת מפגשים: {a.program.total_sessions_estimate || "—"}</span>}
        >
          <div className="prog">
            {(a.program.sessions || []).map((s, i) => (
              <div key={i} className="prog-row">
                <span className="prog-n">{s.n}</span>
                <div className="prog-fields">
                  <input
                    className="prog-inp focus"
                    value={s.focus || ""}
                    onChange={(e) => onEditProgram(i, "focus", e.target.value)}
                    placeholder="מוקד המפגש"
                  />
                  <textarea
                    className="prog-inp"
                    rows={2}
                    value={s.main_content || ""}
                    onChange={(e) => onEditProgram(i, "main_content", e.target.value)}
                    placeholder="תוכן מרכזי מוצע"
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {a.next_session && (
        <Section
          title={`פירוט הפגישה הבאה — מפגש ${a.next_session.n}`}
          right={<span className="pill teal">{a.next_session.duration_min} דק׳</span>}
        >
          <ol className="plan">
            {(a.next_session.steps || []).map((s, i) => (
              <li key={i}>
                <span>{s.step}{s._injected && <span className="pill teal mini">חובה</span>}</span>
                <span className="dur">{s.duration_min} דק׳</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <ClientCardExport card={liveCard} copied={cardCopied} onCopy={onCopyCard} />

      <div className="export-row">
        <button className="btn ghost" onClick={() => onCopy("report", reportToMarkdown(a, profile))}>
          {copied === "report" ? <><Check size={15} /> הועתק</> : <><Copy size={15} /> העתק טקסט</>}
        </button>
        <button className="btn ghost" onClick={() => exportReport(a, profile, "word", liveCard)}>
          <FileText size={15} /> הורד Word
        </button>
        <button className="btn primary" onClick={() => exportReport(a, profile, "pdf", liveCard)}>
          <FileText size={15} /> הורד ל-PDF
        </button>
      </div>
    </section>
  );
}
