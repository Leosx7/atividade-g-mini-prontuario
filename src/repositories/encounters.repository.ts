import type { CreateEncounterInput } from "../validation/encounters.schemas";
export type Encounter = { id: number; patientId: number; startedAt: string; chiefComplaint: string; notes: string | null; professionalId: number | null };
export interface EncountersRepository {
  findByPatient(patientId: number): Promise<Encounter[]>;
  findById(id: number): Promise<Encounter | undefined>;
  create(patientId: number, input: CreateEncounterInput, professionalId?: number): Promise<number>;
}
