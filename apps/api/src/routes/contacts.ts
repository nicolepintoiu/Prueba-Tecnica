import express, { Request, Response } from "express";
import {
  createContact, 
  listContacts, 
  getContactById,
  updateContactName,
} from "../services/contacts.service";
import operationsRouter from "./operations";  //las rutas de operations de un contacto

type ContactParams = { id: string }; //le dice a TypeScript que cuando una ruta tenga id, ese parámetro existe y es string

const router = express.Router(); //router independiente

// GET /api/contacts
router.get("/", async (_req: Request, res: Response) => {
  const contacts = await listContacts();
  return res.json(contacts);     //responde un JSON con el array de contactos
});

// GET /api/contacts/:id
router.get("/:id", async (req: Request<ContactParams>, res: Response) => {
  try {
    const contact = await getContactById(req.params.id);
    return res.json(contact);
  } catch (err: any) {
    if (err?.message === "Contacto no encontrado") {
      return res.status(404).json({ ok: false, error: "Contacto no encontrado" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});

// POST /api/contacts
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body as { email?: string; name?: string };

    if (!email || !name) {
      return res.status(400).json({ ok: false, error: "Correo y nombre son necesarios" });
    }

    const contact = await createContact(email, name); //si esta todo bien crea el contacto en la BD
    return res.status(201).json(contact); //responde 201 con el contacto creado
  } catch (err: any) {
    if (err?.code === "P2002") { //prisma lanza P2002 cuando violas un @unique
      return res.status(409).json({ ok: false, error: "El correo ya existe" });
    }
    if (err?.message === "Error de validacion") {
      return res.status(400).json({ ok: false, error: "Dato invalido" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});

// PATCH /api/contacts/:id 
router.patch("/:id", async (req: Request<ContactParams>, res: Response) => {
  try {
    const { name } = req.body as { name?: string }; //solo cambia el nombre
    if (!name) {
      return res.status(400).json({ ok: false, error: "El nombre es necesario" });
    }

    const updated = await updateContactName(req.params.id, name); //actualiza el contacto en la BD
    return res.json(updated);
  } catch (err: any) {
    if (err?.message === "Contacto no encontrado") {
      return res.status(404).json({ ok: false, error: "Contacto no encontrado" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});

router.use("/:id/operations", operationsRouter); //POST y GET los maneja operationsRouter

export default router;  //exporta el router para usarlo en index.ts



