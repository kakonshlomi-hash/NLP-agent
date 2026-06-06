import React from "react";

export default function BeliefRow({ label, items, tone }) {
  if (!items || !items.length) return null;
  return (
    <div className="belief">
      <span className="belief-lbl">{label}</span>
      <div className="chips">
        {items.map((it, i) => (
          <span key={i} className={"chip " + tone}>{it}</span>
        ))}
      </div>
    </div>
  );
}
