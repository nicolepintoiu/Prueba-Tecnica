import express, { Request, Response } from "express";
import { createOperation, listOperations } from "../services/operations.service";

type ContactParams = { id: string }; //define que el parámetro esperado es id
const router = express.Router({ mergeParams: true });

router.post("/", async (req: Request<ContactParams>, res: Response) => {
  try {
    const { id } = req.params; //desde la URL
    const { amount } = req.body as { amount: number }; //desde el body

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
      return res.status(409).json({ ok: false, error: "El saldo no coincide con la suma de las operaciones" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});

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


