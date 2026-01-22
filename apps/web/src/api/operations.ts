import type { Contact, Operation } from "../types"; //TypeScript que describe como luce un contacto, id, name, email,etc y una operacion

export const OperationsApi = {
    //listar operaciones de un contacto
    async listByContact(contactId: string): Promise<Operation[]> {
        const res = await fetch(`/api/contacts/${contactId}/operations`); //llamada al backend para traer las operaciones del contacto
        if (!res.ok) throw new Error("Error listByContact"); //por si el backend lanza error
    
        const json = await res.json(); //covierte en json la respuesta
    
        //extraemos el array de operaciones
        const ops = (json?.operations ?? []) as any[];
    
        //arreglo de cada operacion para que el front no se rompa
        return ops.map((op) => ({
          ...op, //trae todas las propiedades que ya tiene operacion
          amount: Number(op.amount),
          balanceAfter: op.balanceAfter == null ? null : Number(op.balanceAfter),
          type: op.type ?? (Number(op.amount) >= 0 ? "add" : "sub"),
        })) as Operation[];
      },
    
    //operacion de ingrero y retiro
    async create(
    contactId: string,
    payload: { type: "add" | "sub"; amount: number }
    ): Promise<{ ok: true; operation: Operation; contact: Contact }> {
    const res = await fetch(`/api/contacts/${contactId}/operations`, { //llama al backend para crear una operacion nueva en el contacto
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), //pasar el objeto a json
    });

    //Error si hay saldo insuficiente, no existe el contacto, etc 
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Error create operation");

    return json; //si todo esta bien devuelve lo que mando el backend
    },

    exportCsv(
        contactId: string,
        params: { startUndefined: boolean; endNow: boolean; startDate?: string; endDate?: string }
      ) {
        const qs = new URLSearchParams(); //crear una especia de constructor de query paramspara armar el URL
      
        //Agrega o reemplaza el parámetro startUndefined en la URL.
       // Como la URL solo maneja texto, convertir el boolean a string

        qs.set("startUndefined", String(params.startUndefined));
        qs.set("endNow", String(params.endNow));
      
        //si no es desde el inicio mando startDate, lo mismo paso con el final
        if (!params.startUndefined && params.startDate) qs.set("startDate", params.startDate);
        if (!params.endNow && params.endDate) qs.set("endDate", params.endDate);
      
        const url = `/api/contacts/${contactId}/operations/export?${qs.toString()}`;
        window.location.assign(url); //el navegador abre la URL y el backend responde con un archivo descargable
      },
      
    exportAllCsv(
        params: { startUndefined: boolean; endNow: boolean; startDate?: string; endDate?: string } = {
          startUndefined: true,
          endNow: true,
        }
      ) {
        const qs = new URLSearchParams();
    
        qs.set("startUndefined", String(params.startUndefined));
        qs.set("endNow", String(params.endNow));
    
        if (!params.startUndefined && params.startDate) qs.set("startDate", params.startDate);
        if (!params.endNow && params.endDate) qs.set("endDate", params.endDate);
    
        const url = `/api/operations/export?${qs.toString()}`;
        window.location.assign(url);
      },
    };
