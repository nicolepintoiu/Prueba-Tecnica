import React, { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";

export function ContactFormModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; email: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const canSave = useMemo(() => name.trim().length >= 2 && email.includes("@"), [name, email]);

  async function submit() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onCreate({ name: name.trim(), email: email.trim() });
      setName("");
      setEmail("");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Nuevo contacto"
      onClose={onClose}
      width={560}
      footer={
        <div className="rowEnd">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSave || saving} onClick={submit}>
            {saving ? "Creando..." : "Crear"}
          </Button>
        </div>
      }
    >
      <div className="grid2">
        <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Nicole Pinto" />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ej: nicole@email.com" />
      </div>
      <div className="note">El balance inicial será <b>$0.00</b></div>
    </Modal>
  );
}