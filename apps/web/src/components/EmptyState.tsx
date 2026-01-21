import React from "react";

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="empty">
      <div className="emptyIcon">📭</div>
      <div className="emptyTitle">{title}</div>
      {subtitle ? <div className="emptySub">{subtitle}</div> : null}
    </div>
  );
}