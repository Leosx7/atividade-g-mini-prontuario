import { requireRole } from "../middlewares/auth";
import { Router } from "express";
import type { createMedicationsController } from "../controllers/medications.controller";
import { validate } from "../middlewares/validate";
import { createMedicationSchema } from "../validation/medications.schemas";

export function createMedicationsRouter(controller: ReturnType<typeof createMedicationsController>, protectedRoutes = false) {
  const router = Router({ mergeParams: true });
  router.get("/", ...(protectedRoutes ? [requireRole("admin", "profissional")] : []), controller.listByEncounter);
  router.post("/", ...(protectedRoutes ? [requireRole("profissional")] : []), validate(createMedicationSchema), controller.create);
  return router;
}
