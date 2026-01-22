import React, { useMemo, useState } from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import type { Contact } from "../../types";

export type ExportParams = { //parametros que el modal va a constuir y mandar al backend
  startUndefined: boolean; //true = desde el inicio (sin startDate)
  endNow: boolean; // true = hasta hoy (sin endDate)
  startDate?: string; // YYYY-MM-DD (solo si NO es desde inicio)
  endDate?: string;   // YYYY-MM-DD (solo si NO es hasta hoy)
};

export function ExportCsvModal({
  open,
  contact,
  onClose,
  onExport,
}: {
  open: boolean;
  contact: Contact | null; //contacto al que se le va a exportar el csv
  onClose: () => void;
  onExport: (contactId: string, params: ExportParams) => Promise<void>; //funcion que ejecuta la exportacion
}) {

  //Estados del formulario dentro del modal
  const [fromStart, setFromStart] = useState(true); // checkbox "Desde el inicio"
  const [toNow, setToNow] = useState(true); //checkbox "Hasta hoy"
  const [from, setFrom] = useState(""); // input date de inicio (YYYY-MM-DD)
  const [to, setTo] = useState(""); //input date de fin (YYYY-MM-DD)
  const [loading, setLoading] = useState(false); //muestra exportando y deshabilita el boton

  //reanicia el formulario para que arranque limpio
  React.useEffect(() => {
    if (!open) return;
    setFromStart(true); //por defecto exportar desde el inicio
    setToNow(true);  //por defecto exportar desde el final
    setFrom(""); //borra la fecha de inicio escrita
    setTo(""); //borra la fecha fin escrita
  }, [contact?.id, open]); //se ejecuta cuando cambia el contacto o cuando se abre o cierra el modal

  //se arma el objeto que el backend que espera recibir
  // useMemo es solo para no reconstruir este objeto si no cambian los valores del form
  const params = useMemo<ExportParams>(() => {
    return {
      startUndefined: fromStart,
      endNow: toNow,
      startDate: fromStart ? undefined : (from || undefined), //Si no es "desde el inicio", entonces usamos la fecha que el usuario escribió
      endDate: toNow ? undefined : (to || undefined), //lo mismo pasa aca
    };
  }, [fromStart, toNow, from, to]);

  //validacion para exportar el csv
  const canExport = useMemo(() => {
    if (!contact) return false;

    // Si NO es "desde inicio", debe haber startDate
    if (!params.startUndefined && !params.startDate) return false;

    // Si NO es "hasta hoy", debe haber endDate
    if (!params.endNow && !params.endDate) return false;

    // Validación simple rango de YYYY-MM-DD. 
    if (params.startDate && params.endDate && params.startDate > params.endDate) return false;

    return true;
  }, [contact, params]);

  //funcion para exportar el csv
  async function submit() {
    if (!contact || !canExport) return;
    setLoading(true); //bloquea el boton y muestra exportando
    try {
      await onExport(contact.id, params); //el onExport lo que hace es: construir la URL con los query params y hacer window.location.assign(url) para descargar el CSV
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
            checked={fromStart} //controla si aparece marcado (true) o no (false)
            // onChange se dispara cuando el usuario marca o desmarca
            // e.target.checked trae el nuevo valor booleano (true o false)
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
              onChange={(e) => setFrom(e.target.value)} // cuando el usuario elige una fecha, guardamos el texto en from
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