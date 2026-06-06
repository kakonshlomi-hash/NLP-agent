const CSS = `
.nlp-root{--paper:#F7F4EE;--card:#FFFEFB;--ink:#1C2B27;--teal:#0F6E56;--teal2:#5DCAA5;--teal-soft:#E4F3EC;
--amber:#9A6B12;--amber-soft:#FBF1DA;--red:#9B3A2E;--red-soft:#F7E6E1;--muted:#727A74;--line:#E6E0D4;
font-family:'Heebo',-apple-system,sans-serif;color:var(--ink);background:
radial-gradient(circle at 12% 0%,#FBF9F3 0%,transparent 55%),var(--paper);
min-height:100vh;padding:22px 16px 40px;direction:rtl;line-height:1.6;}
.nlp-root *{box-sizing:border-box;margin:0;}
.hdr{max-width:780px;margin:0 auto 18px;display:flex;align-items:center;gap:13px;}
.hdr-mark{width:42px;height:42px;border-radius:12px;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(15,110,86,.28);}
.hdr-text h1{font-family:'Frank Ruhl Libre',serif;font-weight:900;font-size:24px;letter-spacing:-.3px;}
.hdr-text p{font-size:12px;color:var(--muted);margin-top:1px;}
.tabs{max-width:780px;margin:0 auto 14px;display:flex;gap:6px;background:#EFEADF;padding:5px;border-radius:12px;}
.tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-family:inherit;font-size:13px;font-weight:500;
padding:9px;border:none;border-radius:9px;background:transparent;color:var(--muted);cursor:pointer;transition:.18s;}
.tab:hover:not(:disabled){color:var(--ink);}
.tab.on{background:var(--card);color:var(--teal);box-shadow:0 2px 8px rgba(28,43,39,.08);font-weight:700;}
.tab:disabled{opacity:.4;cursor:not-allowed;}
.main{max-width:780px;margin:0 auto;}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 6px 24px rgba(28,43,39,.05);}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}
.field{display:flex;flex-direction:column;}
.lbl{font-size:11px;font-weight:700;color:var(--teal);margin-bottom:5px;letter-spacing:.2px;}
.inp,.ta{font-family:inherit;font-size:14px;color:var(--ink);background:#FCFBF7;border:1px solid var(--line);border-radius:9px;padding:9px 11px;width:100%;outline:none;transition:.15s;resize:vertical;}
.inp:focus,.ta:focus{border-color:var(--teal2);box-shadow:0 0 0 3px var(--teal-soft);}
.ta{margin-bottom:14px;}
.rapport{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:13px 14px;margin-bottom:14px;}
.rapport-head{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:700;margin-bottom:8px;}
.rapport-val{font-family:'Frank Ruhl Libre',serif;font-size:18px;color:var(--teal);}
.rapport-val.low{color:var(--amber);}
.slider{width:100%;accent-color:var(--teal);height:5px;cursor:pointer;}
.rapport-note{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--amber);margin-top:8px;}
.sessno{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:13px 14px;margin-bottom:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.sessno-lbl{font-size:13px;font-weight:700;}
.sessno-btns{display:flex;gap:6px;}
.sessno-btn{font-family:inherit;font-size:13px;font-weight:700;width:34px;height:34px;border-radius:9px;border:1px solid var(--line);background:#fff;color:var(--muted);cursor:pointer;transition:.14s;}
.sessno-btn:hover{background:#F3EFE5;}
.sessno-btn.on{background:var(--teal);color:#fff;border-color:var(--teal);}
.sessno-hint{font-size:11px;color:var(--muted);flex:1;min-width:160px;text-align:start;}
.composer{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:14px;margin-bottom:16px;}
.composer .ta{margin-bottom:10px;}
.prog{display:flex;flex-direction:column;gap:9px;}
.prog-row{display:flex;gap:9px;align-items:flex-start;}
.prog-n{width:24px;height:24px;flex-shrink:0;border-radius:7px;background:var(--teal-soft);color:var(--teal);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:4px;}
.prog-fields{flex:1;display:flex;flex-direction:column;gap:5px;}
.prog-inp{font-family:inherit;font-size:13px;color:var(--ink);background:#FCFBF7;border:1px solid var(--line);border-radius:8px;padding:7px 10px;width:100%;outline:none;resize:vertical;transition:.14s;}
.prog-inp.focus{font-weight:600;}
.prog-inp:focus{border-color:var(--teal2);box-shadow:0 0 0 3px var(--teal-soft);}
.export-row{display:flex;gap:9px;margin-top:18px;}
.export-row .btn{flex:1;justify-content:center;}
.prevplan{margin-bottom:14px;}
.prevplan .ta{margin-bottom:0;}
.ccard-wrap{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:0;margin-bottom:14px;overflow:hidden;}
.ccard-toggle{display:flex;align-items:center;gap:8px;width:100%;font-family:inherit;font-size:12px;font-weight:700;color:var(--teal);background:none;border:none;cursor:pointer;padding:11px 13px;}
.ccard-toggle span:nth-child(2){flex:1;text-align:start;}
.ccard-body{padding:12px 13px;border-top:1px solid var(--line);}
.ccard-sum{display:flex;flex-direction:column;gap:6px;}
.ccard-row{display:flex;gap:8px;align-items:flex-start;font-size:12px;}
.ccard-lbl{color:var(--muted);min-width:100px;flex-shrink:0;}
.ccard-val{color:var(--ink);flex:1;line-height:1.5;}
.upload-label{display:inline-block;cursor:pointer;}
.upload-alt{margin-top:10px;font-family:inherit;font-size:11px;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0;display:block;}
.btn.sm{font-size:13px;padding:6px 16px;}
.change{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:12px 13px;margin-bottom:10px;transition:.15s;}
.change.accepted{border-color:var(--teal2);background:var(--teal-soft);}
.change.rejected{opacity:.55;}
.change-h{display:flex;gap:6px;align-items:center;margin-bottom:7px;flex-wrap:wrap;}
.change-line{font-size:13px;margin-top:3px;}
.change-reason{font-size:12px;color:var(--muted);margin-top:5px;}
.change-btns{display:flex;gap:8px;margin-top:10px;}
.change-undo{margin-top:9px;font-family:inherit;font-size:11px;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0;}
.actions{display:flex;gap:9px;flex-wrap:wrap;}
.prefs{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;padding:11px 13px;background:#FCFBF7;border:1px solid var(--line);border-radius:11px;}
.pref{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;cursor:pointer;}
.pref input{width:16px;height:16px;accent-color:var(--teal);cursor:pointer;}
.pref-hint{font-size:11px;color:var(--muted);}
.btn{font-family:inherit;font-size:14px;font-weight:600;border-radius:10px;padding:10px 18px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;border:1px solid transparent;transition:.16s;}
.btn:disabled{opacity:.55;cursor:not-allowed;}
.btn.primary{background:var(--teal);color:#fff;box-shadow:0 3px 12px rgba(15,110,86,.25);}
.btn.primary:hover:not(:disabled){background:#0c5a47;}
.btn.ghost{background:transparent;border-color:var(--line);color:var(--ink);}
.btn.ghost:hover:not(:disabled){background:#F3EFE5;}
.btn.wide{width:100%;justify-content:center;margin-top:16px;}
.spin{animation:sp 1s linear infinite;}@keyframes sp{to{transform:rotate(360deg);}}
.banner{display:flex;align-items:center;gap:9px;font-size:13px;border-radius:10px;padding:11px 13px;margin-bottom:13px;line-height:1.5;}
.banner.red{background:var(--red-soft);color:var(--red);border:1px solid #E8C7BF;}
.banner.amber{background:var(--amber-soft);color:var(--amber);border:1px solid #EAD8AC;}
.banner.info{background:var(--teal-soft);color:var(--teal);border:1px solid #C3E6D5;}
.su-list{display:flex;flex-direction:column;gap:8px;margin-top:8px;}
.su-item-row{display:flex;flex-direction:column;gap:5px;background:#fff;border:1px solid #EAD8AC;border-radius:8px;padding:8px 10px;}
.su-quote{font-size:12px;font-style:italic;}
.su-btns{display:flex;gap:5px;}
.su-btn{font-family:inherit;font-size:11px;font-weight:600;padding:3px 11px;border-radius:20px;border:1px solid #E0D6C0;background:#FCFBF7;color:var(--muted);cursor:pointer;transition:.14s;}
.su-btn:hover{background:#F3EFE5;}
.su-btn.on{background:var(--teal);color:#fff;border-color:var(--teal);}
.su-rerun{margin-top:10px;font-size:13px;padding:8px 14px;}
.report .sec:first-of-type{margin-top:2px;}
.sec{border-top:1px solid var(--line);padding-top:15px;margin-top:15px;}
.sec:first-child{border-top:none;padding-top:0;margin-top:0;}
.sec-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.sec-h h3{font-family:'Frank Ruhl Libre',serif;font-size:17px;font-weight:700;}
.note{font-size:13px;color:var(--ink);margin-top:8px;}
.muted{color:var(--muted);font-size:13px;}
.ev{font-size:12px;color:var(--muted);margin-top:5px;font-style:italic;}
.src{font-size:10px;background:#EFEADF;color:var(--muted);padding:1px 7px;border-radius:20px;font-style:normal;margin-inline-start:4px;}
.vak{display:flex;flex-direction:column;gap:8px;}
.vak-row{display:grid;grid-template-columns:110px 1fr 32px;align-items:center;gap:9px;}
.vak-lbl{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:500;}
.bar{background:#EFEADF;height:9px;border-radius:6px;overflow:hidden;}
.bar-fill{height:100%;background:linear-gradient(90deg,var(--teal2),var(--teal));border-radius:6px;transition:width .5s;}
.vak-num{font-size:12px;font-weight:700;color:var(--teal);text-align:left;}
.pill{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:#EFEADF;color:var(--muted);}
.pill.teal{background:var(--teal-soft);color:var(--teal);}
.pill.amber{background:var(--amber-soft);color:var(--amber);}
.pill.light{background:#F3EFE5;color:var(--muted);font-weight:500;}
.pill.mini{font-size:9px;padding:1px 6px;margin-inline-start:6px;}
.ul{padding-inline-start:18px;font-size:13px;margin-top:6px;}
.ul li{margin-bottom:3px;}
.mm{background:#FCFBF7;border:1px solid var(--line);border-radius:10px;padding:11px 12px;margin-bottom:9px;}
.mm-q{font-size:13px;font-style:italic;}
.mm-tags{display:flex;gap:6px;margin:7px 0;}
.mm-ch{font-size:13px;}
.belief{display:flex;gap:10px;align-items:flex-start;margin-bottom:9px;}
.belief-lbl{font-size:11px;font-weight:700;color:var(--muted);min-width:84px;padding-top:4px;}
.chips{display:flex;flex-wrap:wrap;gap:6px;}
.chip{font-size:12px;padding:4px 11px;border-radius:8px;}
.chip.teal{background:var(--teal-soft);color:var(--teal);}
.chip.amber{background:var(--amber-soft);color:var(--amber);}
.chip.green{background:#E7F1E4;color:#3F6B36;}
.tech{background:#FCFBF7;border:1px solid var(--line);border-radius:11px;padding:12px 13px;margin-bottom:10px;}
.tech-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.rank{width:22px;height:22px;border-radius:50%;background:var(--teal);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;}
.tech-name{font-family:'Frank Ruhl Libre',serif;font-size:15px;font-weight:700;}
.tech-r{font-size:13px;margin-top:7px;}
.tech-o{font-size:12px;color:var(--muted);margin-top:4px;}
.qn{margin-top:10px;border-top:1px dashed var(--line);padding-top:9px;}
.qn-toggle{display:flex;align-items:center;gap:7px;width:100%;font-family:inherit;font-size:12px;font-weight:700;color:var(--teal);background:none;border:none;cursor:pointer;padding:2px 0;}
.qn-toggle span:nth-child(2){flex:1;text-align:start;}
.qn-chev{transition:transform .2s;font-size:11px;}
.qn-chev.open{transform:rotate(180deg);}
.qn-body{margin-top:9px;background:#FCFBF7;border:1px solid var(--line);border-radius:9px;padding:11px 12px;}
.qn-note{font-size:10px;color:var(--muted);background:#EFEADF;border-radius:5px;padding:3px 7px;display:inline-block;margin-bottom:8px;}
.qn-intro{font-size:12px;color:var(--ink);margin-bottom:2px;}
.qn-legend{font-size:11px;color:var(--muted);font-style:italic;margin:7px 0;padding:5px 8px;background:#F3EFE5;border-radius:6px;}
.qn-sec{margin-top:9px;}
.qn-sec h5{font-family:'Frank Ruhl Libre',serif;font-size:13px;color:var(--teal);margin-bottom:4px;}
.qn-sec ul{padding-inline-start:18px;font-size:12.5px;line-height:1.7;}
.qn-sec li{margin-bottom:3px;}
.qn-copy{margin-top:12px;}
.plan{list-style:none;counter-reset:p;padding:0;}
.plan li{counter-increment:p;display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:9px 0;border-bottom:1px dashed var(--line);}
.plan li:last-child{border-bottom:none;}
.plan li::before{content:counter(p);width:20px;height:20px;border-radius:6px;background:var(--teal-soft);color:var(--teal);font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;margin-inline-end:9px;}
.plan li>span:first-child{flex:1;display:flex;align-items:center;}
.dur{font-size:11px;color:var(--muted);white-space:nowrap;}
.script-meta{display:flex;gap:7px;margin-bottom:16px;}
.script-step{display:flex;gap:12px;margin-bottom:14px;}
.script-num{width:26px;height:26px;flex-shrink:0;border-radius:8px;background:var(--teal);color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;}
.script-body h4{font-family:'Frank Ruhl Libre',serif;font-size:15px;color:var(--teal);margin-bottom:3px;}
.script-body p{font-size:14px;line-height:1.75;white-space:pre-wrap;}
.rat{font-size:12.5px;margin-bottom:6px;color:var(--ink);}
.ftr{max-width:780px;margin:20px auto 0;font-size:11px;color:var(--muted);text-align:center;line-height:1.6;}
@media(max-width:560px){.grid2{grid-template-columns:1fr;}.vak-row{grid-template-columns:96px 1fr 28px;}}
`;

export default CSS;
