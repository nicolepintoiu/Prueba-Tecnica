import { prisma } from "../prisma";

type ExportRangeParams = { //define el rango por fechas
  startUndefined: boolean; ///desde el inicio
  endNow: boolean; //hasta hoy
  startDate?: string;
  endDate?: string;
};

type ExportContactParams = ExportRangeParams & { contactId: string };

function parseDateStart(dateStr: string) { //inicio del rango
  const d = new Date(`${dateStr}T00:00:00.000Z`); //convertir el texto a fecha, hace que el rango incluya todo el dia completo
  if (Number.isNaN(d.getTime())) throw new Error("Rango de fechas invalido");
  return d;
}

function parseDateEnd(dateStr: string) { //final del rango
  const d = new Date(`${dateStr}T23:59:59.999Z`);
  if (Number.isNaN(d.getTime())) throw new Error("Rango de fechas invalido");
  return d;
}

//evita problemas si algún campo tiene comas o comillas.
function csvEscape(v: string) {
  const needsQuotes = /[",\n]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function sanitizeFilenamePart(v: string) { //reemplaza espacios, @, acentos, etc por _ en el nombre del archivo (para evitar errores del sistema al guardar el archivo)
  return v.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildRange(params: ExportRangeParams) { 
  const { startUndefined, endNow, startDate, endDate } = params; //recibe los parametros del formulario

  const start = startUndefined ? undefined : startDate ? parseDateStart(startDate) : null;
  const end = endNow ? new Date() : endDate ? parseDateEnd(endDate) : null;

  //validaciones de errores
  if (start === null) throw new Error("Falta fecha de inicio");
  if (end === null) throw new Error("Falta fecha de fin");
  if (start && end && start.getTime() > end.getTime()) throw new Error("Rango de fechas invalido");

  //arma el filtro de cuando fue creado para prisma
  const createdAt: any = {};
  if (start) createdAt.gte = start;
  if (end) createdAt.lte = end;

  //sirve para que el nombre del archivo diga el rango
  const startLabel = startUndefined ? "from-first" : startDate!;
  const endLabel = endNow ? new Date().toISOString().slice(0, 10) : endDate!; //el slice(0,10) es una forma de recortar un string, asi se se queda solo con la parte de la fecha y corta la hora, minutos y segundos

  return { createdAt, startLabel, endLabel };
}

export async function exportContactOperationsCsv(params: ExportContactParams) {
  const { contactId } = params;
  const { createdAt, startLabel, endLabel } = buildRange(params);

  //Verifica que el contacto exista
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { id: true, email: true, name: true },
  });
  if (!contact) throw new Error("Contacto no encontrado");

  //Busca las operaciones del contacto (con filtro por fecha)
  const ops = await prisma.operation.findMany({
    where: {
      contactId,
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
    },
    orderBy: { createdAt: "asc" }, //salen en orden cronológico (primero las más viejas, luego las nuevas)
    select: { id: true, contactId: true, amount: true, createdAt: true },
  });

  const header = ["id", "contactId", "amount", "createdAt"].join(",");
  const rows = ops.map((o) =>
    [
      csvEscape(o.id),//evita problemas si algún campo tiene comas o comillas.
      csvEscape(o.contactId),
      csvEscape(o.amount.toString()), //se puso asi ya que  Prisma devuelve Decimal no un number.
      csvEscape(o.createdAt.toISOString()), //para formato estándar.
    ].join(",")
  );

  const csv = [header, ...rows].join("\n") + "\n";

  // el sanitizeFilenamePart reemplaza caracteres raros por _
  const who = sanitizeFilenamePart(contact.name || contact.email || contact.id);
  const filename = `operaciones_${who}_${startLabel}-${endLabel}.csv`;

  return { csv, filename };
}

//hace lo mismo que exportContactOperationsCsv pero esta vez exporta todas las operaciones de todos los contactos
export async function exportAllOperationsCsv(params: ExportRangeParams) {
  const { createdAt, startLabel, endLabel } = buildRange(params); //strings para armar el nombre del archivo

  const ops = await prisma.operation.findMany({
    where: {
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
    },
    orderBy: { createdAt: "asc" }, //si createdAt tiene algo filtra por fecha, si esta vacio trae todas sin filtro
    select: { //incluye los campos de la operación y  trae el contacto asociado
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

