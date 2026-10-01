import type { CreateMedicationInput } from "../validation/medications.schemas";
export type Medication = { id: number; encounterId: number; medication: string; dosage: string };
export interface MedicationsRepository {
  findByEncounter(encounterId: number): Promise<Medication[]>;
  create(encounterId: number, input: CreateMedicationInput): Promise<Medication>;
}
