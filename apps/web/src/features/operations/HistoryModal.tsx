import React from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { Pill } from "../../components/Pill";
import type { Contact, Operation } from "../../types";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function toNum(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
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
  if (!open) return null;
  if (!contact) return null;

  return (
    <Modal
      open={open}
      title={`Historial — ${contact.name}`}
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
              <tr>
                <td colSpan={4} className="muted">Cargando...</td>
              </tr>
            ) : operations.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">Sin operaciones</td>
              </tr>
            ) : (
              operations.map((op: any) => {
                const amountNum = toNum(op.amount);

                const type = (op.type ?? (amountNum >= 0 ? "add" : "sub")) as "add" | "sub";
                const isIn = type === "add";

                const balanceAfterNum =
                  op.balanceAfter === null || op.balanceAfter === undefined
                    ? null
                    : toNum(op.balanceAfter);

                return (
                  <tr key={op.id}>
                    <td>{fmtDate(op.createdAt)}</td>
                    <td>
                      {isIn ? (
                        <Pill kind="green">Ingreso</Pill>
                      ) : (
                        <Pill kind="red">Retiro</Pill>
                      )}
                    </td>

                    <td className="right">
                      {isIn
                        ? `+$${Math.abs(amountNum).toFixed(2)}`
                        : `-$${Math.abs(amountNum).toFixed(2)}`}
                    </td>

                    <td className="right">
                      {balanceAfterNum === null ? "-" : `$${balanceAfterNum.toFixed(2)}`}
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