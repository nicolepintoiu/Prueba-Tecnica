
import type { Contact, Operation } from "../types";

export const OperationsApi = {
    async listByContact(contactId: string): Promise<Operation[]> {
        const res = await fetch(`/api/contacts/${contactId}/operations`);
        if (!res.ok) throw new Error("Error listByContact");
    
        const json = await res.json();
    
        //backend devuelve { ok, contactId, operations }
        const ops = (json?.operations ?? []) as any[];
    
        return ops.map((op) => ({
          ...op,
          amount: Number(op.amount),
          balanceAfter: op.balanceAfter == null ? null : Number(op.balanceAfter),
          type: op.type ?? (Number(op.amount) >= 0 ? "add" : "sub"),
        })) as Operation[];
      },
    

    async create(
    contactId: string,
    payload: { type: "add" | "sub"; amount: number }
    ): Promise<{ ok: true; operation: Operation; contact: Contact }> {
    const res = await fetch(`/api/contacts/${contactId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Error create operation");

    return json;
    },

    exportCsv(
        contactId: string,
        params: { startUndefined: boolean; endNow: boolean; startDate?: string; endDate?: string }
      ) {
        const qs = new URLSearchParams();
      
        qs.set("startUndefined", String(params.startUndefined));
        qs.set("endNow", String(params.endNow));
      
        if (!params.startUndefined && params.startDate) qs.set("startDate", params.startDate);
        if (!params.endNow && params.endDate) qs.set("endDate", params.endDate);
      
        const url = `/api/contacts/${contactId}/operations/export?${qs.toString()}`;
        window.location.assign(url);
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
