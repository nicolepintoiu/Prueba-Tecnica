import { api } from "./client";
import type { Operation } from "../types";

export const OperationsApi = {
  listByContact: (contactId: string) =>
    api<Operation[]>(`/api/contacts/${contactId}/operations`),

  create: (
    contactId: string,
    payload: { type: "add" | "sub"; amount: number }
  ) =>
    api<Operation>(`/api/contacts/${contactId}/operations`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

exportCsv: async (contactId: string, params: { from?: string; to?: string } = {}) => {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);

  const url = `/api/contacts/${contactId}/operations/export${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;

  window.location.href = url;
},

  exportAllCsv: (params: { from?: string; to?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);

    const url = `/api/operations/export${qs.toString() ? `?${qs.toString()}` : ""}`;
    window.location.href = url;
  },
};