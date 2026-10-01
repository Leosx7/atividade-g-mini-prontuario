import express from "express";
import { createPatientsRouter } from "./routes/patients.routes";
import { createEncountersRouter } from "./routes/encounters.routes";
import { createMedicationsRouter } from "./routes/medications.routes";
import { authRouter } from "./routes/auth.routes";
import { createPatientsController } from "./controllers/patients.controller";
import { createEncountersController } from "./controllers/encounters.controller";
import { createMedicationsController } from "./controllers/medications.controller";
import { PatientsService } from "./services/patients.service";
import { EncountersService } from "./services/encounters.service";
import { MedicationsService } from "./services/medications.service";
import { SqlitePatientsRepository, type PatientsRepository } from "./repositories/patients.repository";
import { SqliteEncountersRepository, type EncountersRepository } from "./repositories/encounters.repository";
import { SqliteMedicationsRepository, type MedicationsRepository } from "./repositories/medications.repository";
import { errorHandler } from "./middlewares/errorHandler";

export type Repositories = { patients: PatientsRepository; encounters: EncountersRepository; medications: MedicationsRepository };
// A composição injeta os adapters; os services dependem somente dos ports.
export function createApp(repositories: Repositories) {
  const app = express();
  const patients = new PatientsService(repositories.patients);
  const encounters = new EncountersService(repositories.encounters, patients);
  const medications = new MedicationsService(repositories.medications, encounters);
  app.use(express.json());
  app.use(express.static("public"));
  app.use("/uploads", express.static("uploads"));
  app.get("/api/health", (_request, response) => { response.json({ status: "ok" }); });
  app.use("/api/auth", authRouter);
  app.use("/api/patients", createPatientsRouter(createPatientsController(patients)));
  app.use("/api/patients/:id/encounters", createEncountersRouter(createEncountersController(encounters)));
  app.use("/api/encounters/:encounterId/medications", createMedicationsRouter(createMedicationsController(medications)));
  app.use(errorHandler);
  return app;
}
export const app = createApp({ patients: new SqlitePatientsRepository(), encounters: new SqliteEncountersRepository(), medications: new SqliteMedicationsRepository() });
