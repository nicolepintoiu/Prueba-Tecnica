import React from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { Pill } from "../../components/Pill";
import type { Contact, Operation } from "../../types";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function HistoryModal({
  open,
  contact,
  operations,
  loading,
  onClose,
}: {
  open: boolean;
  contact: Contact | null;
  operations: Operation[];
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      title={`Historial — ${contact?.name ?? ""}`}
      onClose={onClose}
      width={760}
      footer={
        <div className="rowEnd">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      }
    >
      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th className="right">Monto</th>
              <th className="right">Balance posterior</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="muted">Cargando...</td></tr>
            ) : operations.length === 0 ? (
              <tr><td colSpan={4} className="muted">Sin operaciones</td></tr>
            ) : (
              operations.map((op) => {
                const isIn = op.type === "add";
                console.log(op);
                return (
                    <tr key={op.id}>
                    <td>{fmtDate(op.createdAt)}</td>
                    <td>
                        {isIn ? <Pill kind="green">Ingreso</Pill> : <Pill kind="red">Retiro</Pill>}
                    </td>
                    <td className="right">
                        {isIn ? `+$${op.amount.toFixed(2)}` : `-$${op.amount.toFixed(2)}`}
                    </td>
                    <td className="right">
                        {typeof op.balanceAfter === "number" ? `$${op.balanceAfter.toFixed(2)}` : "-"}
                    </td>
                    </tr>
                );
                })
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}