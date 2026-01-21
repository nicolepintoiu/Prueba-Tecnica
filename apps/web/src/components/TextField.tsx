import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, className = "", ...props }: Props) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <input className={`input ${className}`} {...props} />
      {hint ? <span className="hint">{hint}</span> : null}
    </label>
  );
}