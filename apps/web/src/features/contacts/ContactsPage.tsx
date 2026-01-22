//pagina principal del fronted

import { useEffect, useMemo, useState } from "react";
import type { Contact, Operation } from "../../types";

//llaman al backend
import { ContactsApi } from "../../api/contacts";
import { OperationsApi } from "../../api/operations";

//componentes UI
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";

//modales
import { ContactFormModal } from "./ContactFormModal";
import { EditNameModal } from "./EditNameModal";
import { OperationModal } from "../operations/OperationModal";
import { HistoryModal } from "../operations/HistoryModal";
import { ExportCsvModal } from "../operations/ExportCsvModal";
import { ProfileModal } from "../operations/ProfileModal";

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]); //Lista de contactos que viene del backend
  const [loading, setLoading] = useState(true); //Loading de la lista de contactos
  const [q, setQ] = useState(""); //texto del buscador, q --> valor actual del buscador, setQ -->actualiza el texto del buscador en tiempo real

  //Cada boolean controla si el modal está abierto o cerrado
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openOp, setOpenOp] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  //Contacto seleccionado para operar/editar/ver historial/perfil/exportar
  const [selected, setSelected] = useState<Contact | null>(null);

  // Loading del historial de operaciones
  const [opsLoading, setOpsLoading] = useState(false);

  //operaciones el contacto seleccionado
  const [ops, setOps] = useState<Operation[]>([]);

  //Refresca la lista de contactos desde el backend
  async function refresh() {
    setLoading(true);
    try {
      const data = await ContactsApi.list();
      setContacts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  //filtrar contactos por nombre o email
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter((c) =>
      `${c.name} ${c.email}`.toLowerCase().includes(s)
    );
  }, [contacts, q]);

  //cargar operaciones de un contacto
  async function loadOperations(contactId: string) {
    setOpsLoading(true);
    try {
      const data = await OperationsApi.listByContact(contactId);
      // orden desc por fecha
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOps(data);
    } finally {
      setOpsLoading(false);
    }
  }

  //crear contacto
  async function handleCreate(payload: { name: string; email: string }) {
    await ContactsApi.create(payload);
    await refresh();
  }

  //editar nombre
  async function handleUpdateName(id: string, name: string) {
    await ContactsApi.updateName(id, { name });
    await refresh();
  }

  //crear operacion
  async function handleCreateOp(contactId: string, payload: { type: any; amount: number }) {
    await OperationsApi.create(contactId, payload);
    await refresh(); //Recargar lista de contactos para ver el balance actualizado

    // Actualiza el historial si se esta trabajando con el contacto seleccionado, para que el modal muestre la operacion recien crada 
    if (selected?.id === contactId) {
      await loadOperations(contactId);
    }
  }

  //abre el modal segun el boton
  function selectAndOpen(c: Contact, which: "edit" | "op" | "history" | "export" | "profile") {
    setSelected(c); //guardar el contacto seleccionado

    if (which === "edit") setOpenEdit(true);
    if (which === "op") setOpenOp(true);

    if (which === "history") {
      setOpenHistory(true);
      loadOperations(c.id);
    }

    if (which === "export") setOpenExport(true);

    if (which === "profile") {
      setOpenProfile(true);
      loadOperations(c.id);
    }
  }
  

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="title">Contactos</div>

        </div>

        <div className="topActions">
          <input
            className="search"
            placeholder="Buscar por nombre o email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          
          <Button
            variant="ghost"
            onClick={() => OperationsApi.exportAllCsv({ startUndefined: true, endNow: true })}
            >
            Exportar todas las operaciones (CSV)
          </Button>

          <Button onClick={() => setOpenCreate(true)}>+ Nuevo</Button>
        </div>
      </header>

      <div className="panel">
        {loading ? (
          <div className="muted">Cargando contactos...</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No hay contactos" subtitle="Crea uno nuevo para comenzar." />
        ) : (
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th className="right">Balance</th>
                  <th className="right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="strong">{c.name}</td>
                    <td className="mutedSmall">{c.email}</td>
                    <td className="right strong">${Number(c.balance ?? 0).toFixed(2)}</td>
                    <td className="right">
                      <div className="rowEnd gap">
                        <Button variant="ghost" onClick={() => selectAndOpen(c, "profile")}>Perfil</Button>
                        <Button variant="ghost" onClick={() => selectAndOpen(c, "edit")}>Editar</Button>
                        <Button variant="ghost" onClick={() => selectAndOpen(c, "op")}>Operación</Button>
                        <Button variant="ghost" onClick={() => selectAndOpen(c, "history")}>Historial</Button>
                        <Button variant="ghost" onClick={() => selectAndOpen(c, "export")}>Exportar</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ContactFormModal open={openCreate} onClose={() => setOpenCreate(false)} onCreate={handleCreate} />

      <EditNameModal
        open={openEdit}
        contact={selected}
        onClose={() => setOpenEdit(false)}
        onSave={handleUpdateName}
      />

      <OperationModal
        open={openOp}
        contact={selected}
        onClose={() => setOpenOp(false)}
        onCreate={handleCreateOp}
      />

      <HistoryModal
        open={openHistory}
        contact={selected}
        operations={ops}
        loading={opsLoading}
        onClose={() => setOpenHistory(false)}
      />

      <ExportCsvModal
        open={openExport}
        contact={selected}
        onClose={() => setOpenExport(false)}
        onExport={async (id, params) => {
            OperationsApi.exportCsv(id, params); 
        }}
      />

      <ProfileModal
        open={openProfile}
        contact={selected}
        operations={ops}
        loading={opsLoading}
        onClose={() => setOpenProfile(false)}
        onEdit={() => setOpenEdit(true)}
        onNewOp={() => setOpenOp(true)}
        onExport={() => setOpenExport(true)}
      />
    </div>
  );
}