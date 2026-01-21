import React, { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import type { Contact } from "../../types";

export type ExportParams = {
  startUndefined: boolean;
  endNow: boolean;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
};

export function ExportCsvModal({
  open,
  contact,
  onClose,
  onExport,
}: {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onExport: (contactId: string, params: ExportParams) => Promise<void>;
}) {
  const [fromStart, setFromStart] = useState(true);
  const [toNow, setToNow] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    setFromStart(true);
    setToNow(true);
    setFrom("");
    setTo("");
  }, [contact?.id, open]);

  const params = useMemo<ExportParams>(() => {
    return {
      startUndefined: fromStart,
      endNow: toNow,
      startDate: fromStart ? undefined : (from || undefined),
      endDate: toNow ? undefined : (to || undefined),
    };
  }, [fromStart, toNow, from, to]);

  const canExport = useMemo(() => {
    if (!contact) return false;

    // Si NO es "desde inicio", debe haber startDate
    if (!params.startUndefined && !params.startDate) return false;

    // Si NO es "hasta hoy", debe haber endDate
    if (!params.endNow && !params.endDate) return false;

    // Validación simple rango (YYYY-MM-DD lexicográfico funciona)
    if (params.startDate && params.endDate && params.startDate > params.endDate) return false;

    return true;
  }, [contact, params]);

  async function submit() {
    if (!contact || !canExport) return;
    setLoading(true);
    try {
      await onExport(contact.id, params);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      title={`Exportar CSV — ${contact?.name ?? ""}`}
      onClose={onClose}
      width={560}
      footer={
        <div className="rowEnd">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canExport || loading} onClick={submit}>
            {loading ? "Exportando..." : "Exportar CSV"}
          </Button>
        </div>
      }
    >
      <div className="stack">
        <label className="check">
          <input
            type="checkbox"
            checked={fromStart}
            onChange={(e) => setFromStart(e.target.checked)}
          />
          <span>Desde el inicio</span>
        </label>

        {!fromStart && (
          <label className="field">
            <span className="label">Fecha inicio</span>
            <input
              className="input"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
        )}

        <label className="check">
          <input
            type="checkbox"
            checked={toNow}
            onChange={(e) => setToNow(e.target.checked)}
          />
          <span>Hasta hoy</span>
        </label>

        {!toNow && (
          <label className="field">
            <span className="label">Fecha fin</span>
            <input
              className="input"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        )}

        <div className="note">Se descargará un CSV con las operaciones según el rango seleccionado.</div>
      </div>
    </Modal>
  );
}