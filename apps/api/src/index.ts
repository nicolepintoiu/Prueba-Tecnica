import "dotenv/config";
import express from "express";
import contactsRouter from "./routes/contacts";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => res.send("API OK"));

app.use("/api/contacts", contactsRouter);

app.listen(3000, () => console.log("running"));
