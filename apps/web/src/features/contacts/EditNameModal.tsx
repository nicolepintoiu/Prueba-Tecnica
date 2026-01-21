import React, { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";
import type { Contact } from "../../types";

export function EditNameModal({
  open,
  contact,
  onClose,
  onSave,
}: {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSave: (id: string, name: string) => Promise<void>;
}) {
  const [name, setName] = useState(contact?.name ?? "");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setName(contact?.name ?? "");
  }, [contact?.id]);

  const canSave = useMemo(() => !!contact && name.trim().length >= 2 && name.trim() !== contact.name, [contact, name]);

  async function submit() {
    if (!contact || !canSave) return;
    setSaving(true);
    try {
      await onSave(contact.id, name.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Editar nombre"
      onClose={onClose}
      width={560}
      footer={
        <div className="rowEnd">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSave || saving} onClick={submit}>
            {saving ? "Guardando..." : "Actualizar"}
          </Button>
        </div>
      }
    >
      <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
      
    </Modal>
  );
}