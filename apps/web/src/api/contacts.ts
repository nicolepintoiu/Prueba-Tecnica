import { api } from "./client";
import type { Contact } from "../types";

export const ContactsApi = {
  list: () => api<Contact[]>("/api/contacts"),

  get: (id: string) => api<Contact>(`/api/contacts/${id}`),

  create: (payload: { name: string; email: string }) =>
    api<Contact>("/api/contacts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateName: (id: string, payload: { name: string }) =>
    api<Contact>(`/api/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};