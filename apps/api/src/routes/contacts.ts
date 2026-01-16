import express from "express";
import { createContact, listContacts } from "../services/contacts.service"; //funciones del service que hablan con la BD
import operationsRouter from "./operations"; //sirve para manejar operaciones del contacto

const router = express.Router();

router.get("/", async (_req, res) => {
  const contacts = await listContacts(); //devuelve un JSON con la lista de contactos
  res.json(contacts);
});

router.post("/", async (req, res) => {
  const { email, name } = req.body;
  const contact = await createContact(email, name); //llama a createContact y lo guarda en la BD
  res.status(201).json(contact);
});

router.use("/:id/operations", operationsRouter); //cualquier request a GET o POST la maneja operationsRouter

export default router;



