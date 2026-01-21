import React from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  zIndex?: number; 
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
      className="overlay"
      style={{ zIndex }}
      onMouseDown={onClose}
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