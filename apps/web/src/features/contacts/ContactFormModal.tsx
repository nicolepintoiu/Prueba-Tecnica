//Modal para crear un nuevo contacto nombre + email y llamar al backend mediante onCreate

import React, { useMemo, useState } from "react"; //
import { Modal } from "../../components/Modal";
import { TextField } from "../../components/TextField";
import { Button } from "../../components/Button";

export function ContactFormModal({
  open, //true se muestra el modal
  onClose, //se cierra
  onCreate, //crea el contacto
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; email: string }) => Promise<void>;
}) {
  const [name, setName] = useState(""); //formulario, lo que el usuario escribe
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false); //bloquea el boton mientras se esta guardando
  const canSave = useMemo(() => name.trim().length >= 2 && email.includes("@"), [name, email]); //validcion minima

  async function submit() { //se ejecuta al presionar crear
    if (!canSave) return;
    setSaving(true); //activamos el estado de guardando
    try {
      await onCreate({ name: name.trim(), email: email.trim() });
      setName("");
      setEmail(""); //si se creo bien se cierra el modal y se limpia el input
      onClose();
    } finally {
      setSaving(false); //se quita el estado guardando
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