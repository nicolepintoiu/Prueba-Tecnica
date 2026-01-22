import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { //el props contienen todo lo que acepta un input normal, value, disabled, etc
  label: string; //texto que se muestra encima del input, por ejemplo: nombre
  hint?: string; //texto que se muestra abajo, ejemplo: tiene que ser >0
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

//      <input className={`input ${className}`} {...props} /> ---> props guarda todo lo que no sea label/hint/className y luego lo reenvía al <input> automáticamente
