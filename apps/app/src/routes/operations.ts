import express, { Request, Response } from "express";
import { createOperation, listOperations } from "../services/operations.service";
import { exportContactOperationsCsv } from "../services/exports.service"; //genera un CSV de operaciones del contacto

type ContactParams = { id: string }; //el parametro esperado en la URL es id

const router = express.Router({ mergeParams: true });

//exportar CSV del contacto
router.get("/export", async (req: Request<ContactParams>, res: Response) => {
  try {
    const contactId = req.params.id;

    const startUndefined = String(req.query.startUndefined) === "true"; //exportar desde la primera operación
    const endNow = String(req.query.endNow) === "true"; //exportar hasta el momento actual

    const startDate = req.query.startDate ? String(req.query.startDate) : undefined; //Si el usuario mandó startDate se convierte en string si no queda undefined
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined; //Igual que startDate, pero para el fin

    const params = {
      contactId,
      startUndefined,
      endNow,
      ...(startDate ? { startDate } : {}), //si el startdate tiene un valor se agrega, sino queda vacio
      ...(endDate ? { endDate } : {}), //lo mismo que pasa en startdate, pasa aca
                                      // el ... expande un objeto dentro de otro)
    };

    const { csv, filename } = await exportContactOperationsCsv(params); //valida el rango, consulta las operaciones, arma el CSV

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`); //para bajarlo como archivo

    // ayuda con los acentos
    return res.status(200).send("\uFEFF" + csv);

    //manejo de errores
  } catch (err: any) { 
    if (err?.message === "Contacto no encontrado") {
      return res.status(404).json({ ok: false, error: "Contacto no encontrado" });
    }
    if (
      err?.message === "Falta fecha de inicio" ||
      err?.message === "Falta fecha de fin" ||
      err?.message === "Rango de fechas invalido"
    ) {
      return res.status(400).json({ ok: false, error: err.message });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});

// POST (crear una operacion)

router.post("/", async (req: Request<ContactParams>, res: Response) => {
  try {
    const { id } = req.params;

    const body = (req.body ?? {}) as { type?: unknown; amount?: unknown };

    const type = body.type;
    const amount = body.amount;

    // Validaciones
    if (type !== "add" && type !== "sub") {
      return res.status(400).json({ ok: false, error: "El tipo debe ser 'add' o 'sub'" });
    }

    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      return res.status(400).json({ ok: false, error: "La cantidad debe ser un número válido" });
    }

    if (amount <= 0) {
      return res.status(400).json({ ok: false, error: "La cantidad debe ser mayor que 0" });
    }

    const signedAmount = type === "sub" ? -amount : amount;

    const result = await createOperation(id, signedAmount);

    return res.status(201).json({ ok: true, ...result });
  } catch (err: any) {
    if (err?.message === "Contacto no encontrado") {
      return res.status(404).json({ ok: false, error: "Contacto no encontrado" });
    }
    if (err?.message === "Cantidad no valida") {
      return res.status(400).json({ ok: false, error: "Cantidad no valida" });
    }
    if (err?.message === "Desequilibrio de saldo") {
      return res.status(409).json({
        ok: false,
        error: "El saldo no coincide con la suma o resta de las operaciones",
      });
    }

    console.error(err);
    return res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});

// GET (listar operaciones de un contacto)
router.get("/", async (req: Request<ContactParams>, res: Response) => {
  try {
    const { id } = req.params; //Saca el id del contacto
    const ops = await listOperations(id); //trae el historial
    return res.json({ ok: true, contactId: id, operations: ops }); //Devuelve un JSON con las operaciones
  } catch (err: any) { //manejo de errores
    if (err?.message === "Contacto no encontrado") {
      return res.status(404).json({ ok: false, error: "Contacto no encontrado" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});

export default router;

