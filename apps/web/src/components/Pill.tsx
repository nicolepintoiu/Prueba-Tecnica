import React from "react";

export function Pill({ kind, children }: { kind: "green" | "red" | "gray"; children: React.ReactNode }) {
  return <span className={`pill ${kind}`}>{children}</span>;
}