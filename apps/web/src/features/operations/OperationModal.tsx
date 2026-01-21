import React, { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import type { Contact, OperationType } from "../../types";

export function OperationModal({
  open,
  contact,
  onClose,
  onCreate,
}: {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onCreate: (contactId: string, payload: { type: OperationType; amount: number }) => Promise<void>;
}) {
  
  const [type, setType] = useState<OperationType>("add");
  const [amount, setAmount] = useState<string>("0");
  const [saving, setSaving] = useState(false);

  // Reset cuando abres modal o cambias de contacto
  React.useEffect(() => {
    if (!open) return;
    setType("add");
    setAmount("0");
  }, [contact?.id, open]);

  const amt = useMemo(() => Number(amount), [amount]);

  // Balance numérico
  const currentBalance = useMemo(() => Number(contact?.balance ?? 0), [contact?.balance]);


  const wouldBeNegative = useMemo(() => {
    if (!contact) return false;
    if (!Number.isFinite(amt) || amt <= 0) return false;
    return type === "sub" && amt > currentBalance;
  }, [contact, amt, type, currentBalance]);


  const canSave = useMemo(() => {
    return !!contact && Number.isFinite(amt) && amt > 0 && !wouldBeNegative;
  }, [contact, amt, wouldBeNegative]);

  async function submit() {

    if (!contact) return;
    if (!canSave) return;

    setSaving(true);
    try {
      await onCreate(contact.id, { type, amount: amt });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const projected = useMemo(() => {
    if (!contact) return 0;
    const safeAmt = Number.isFinite(amt) ? amt : 0;
    return type === "add" ? currentBalance + safeAmt : currentBalance - safeAmt;
  }, [contact, type, currentBalance, amt]);

  // Guard clauses
  if (!open) return null;
  if (!contact) return null;

  return (
    <Modal
      open={open}
      title={`Nueva operación — ${contact.name}`}
      onClose={onClose}
      width={560}
      footer={
        <div className="rowEnd">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!canSave || saving} onClick={submit}>
            {saving ? "Procesando..." : "Ejecutar"}
          </Button>
        </div>
      }
    >
      <div className="kpiRow">
        <div className="kpi">
          <div className="kpiLabel">Balance actual</div>
          <div className="kpiValue">${currentBalance.toFixed(2)}</div>
        </div>

        <div className="kpi">
          <div className="kpiLabel">Balance estimado</div>
          <div className="kpiValue">
            ${projected.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid2">
        <label className="field">
          <span className="label">Tipo</span>
          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as OperationType)}
          >
            <option value="add">Ingreso (+)</option>
            <option value="sub">Retiro (-)</option>
          </select>
        </label>

        <label className="field">
          <span className="label">Monto</span>
          <input
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
          <span className="hint">Debe ser mayor que 0</span>
        </label>
      </div>

      {wouldBeNegative ? (
        <div className="note" style={{ marginTop: 10 }}>
          ⚠️ El retiro excede el balance disponible.
        </div>
      ) : (
        <div className="note" style={{ marginTop: 10 }}>
          El balance estimado es una referencia para visualizar en cuánto quedará el balance actual antes de realizar la operación.
        </div>
      )}
    </Modal>
  );
}