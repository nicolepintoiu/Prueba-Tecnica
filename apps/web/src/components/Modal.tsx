import React from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void; //para cerrar el modal
  children: React.ReactNode; //contenido del modal 
  footer?: React.ReactNode; //botones, cancelar, guardar
  width?: number; //ancho del modal
  zIndex?: number; //aseguras que el modal quede por encima de todo
};

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = 720,
  zIndex = 1000,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div
      className="overlay" //fondo semi transparente
      style={{ zIndex }} //asegura que el overley este encima del resto
      onMouseDown={onClose} //cierra si haaces click fuera del modal 
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal"
        style={{ width, zIndex: zIndex + 1 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h3>{title}</h3>
          <button className="x" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="modalBody">{children}</div>

        {footer ? <div className="modalFooter">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}