import express, { Request, Response } from "express";
import { exportAllOperationsCsv } from "../services/exports.service";

const router = express.Router();

router.get("/export", async (req: Request, res: Response) => {
  try {
    const startUndefined = String(req.query.startUndefined) === "true";
    const endNow = String(req.query.endNow) === "true";

    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;

    const params = {
      startUndefined,
      endNow,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };

    const { csv, filename } = await exportAllOperationsCsv(params);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send("\uFEFF" + csv);
  } catch (err: any) {
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

export default router;
