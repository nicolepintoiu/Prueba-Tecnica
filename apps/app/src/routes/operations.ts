import express, { Request, Response } from "express";
import { createOperation, listOperations } from "../services/operations.service";
import { exportContactOperationsCsv } from "../services/exports.service";

type ContactParams = { id: string };

const router = express.Router({ mergeParams: true });

router.get("/export", async (req: Request<ContactParams>, res: Response) => {
  try {
    const contactId = req.params.id;

    const startUndefined = String(req.query.startUndefined) === "true";
    const endNow = String(req.query.endNow) === "true";

    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;

    
    const params = {
      contactId,
      startUndefined,
      endNow,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };

    const { csv, filename } = await exportContactOperationsCsv(params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // ayuda con los acentos
    return res.status(200).send("\uFEFF" + csv);
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

// POST 
router.post("/", async (req: Request<ContactParams>, res: Response) => {
  try {
    const { id } = req.params;
    const body = (req.body ?? {}) as { amount?: unknown };
    const amount = body.amount;

    if (typeof amount !== "number") {
      return res.status(400).json({ ok: false, error: "La cantidad debe ser un número" });
    }

    const result = await createOperation(id, amount);
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
        error: "El saldo no coincide con la suma de las operaciones",
      });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});

// GET 
router.get("/", async (req: Request<ContactParams>, res: Response) => {
  try {
    const { id } = req.params;
    const ops = await listOperations(id);
    return res.json({ ok: true, contactId: id, operations: ops });
  } catch (err: any) {
    if (err?.message === "Contacto no encontrado") {
      return res.status(404).json({ ok: false, error: "Contacto no encontrado" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});

export default router;

