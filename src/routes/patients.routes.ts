import { Router } from "express";
import type { createPatientsController } from "../controllers/patients.controller";
import { validate } from "../middlewares/validate";
import { createPatientSchema } from "../validation/patients.schemas";
import { uploadPhoto } from "../middlewares/upload";

export function createPatientsRouter(controller: ReturnType<typeof createPatientsController>) {
  const router = Router({ mergeParams: true });
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", validate(createPatientSchema), controller.create);
  router.post("/:id/photo", uploadPhoto.single("photo"), controller.uploadPhoto);
  return router;
}
