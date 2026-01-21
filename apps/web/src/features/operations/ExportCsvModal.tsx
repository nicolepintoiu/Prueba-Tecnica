import React, { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import type { Contact } from "../../types";

function toIsoDateOnly(d: string) {
  // input type="date" ya viene YYYY-MM-DD
  return d;
}

export function ExportCsvModal({
  open,
  contact,
  onClose,
  onExport,
}: {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onExport: (contactId: string, params: { from?: string; to?: string }) => Promise<void>;
}) {
  const [fromStart, setFromStart] = useState(true);
  const [toNow, setToNow] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setFromStart(true);
    setToNow(true);
    setFrom("");
    setTo("");
  }, [contact?.id, open]);

  const params = useMemo(() => {
    return {
      from: fromStart ? undefined : (from ? toIsoDateOnly(from) : undefined),
      to: toNow ? undefined : (to ? toIsoDateOnly(to) : undefined),
    };
  }, [fromStart, toNow, from, to]);

  async function submit() {
    if (!contact) return;
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
          <Button disabled={!contact || loading} onClick={submit}>
            {loading ? "Exportando..." : "Exportar CSV"}
          </Button>
        </div>
      }
    >
      <div className="stack">
        <label className="check">
          <input type="checkbox" checked={fromStart} onChange={(e) => setFromStart(e.target.checked)} />
          <span>Desde el inicio</span>
        </label>

        {!fromStart && (
          <label className="field">
            <span className="label">Fecha inicio</span>
            <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
        )}

        <label className="check">
          <input type="checkbox" checked={toNow} onChange={(e) => setToNow(e.target.checked)} />
          <span>Hasta hoy</span>
        </label>

        {!toNow && (
          <label className="field">
            <span className="label">Fecha fin</span>
            <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        )}

        <div className="note">Arreglar luego fecha/hora exacta.</div>
      </div>
    </Modal>
  );
}