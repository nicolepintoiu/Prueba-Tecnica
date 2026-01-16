import { prisma } from "../prisma";

export async function createContact(email: string, name: string) { //async porque hace una operación a la BD
  return prisma.contact.create({ //crea un registro en la tabla Contact
    data: { email, name }, //datos que se guardan
  });
}

export async function listContacts() { //busca todos los contactos
  return prisma.contact.findMany(); //si no hay devuelve []
}

