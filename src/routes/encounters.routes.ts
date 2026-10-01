import { Router } from "express";
import type { createEncountersController } from "../controllers/encounters.controller";
import { validate } from "../middlewares/validate";
import { createEncounterSchema } from "../validation/encounters.schemas";

export function createEncountersRouter(controller: ReturnType<typeof createEncountersController>) {
  const router = Router({ mergeParams: true });
  router.get("/", controller.listByPatient);
  router.post("/", validate(createEncounterSchema), controller.create);
  return router;
}
