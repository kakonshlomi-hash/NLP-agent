import React from "react";

export default function Field({ label, value, onChange }) {
  return (
    <div className="field">
      <label className="lbl">{label}</label>
      <input className="inp" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
