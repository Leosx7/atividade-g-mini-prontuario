import type { EncountersRepository } from "../repositories/encounters.repository";
import type { PatientsService } from "./patients.service";
import { NotFoundError } from "../errors/HttpError";
import type { CreateEncounterInput } from "../validation/encounters.schemas";

export class EncountersService {
  constructor(private readonly repository: EncountersRepository, private readonly patients: PatientsService) {}
  async listEncountersByPatient(patientId: number) {
    await this.patients.getPatientById(patientId);
    return this.repository.findByPatient(patientId);
  }
  async getEncounterById(id: number) {
    const encounter = await this.repository.findById(id);
    if (!encounter) throw new NotFoundError("Atendimento não encontrado.");
    return encounter;
  }
  async createEncounter(patientId: number, input: CreateEncounterInput) {
    await this.patients.getPatientById(patientId);
    return this.getEncounterById(await this.repository.create(patientId, input));
  }
}
