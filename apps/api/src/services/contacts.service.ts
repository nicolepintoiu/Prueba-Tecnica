import { prisma } from "../prisma";

export async function createContact(email: string, name: string) {
  if (!email || !name) throw new Error("Error de validacion");
  return prisma.contact.create({
    data: { email, name }, // balance queda en 0 por default
  });
}

export async function listContacts() {
  return prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getContactById(id: string) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) throw new Error("Contacto no encontrado");
  return contact;
}

export async function updateContactName(id: string, name: string) {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Error de validacion");
  }   

  const exists = await prisma.contact.findUnique({ where: { id }, select: { id: true } }); //busca que el contacto exista por el id
  if (!exists) throw new Error("Contacto no encontrado");

  return prisma.contact.update({
    where: { id },
    data: { name }, 
  });
}

