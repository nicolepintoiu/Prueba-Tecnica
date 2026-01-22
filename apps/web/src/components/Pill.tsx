import React from "react";

//sirve para pintar ingreso en verde y retiro en negro, info neutra en gris
export function Pill({ kind, children }: { kind: "green" | "red" | "gray"; children: React.ReactNode }) {
  return <span className={`pill ${kind}`}>{children}</span>; 
}

