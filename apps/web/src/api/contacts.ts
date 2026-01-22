import { api } from "./client";
import type { Contact } from "../types"; //TypeScript que describe como luce un contacto, id, name, email,etc

export const ContactsApi = {

  // Trae la lista completa de contactos
  list: () => api<Contact[]>("/api/contacts"),

  //traer un contacto por ID
  get: (id: string) => api<Contact>(`/api/contacts/${id}`),

  //Crea un contacto nuevo en el body
  create: (payload: { name: string; email: string }) =>
    api<Contact>("/api/contacts", {
      method: "POST",
      body: JSON.stringify(payload), // convierte el objeto a JSON para enviarlo
    }),

  //actualiza solo el nombre del contacto
  updateName: (id: string, payload: { name: string }) =>
    api<Contact>(`/api/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};