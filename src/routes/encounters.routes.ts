import { requireRole } from "../middlewares/auth";
import { Router } from "express";
import type { createEncountersController } from "../controllers/encounters.controller";
import { validate } from "../middlewares/validate";
import { createEncounterSchema } from "../validation/encounters.schemas";

export function createEncountersRouter(controller: ReturnType<typeof createEncountersController>, protectedRoutes = false) {
  const router = Router({ mergeParams: true });
  router.get("/", controller.listByPatient);
  router.post("/", ...(protectedRoutes ? [requireRole("admin", "profissional")] : []), validate(createEncounterSchema), controller.create);
  return router;
}
