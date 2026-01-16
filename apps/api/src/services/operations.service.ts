import { prisma } from "../prisma";

export async function createOperation(contactId: string, amount: number) {
  if (!Number.isFinite(amount)) throw new Error("INVALID AMOUNT");

  const contact = await prisma.contact.findUnique({ //busca si existe el contacto con ese id
    where: { id: contactId },
    select: { id: true },
  });

  if (!contact) throw new Error("CONTACT NOT FOUND");

  return prisma.operation.create({  //crea la operación en la tabla Operation
    data: {
      contactId,   
      amount, 
    },
  });
}

export async function listOperations(contactId: string) {
  const contact = await prisma.contact.findUnique({   //valida que el contacto exista
    where: { id: contactId },        
    select: { id: true },
  });

  if (!contact) throw new Error("CONTACT NOT FOUND");

  return prisma.operation.findMany({   //busca todas las operaciones donde contactId sea el indicado
    where: { contactId },
    orderBy: { createdAt: "desc" }, //las ordena de la más reciente a la más vieja
  });
}

