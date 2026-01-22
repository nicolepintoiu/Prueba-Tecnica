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
  onSave: (id: string, name: string) => Promise<void>; //funcion para guardar el nuevo nombre
}) {
  const [name, setName] = useState(contact?.name ?? ""); //name es lo que hay escrito en el input, y setName lo actualiza cuando el usuario escribe
  const [saving, setSaving] = useState(false); //bloquea botones mientras se guarda

  //Cuando cambia el contacto seleccionado, se sincroniza el estado name con el nombre del nuevo contacto
  React.useEffect(() => {
    setName(contact?.name ?? ""); 
  }, [contact?.id]);

  //validacion para habilitar el boton actualizar
  const canSave = useMemo(() => !!contact && name.trim().length >= 2 && name.trim() !== contact.name, [contact, name]);

  //funcion cuando haces click en actualizar
  async function submit() {
    if (!contact || !canSave) return;
    setSaving(true);
    try {
      await onSave(contact.id, name.trim()); //guarda el cambio. Trim sirve para quitar los espacios en blanco al inicio y al final del texto
      onClose(); //se cierra el modal cuando se termina de guardar
    } finally { 
      setSaving(false); //se quita el guardando
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