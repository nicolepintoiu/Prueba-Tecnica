import { prisma } from "../prisma";

export async function createOperation(contactId: string, amount: number) {
  if (!Number.isFinite(amount)) throw new Error("INVALID AMOUNT");

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { id: true },
  });

  if (!contact) throw new Error("CONTACT NOT FOUND");

  return prisma.operation.create({
    data: {
      contactId,
      amount, 
    },
  });
}

export async function listOperations(contactId: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { id: true },
  });

  if (!contact) throw new Error("CONTACT NOT FOUND");

  return prisma.operation.findMany({
    where: { contactId },
    orderBy: { createdAt: "desc" },
  });
}

