import { prisma } from "../prisma";

export async function createContact(email: string, name: string) {
  return prisma.contact.create({
    data: { email, name },
  });
}

export async function listContacts() {
  return prisma.contact.findMany();
}

