import { prisma } from "../prisma"; //conexión a la base de datos
import { Prisma } from "../generated/prisma/client"; //sirve para usar utilidades y tipos de Prisma, en este caso el Decimal

export async function createOperation(contactId: string, amount: number) {
  if (!Number.isFinite(amount)) throw new Error("Cantidad no valida");

  return prisma.$transaction(async (tx) => { //prisma abre una transaccion
    const contact = await tx.contact.findUnique({ //tx es un PrismaClient temporal
      where: { id: contactId },
      select: { id: true },
    });

    if (!contact) throw new Error("Contacto no encontrado");

    //crea la operación
    const operation = await tx.operation.create({
      data: {
        contactId,
        amount: new Prisma.Decimal(amount),  //guarda el amount como Decimal real de base de datos, no como number de JavaScript
      },
    });

    //recalcula el balance por sumatoria 
    const agg = await tx.operation.aggregate({
      where: { contactId },
      _sum: { amount: true },
    });

    const newBalance = agg._sum.amount ?? new Prisma.Decimal(0);

    //actualiza el balance del contacto
    const updatedContact = await tx.contact.update({
      where: { id: contactId },
      data: { balance: newBalance },
    });

    return { operation, contact: updatedContact };
  });
}

export async function listOperations(contactId: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { id: true },
  });

  if (!contact) throw new Error("Contacto no encontrado");

  return prisma.operation.findMany({ //devuelve historial del contacto
    where: { contactId },
    orderBy: { createdAt: "desc" }, //descendiente: devuelve las operaciones de la más reciente a la más vieja
  });
}



