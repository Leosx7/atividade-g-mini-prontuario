import { Router } from "express";
import type { createMedicationsController } from "../controllers/medications.controller";
import { validate } from "../middlewares/validate";
import { createMedicationSchema } from "../validation/medications.schemas";

export function createMedicationsRouter(controller: ReturnType<typeof createMedicationsController>) {
  const router = Router({ mergeParams: true });
  router.get("/", controller.listByEncounter);
  router.post("/", validate(createMedicationSchema), controller.create);
  return router;
}
