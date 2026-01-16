import "dotenv/config";
import express from "express";
import contactsRouter from "./routes/contacts";

const app = express(); //crea el servidor de Express.
app.use(express.json()); //middleware que permite que Express lea bodies JSON en requests

app.get("/", (_req, res) => res.send("API OK")); //ayuda para saber que el server está vivo

app.use("/api/contacts", contactsRouter); //monta el router de contactos

app.listen(3000, () => console.log("running"));
