import { prisma } from "../prisma";

type ExportRangeParams = {
  startUndefined: boolean;
  endNow: boolean;
  startDate?: string;
  endDate?: string;
};

type ExportContactParams = ExportRangeParams & { contactId: string };

function parseDateStart(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error("Rango de fechas invalido");
  return d;
}

function parseDateEnd(dateStr: string) {
  const d = new Date(`${dateStr}T23:59:59.999Z`);
  if (Number.isNaN(d.getTime())) throw new Error("Rango de fechas invalido");
  return d;
}

function csvEscape(v: string) {
  const needsQuotes = /[",\n]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function sanitizeFilenamePart(v: string) {
  return v.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildRange(params: ExportRangeParams) {
  const { startUndefined, endNow, startDate, endDate } = params;

  const start = startUndefined ? undefined : startDate ? parseDateStart(startDate) : null;
  const end = endNow ? new Date() : endDate ? parseDateEnd(endDate) : null;

  if (start === null) throw new Error("Falta fecha de inicio");
  if (end === null) throw new Error("Falta fecha de fin");
  if (start && end && start.getTime() > end.getTime()) throw new Error("Rango de fechas invalido");

  const createdAt: any = {};
  if (start) createdAt.gte = start;
  if (end) createdAt.lte = end;

  const startLabel = startUndefined ? "from-first" : startDate!;
  const endLabel = endNow ? new Date().toISOString().slice(0, 10) : endDate!;

  return { createdAt, startLabel, endLabel };
}

export async function exportContactOperationsCsv(params: ExportContactParams) {
  const { contactId } = params;
  const { createdAt, startLabel, endLabel } = buildRange(params);

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { id: true, email: true, name: true },
  });
  if (!contact) throw new Error("Contacto no encontrado");

  const ops = await prisma.operation.findMany({
    where: {
      contactId,
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, contactId: true, amount: true, createdAt: true },
  });

  const header = ["id", "contactId", "amount", "createdAt"].join(",");
  const rows = ops.map((o) =>
    [
      csvEscape(o.id),
      csvEscape(o.contactId),
      csvEscape(o.amount.toString()),
      csvEscape(o.createdAt.toISOString()),
    ].join(",")
  );

  const csv = [header, ...rows].join("\n") + "\n";

  const who = sanitizeFilenamePart(contact.email || contact.id);
  const filename = `transactions_contact_${who}_${startLabel}_to_${endLabel}.csv`;

  return { csv, filename };
}

export async function exportAllOperationsCsv(params: ExportRangeParams) {
  const { createdAt, startLabel, endLabel } = buildRange(params);

  const ops = await prisma.operation.findMany({
    where: {
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      contactId: true,
      amount: true,
      createdAt: true,
      contact: { select: { email: true, name: true } },
    },
  });

  const header = ["id", "contactId", "contactEmail", "contactName", "amount", "createdAt"].join(",");
  const rows = ops.map((o) =>
    [
      csvEscape(o.id),
      csvEscape(o.contactId),
      csvEscape(o.contact?.email ?? ""),
      csvEscape(o.contact?.name ?? ""),
      csvEscape(o.amount.toString()),
      csvEscape(o.createdAt.toISOString()),
    ].join(",")
  );

  const csv = [header, ...rows].join("\n") + "\n";
  const filename = `transactions_all_${startLabel}_to_${endLabel}.csv`;

  return { csv, filename };
}

