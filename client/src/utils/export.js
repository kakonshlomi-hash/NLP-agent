import questionnairesData from "../data/questionnaires.json";

export function findQuestionnaire(techniqueName) {
  if (!techniqueName) return null;
  const name = techniqueName.trim();
  if (questionnairesData[name]) return questionnairesData[name];
  const key = Object.keys(questionnairesData).find(
    (k) => name.includes(k) || k.includes(name)
  );
  return key ? questionnairesData[key] : null;
}

function esc(t) {
  return String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function reportToMarkdown(a, profile) {
  const L = [];
  L.push(`# דוח ניתוח NLP — ${profile.name || "ללא שם"}`);
  if (a._warnings?.length) {
    L.push(`\n## התראות מנוע החוקים`);
    a._warnings.forEach((w) => L.push(`- ${w.text}`));
  }
  L.push(`\n## מערכת ייצוג (VAK)\nדומיננטי: ${a.vak?.dominant} · המלצת שפה: ${a.vak?.language_recommendation}`);
  L.push(`\n## מצב רגשי\n${a.state}`);
  L.push(`\n## Meta Model`);
  (a.meta_model || []).forEach((m) => L.push(`- "${m.quote}" — ${m.category}/${m.pattern} → ${m.challenge} (מקור: ${m.source})`));
  L.push(`\n## ערכים ואמונות\nליבה: ${(a.values_beliefs?.core_values || []).join(", ")}\nמגבילות: ${(a.values_beliefs?.limiting_beliefs || []).join(", ")}\nמחזקות: ${(a.values_beliefs?.empowering_beliefs || []).join(", ")}`);
  L.push(`\n## המלצות טכניקה`);
  (a.technique_recommendations || []).forEach((t, i) => L.push(`${i + 1}. ${t.name} [${t.table}] — ${t.rationale} (צפוי: ${t.expected_outcome})`));
  if (a.plan_update?.is_update) {
    L.push(`\n## עדכון תוכנית\n${a.plan_update.summary || ""}`);
    (a.plan_update.changes || []).forEach((c) => L.push(`- מפגש ${c.n} [${c.type}]: ${c.from ? c.from + " → " : ""}${c.to} (${c.reason})`));
  }
  if (a.program) {
    L.push(`\n## תכנית הנחיה — הערכת מפגשים: ${a.program.total_sessions_estimate || "—"}`);
    (a.program.sessions || []).map((s) => L.push(`- מפגש ${s.n}: ${s.focus} — ${s.main_content}`));
  }
  if (a.next_session) {
    L.push(`\n## פירוט הפגישה הבאה (מפגש ${a.next_session.n}, ${a.next_session.duration_min} דק׳)`);
    (a.next_session.steps || []).forEach((s) => L.push(`- ${s.step} (${s.duration_min} דק׳)`));
  }
  return L.join("\n");
}

export function buildReportHTML(a, profile, forWord, card) {
  const sec = (title, body) => `<h2>${esc(title)}</h2>${body}`;
  const list = (arr, fn) => `<ul>${(arr || []).map(fn).join("")}</ul>`;
  const printScript = forWord ? "" : `<div class="noprint" style="text-align:center;margin:14px 0;padding:10px;background:#E4F3EC;border-radius:8px;font-size:13px;">להפקת PDF: לחצו Ctrl/Cmd+P ובחרו "שמירה כ-PDF". <button onclick="window.print()" style="margin-inline-start:8px;padding:5px 14px;border:1px solid #0F6E56;background:#0F6E56;color:#fff;border-radius:6px;cursor:pointer;">הדפסה</button></div><style>@media print{.noprint{display:none}}</style>`;

  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8">
  <title>דוח NLP — ${esc(profile.name || "")}</title>
  <style>
    @page { margin: 18mm; }
    body{font-family:'Frank Ruhl Libre','David','Times New Roman',serif;color:#1C2B27;line-height:1.7;direction:rtl;padding:24px;max-width:800px;margin:0 auto;}
    h1{font-size:24px;border-bottom:3px solid #0F6E56;padding-bottom:8px;}
    h2{font-size:17px;color:#0F6E56;margin-top:22px;border-bottom:1px solid #ddd;padding-bottom:4px;}
    ul,ol{padding-inline-start:22px;} li{margin-bottom:5px;}
    .q{font-style:italic;color:#444;} .src{font-size:11px;color:#888;}
    .warn{background:#FBF1DA;border:1px solid #EAD8AC;border-radius:8px;padding:10px;margin:6px 0;font-size:13px;}
    table{width:100%;border-collapse:collapse;margin-top:6px;} td,th{border:1px solid #ddd;padding:6px 9px;text-align:right;font-size:13px;vertical-align:top;}
    .muted{color:#888;}
  </style></head><body>
  ${printScript}
  <h1>דוח ניתוח NLP — ${esc(profile.name || "ללא שם")}</h1>
  <p class="muted">אתגרים: ${esc(profile.challenge)} · מטרה: ${esc(profile.goal)}</p>
  ${(a._warnings || []).length ? sec("התראות מנוע החוקים", (a._warnings || []).map((x) => `<div class="warn">${esc(x.text)}</div>`).join("")) : ""}
  ${sec("מערכת ייצוג (VAK)", `<p>דומיננטי: <b>${esc(a.vak?.dominant)}</b> · המלצת שפה: ${esc(a.vak?.language_recommendation)}</p>` +
    list(a.vak?.evidence, (e) => `<li class="q">"${esc(e.quote)}" <span class="src">${esc(e.source)}</span></li>`))}
  ${sec("מצב רגשי וקצב (Pacing)", `<p>${esc(a.state)}</p>` + list(a.pacing_recommendations, (p) => `<li>${esc(p)}</li>`))}
  ${sec("מודל מטא (Meta Model)", list(a.meta_model, (m) =>
    `<li><span class="q">"${esc(m.quote)}"</span> — ${esc(m.category)}/${esc(m.pattern)} → <b>תיגור:</b> ${esc(m.challenge)} <span class="src">${esc(m.source)}</span></li>`))}
  ${sec("ערכים ואמונות", `<p><b>ליבה:</b> ${esc((a.values_beliefs?.core_values || []).join(", "))}</p>
    <p><b>מגבילות:</b> ${esc((a.values_beliefs?.limiting_beliefs || []).join(", "))}</p>
    <p><b>מחזקות:</b> ${esc((a.values_beliefs?.empowering_beliefs || []).join(", "))}</p>`)}
  ${sec("המלצות טכניקה", `<ol>${(a.technique_recommendations || []).map((t) =>
    `<li><b>${esc(t.name)}</b> [${esc(t.table)}${t.difficulty ? ", קושי: " + esc(t.difficulty) : ""}] — ${esc(t.rationale)}${t.expected_outcome ? ` <span class="muted">(צפוי: ${esc(t.expected_outcome)})</span>` : ""}</li>`).join("")}</ol>`)}
  ${a.program ? sec(`תכנית הנחיה — הערכת מפגשים: ${esc(a.program.total_sessions_estimate || "—")}`,
    `<table><tr><th>מפגש</th><th>מוקד</th><th>תוכן מרכזי</th></tr>${(a.program.sessions || []).map((s) =>
      `<tr><td>${esc(s.n)}</td><td>${esc(s.focus)}</td><td>${esc(s.main_content)}</td></tr>`).join("")}</table>`) : ""}
  ${a.next_session ? sec(`פירוט הפגישה הבאה — מפגש ${esc(a.next_session.n)} (${esc(a.next_session.duration_min)} דק׳)`,
    `<ol>${(a.next_session.steps || []).map((s) => `<li>${esc(s.step)} <span class="muted">(${esc(s.duration_min)} דק׳)</span></li>`).join("")}</ol>`) : ""}
  ${a.suggestion_script ? sec("סקריפט סוגסטיה", `
    <p><b>קצב (Pacing):</b> ${esc(a.suggestion_script.pacing)}</p>
    <p><b>השריה (Induction):</b> ${esc(a.suggestion_script.induction)}</p>
    <p><b>העמקה (Deepening):</b> ${esc(a.suggestion_script.deepening)}</p>
    <p><b>סוגסטיה מרכזית:</b> ${esc(a.suggestion_script.core_suggestion)}</p>`) : ""}
  <p class="muted" style="margin-top:28px;border-top:1px solid #ddd;padding-top:8px;">
    הופק ע"י NLP Master Assistant · כלי תומך-החלטה למנחה · אינו מספק אבחנה רפואית.</p>
  ${card ? `<script type="application/json" id="nlp-client-card">${JSON.stringify(card)}<\/script>` : ""}
  </body></html>`;
}

export function downloadFile(filename, content, mime) {
  const blob = new Blob(["﻿" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function exportReport(a, profile, format, card) {
  const safeName = (profile.name || "report").replace(/[^֐-׿\w]+/g, "_");
  if (format === "word") {
    downloadFile(`דוח_NLP_${safeName}.doc`, buildReportHTML(a, profile, true, card), "application/msword");
  } else {
    downloadFile(`דוח_NLP_${safeName}.html`, buildReportHTML(a, profile, false, card), "text/html");
  }
}
