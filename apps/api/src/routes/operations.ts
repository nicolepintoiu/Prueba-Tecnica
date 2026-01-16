import express, { Request, Response } from "express";
import { createOperation, listOperations } from "../services/operations.service"; // funciones del service que hacen la lógica y consultan la BD

type ContactParams = { id: string };
const router = express.Router({ mergeParams: true });

// POST
router.post("/", async (req: Request<ContactParams>, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body as { amount: number };

    if (typeof amount !== "number") {
      return res.status(400).json({ ok: false, error: "amount must be a number" });
    }

    const op = await createOperation(id, amount);   //llama al service para guardar la operación
    return res.status(201).json({ ok: true, operation: op }); //devuelve la operacion creada
  } catch (err: any) {
    if (err?.message === "contact not found") {
      return res.status(404).json({ ok: false, error: "Contact not found" });
    }
    if (err?.message === "invalid amount") {
      return res.status(400).json({ ok: false, error: "Invalid amount" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// GET 
router.get("/", async (req: Request<ContactParams>, res: Response) => { //listar operaciones del contacto
  try {
    const { id } = req.params;
    const ops = await listOperations(id); //busca sus operaciones en la BD
    return res.json({ ok: true, contactId: id, operations: ops });
  } catch (err: any) {
    if (err?.message === "CONTACT_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Contact not found" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router; //exporta el router para que contacts.ts lo pueda montar.



