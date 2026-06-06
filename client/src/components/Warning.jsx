import React from "react";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";

export default function Warning({ level, text }) {
  const icon =
    level === "red" ? <ShieldAlert size={16} /> :
    level === "amber" ? <AlertTriangle size={16} /> :
    <Info size={16} />;
  return (
    <div className={"banner " + level}>
      {icon}
      <span>{text}</span>
    </div>
  );
}
