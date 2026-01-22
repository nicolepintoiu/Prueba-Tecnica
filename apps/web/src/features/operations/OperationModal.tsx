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
  onCreate: (contactId: string, payload: { type: OperationType; amount: number }) => Promise<void>; //crea la operacion llama al backend
}) {
  
  // Estado del tipo de operación: "add" = ingreso, "sub" = retiro
  const [type, setType] = useState<OperationType>("add");
  // Estado del monto como string porque viene de un input
  const [amount, setAmount] = useState<string>("0");
  // Estado para desactivar botón y mostrar "Procesando"
  const [saving, setSaving] = useState(false);

  // Reset del form cuando abres modal o cambias de contacto
  React.useEffect(() => {
    if (!open) return;
    setType("add");
    setAmount("0");
  }, [contact?.id, open]);

  // Convertimos el string del input a número
  const amt = useMemo(() => Number(amount), [amount]);

  //Balance actual como número 
  const currentBalance = useMemo(() => Number(contact?.balance ?? 0), [contact?.balance]);

  // Validacion, si es retiro y el monto es mayor al balance, el saldo quedaría negativo
  const wouldBeNegative = useMemo(() => {
    if (!contact) return false;
    if (!Number.isFinite(amt) || amt <= 0) return false;
    return type === "sub" && amt > currentBalance; //retiro mayor al balance invalido
  }, [contact, amt, type, currentBalance]);

  //define si se puede ejecutar, debe haber un contacto,amt debe ser mayor que 0 y un numero valido y no exceder el balance si es retiro
  const canSave = useMemo(() => {
    return !!contact && Number.isFinite(amt) && amt > 0 && !wouldBeNegative;
  }, [contact, amt, wouldBeNegative]);

  //handler del boton ejecutar
  async function submit() {

    if (!contact) return;
    if (!canSave) return;

    setSaving(true);
    try {
      await onCreate(contact.id, { type, amount: amt }); //handler, crear la operacion en el backend
      onClose();
    } finally {
      setSaving(false);
    }
  }
  // Calcula el "balance estimado" solo para mostrar en pantalla (no guarda nada)
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