import React from "react";

export default function Section({ title, right, children }) {
  return (
    <div className="sec">
      <div className="sec-h">
        <h3>{title}</h3>
        {right}
      </div>
      <div className="sec-b">{children}</div>
    </div>
  );
}
