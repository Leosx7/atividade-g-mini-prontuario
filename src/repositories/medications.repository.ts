import { db } from "./sqlite.database";
import type { CreateMedicationInput } from "../validation/medications.schemas";
export type Medication = { id: number; encounterId: number; medication: string; dosage: string };
export interface MedicationsRepository {
  findByEncounter(encounterId: number): Promise<Medication[]>;
  create(encounterId: number, input: CreateMedicationInput): Promise<Medication>;
}
type Row = { id: number; encounter_id: number; medication: string; dosage: string };
const SELECT = "SELECT id, encounter_id, medication, dosage FROM medication_requests";
function map(row: Row): Medication { return { id: row.id, encounterId: row.encounter_id, medication: row.medication, dosage: row.dosage }; }
export class SqliteMedicationsRepository implements MedicationsRepository {
  async findByEncounter(encounterId: number) { return (db.prepare(`${SELECT} WHERE encounter_id = ? ORDER BY id`).all(encounterId) as Row[]).map(map); }
  async create(encounterId: number, input: CreateMedicationInput) {
    const result = db.prepare("INSERT INTO medication_requests (encounter_id, medication, dosage) VALUES (?, ?, ?)").run(encounterId, input.medication, input.dosage);
    return map(db.prepare(`${SELECT} WHERE id = ?`).get(result.lastInsertRowid) as Row);
  }
}
