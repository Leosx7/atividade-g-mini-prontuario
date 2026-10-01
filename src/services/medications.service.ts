import type { MedicationsRepository } from "../repositories/medications.repository";
import type { EncountersService } from "./encounters.service";
import type { CreateMedicationInput } from "../validation/medications.schemas";

export class MedicationsService {
  constructor(private readonly repository: MedicationsRepository, private readonly encounters: EncountersService) {}
  async listMedicationsByEncounter(encounterId: number) {
    await this.encounters.getEncounterById(encounterId);
    return this.repository.findByEncounter(encounterId);
  }
  async createMedication(encounterId: number, input: CreateMedicationInput) {
    await this.encounters.getEncounterById(encounterId);
    return this.repository.create(encounterId, input);
  }
}
