import express, { Request, Response } from "express";
import { createOperation, listOperations } from "../services/operations.service";

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

    const op = await createOperation(id, amount);
    return res.status(201).json({ ok: true, operation: op });
  } catch (err: any) {
    if (err?.message === "CONTACT_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Contact not found" });
    }
    if (err?.message === "INVALID_AMOUNT") {
      return res.status(400).json({ ok: false, error: "Invalid amount" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// GET 
router.get("/", async (req: Request<ContactParams>, res: Response) => {
  try {
    const { id } = req.params;
    const ops = await listOperations(id);
    return res.json({ ok: true, contactId: id, operations: ops });
  } catch (err: any) {
    if (err?.message === "CONTACT_NOT_FOUND") {
      return res.status(404).json({ ok: false, error: "Contact not found" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;



