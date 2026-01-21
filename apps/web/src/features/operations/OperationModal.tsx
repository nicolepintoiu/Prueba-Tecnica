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

  React.useEffect(() => {
    setType("add");
    setAmount("0");
  }, [contact?.id, open]);

  const amt = useMemo(() => Number(amount), [amount]);
  const canSave = useMemo(() => !!contact && Number.isFinite(amt) && amt > 0, [contact, amt]);

  async function submit() {
    if (!contact || !canSave) return;
    setSaving(true);
    try {
      await onCreate(contact.id, { type, amount: amt });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const projected =
  contact
    ? type === "add"
      ? contact.balance + (Number.isFinite(amt) ? amt : 0)
      : contact.balance - (Number.isFinite(amt) ? amt : 0)
    : 0;

  return (
    <Modal
      open={open}
      title={`Nueva operación — ${contact?.name ?? ""}`}
      onClose={onClose}
      width={560}
      footer={
        <div className="rowEnd">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSave || saving} onClick={submit}>
            {saving ? "Procesando..." : "Ejecutar"}
          </Button>
        </div>
      }
    >
      <div className="kpiRow">
        <div className="kpi">
          <div className="kpiLabel">Balance actual</div>
          <div className="kpiValue">${contact?.balance?.toFixed(2) ?? "0.00"}</div>
        </div>
        <div className="kpi">
          <div className="kpiLabel">Balance estimado</div>
          <div className="kpiValue">${projected.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid2">
        <label className="field">
          <span className="label">Tipo</span>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as OperationType)}>
            <option value="INCOME">Ingreso (+)</option>
            <option value="WITHDRAWAL">Retiro (-)</option>
          </select>
        </label>

        <label className="field">
          <span className="label">Monto</span>
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
          <span className="hint">Debe ser mayor que 0</span>
        </label>
      </div>

      <div className="note">Si el backend valida saldo/consistencia, aquí solo mostramos estimación.</div>
    </Modal>
  );
}