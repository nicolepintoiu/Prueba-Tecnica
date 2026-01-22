import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { //todos los parametros del boton, pero agregando variant para escoger el estilo
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className = "", ...props }: Props) { //si no se llama a variant, se usa primary pot defecto y los props agarra todo lo demas (diable, Onclick, etc)
  return <button className={`btn ${variant} ${className}`} {...props} />; //devuelve el boton que se ve en pantalla con clase css armada
}