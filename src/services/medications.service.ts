import type { MedicationsRepository } from "../repositories/medications.repository";
import type { EncountersService } from "./encounters.service";
import type { CreateMedicationInput } from "../validation/medications.schemas";
import type { User } from "./identity";
import { ForbiddenError } from "../errors/HttpError";
export class MedicationsService {
  constructor(private readonly repository: MedicationsRepository, private readonly encounters: EncountersService) {}
  async listMedicationsByEncounter(encounterId: number) {
    await this.encounters.getEncounterById(encounterId);
    return this.repository.findByEncounter(encounterId);
  }
  async createMedication(encounterId: number, input: CreateMedicationInput, actor?: User) {
    const encounter = await this.encounters.getEncounterById(encounterId);
    // AUTH-8: o middleware só conhece papel; o domínio conhece a autoria.
    if (actor && (actor.role !== "profissional" || encounter.professionalId !== actor.id)) throw new ForbiddenError("Somente o profissional que registrou o atendimento pode prescrever.");
    return this.repository.create(encounterId, input);
  }
}
