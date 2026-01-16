import express from "express";
import { createContact, listContacts } from "../services/contacts.service";
import operationsRouter from "./operations";

const router = express.Router();

router.get("/", async (_req, res) => {
  const contacts = await listContacts();
  res.json(contacts);
});

router.post("/", async (req, res) => {
  const { email, name } = req.body;
  const contact = await createContact(email, name);
  res.status(201).json(contact);
});

router.use("/:id/operations", operationsRouter);

export default router;



