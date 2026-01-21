import React, { useMemo } from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import type { Contact, Operation } from "../../types";
import { Pill } from "../../components/Pill";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export function ProfileModal({
  open,
  contact,
  operations,
  loading,
  onClose,
  onEdit,
  onNewOp,
  onExport,
}: {
  open: boolean;
  contact: Contact | null;
  operations: Operation[];
  loading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onNewOp: () => void;
  onExport: () => void;
}) {
  const stats = useMemo(() => {
    const totalOps = operations.length;
    const income = operations
      .filter((o) => o.type === "add")
      .reduce((a, b) => a + b.amount, 0);

    const withdraw = operations
      .filter((o) => o.type === "sub")
      .reduce((a, b) => a + b.amount, 0);

    return { totalOps, income, withdraw };
  }, [operations]);

  return (
    <Modal
      open={open}
      title={`Perfil — ${contact?.name ?? ""}`}
      onClose={onClose}
      width={900}
      footer={
        <div className="rowBetween">
          <div className="muted">{loading ? "Cargando operaciones..." : ""}</div>
          <div className="rowEnd">
            <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      }
    >
      {!contact ? (
        <div className="muted">No hay contacto seleccionado.</div>
      ) : (
        <>
          <div className="profileGrid">
            <div className="card">
              <div className="cardTitle">Datos</div>
              <div className="twoCol">
                <div>
                  <div className="mutedSmall">Nombre</div>
                  <div className="strong">{contact.name}</div>
                </div>
                <div>
                  <div className="mutedSmall">Email</div>
                  <div className="strong">{contact.email}</div>
                </div>
                <div>
                  <div className="mutedSmall">Balance</div>
                  <div className="strong">${Number(contact.balance ?? 0).toFixed(2)}</div>
                </div>
                <div>
                  <div className="mutedSmall">Miembro desde</div>
                  <div className="strong">{fmtDate(contact.createdAt)}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="cardTitle">Resumen</div>
              <div className="kpiRow">
                <div className="kpi">
                  <div className="kpiLabel">Operaciones</div>
                  <div className="kpiValue">{stats.totalOps}</div>
                </div>
                <div className="kpi">
                  <div className="kpiLabel">Ingresos</div>
                  <div className="kpiValue green">+${stats.income.toFixed(2)}</div>
                </div>
                <div className="kpi">
                  <div className="kpiLabel">Retiros</div>
                  <div className="kpiValue red">-${stats.withdraw.toFixed(2)}</div>
                </div>
              </div>

              <div className="rowEnd gap">
                <Button variant="ghost" onClick={onEdit}>Editar</Button>
                <Button onClick={onNewOp}>Nueva operación</Button>
                <Button variant="ghost" onClick={onExport}>Exportar CSV</Button>
              </div>
            </div>
          </div>

          <div className="spacer" />

          <div className="card">
            <div className="cardTitle">Historial de operaciones</div>
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th className="right">Monto</th>
                    <th className="right">Balance posterior</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="muted">Cargando...</td></tr>
                  ) : operations.length === 0 ? (
                    <tr><td colSpan={4} className="muted">Sin operaciones</td></tr>
                  ) : (
                    operations.map((op) => {
                      const isIn = op.type === "add";
                      return (
                        <tr key={op.id}>
                          <td>{new Date(op.createdAt).toLocaleString()}</td>
                          <td>
                            {isIn ? <Pill kind="green">Ingreso</Pill> : <Pill kind="red">Retiro</Pill>}
                          </td>
                          <td className="right">
                            {isIn ? `+$${op.amount.toFixed(2)}` : `-$${op.amount.toFixed(2)}`}
                          </td>
                          <td className="right">-</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}