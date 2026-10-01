import express from "express";
import { createPatientsRouter } from "./routes/patients.routes";
import { createEncountersRouter } from "./routes/encounters.routes";
import { createMedicationsRouter } from "./routes/medications.routes";
import { createAuthRouter } from "./routes/auth.routes";
import { createPatientsController } from "./controllers/patients.controller";
import { createEncountersController } from "./controllers/encounters.controller";
import { createMedicationsController } from "./controllers/medications.controller";
import { createAuthController } from "./controllers/auth.controller";
import { PatientsService } from "./services/patients.service";
import { EncountersService } from "./services/encounters.service";
import { MedicationsService } from "./services/medications.service";
import type { AuthService } from "./services/auth.service";
import type { PatientsRepository } from "./repositories/patients.repository";
import type { EncountersRepository } from "./repositories/encounters.repository";
import type { MedicationsRepository } from "./repositories/medications.repository";
import { errorHandler } from "./middlewares/errorHandler";
import { requireAuth } from "./middlewares/auth";
export type Repositories = { patients: PatientsRepository; encounters: EncountersRepository; medications: MedicationsRepository };
export type Authentication = { service: AuthService; secret: string };
// Sem authentication: montagem de regressão do contrato anterior, nunca usada pelo server.ts.
export function createApp(repositories: Repositories, authentication?: Authentication) {
  const app = express();
  const patients = new PatientsService(repositories.patients);
  const encounters = new EncountersService(repositories.encounters, patients);
  const medications = new MedicationsService(repositories.medications, encounters);
  app.use(express.json());
  app.use(express.static("public"));
  app.use("/uploads", express.static("uploads"));
  app.get("/api/health", (_request, response) => { response.json({ status: "ok" }); });
  if (authentication) {
    const authenticate = requireAuth(authentication.secret);
    app.use("/api/auth", createAuthRouter(createAuthController(authentication.service), authenticate));
    app.use("/api/patients", authenticate);
    app.use("/api/encounters", authenticate);
  }
  app.use("/api/patients", createPatientsRouter(createPatientsController(patients)));
  app.use("/api/patients/:id/encounters", createEncountersRouter(createEncountersController(encounters), !!authentication));
  app.use("/api/encounters/:encounterId/medications", createMedicationsRouter(createMedicationsController(medications), !!authentication));
  app.use(errorHandler);
  return app;
}
