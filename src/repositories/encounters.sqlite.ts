import { db } from "./sqlite.database";
import type { Encounter, EncountersRepository } from "./encounters.repository";
import type { CreateEncounterInput } from "../validation/encounters.schemas";
type Row = { id: number; patient_id: number; started_at: string; chief_complaint: string; notes: string | null; professional_id: number | null };
const SELECT = "SELECT id, patient_id, started_at, chief_complaint, notes, professional_id FROM encounters";
function map(row: Row): Encounter { return { id: row.id, patientId: row.patient_id, startedAt: row.started_at, chiefComplaint: row.chief_complaint, notes: row.notes, professionalId: row.professional_id }; }
export class SqliteEncountersRepository implements EncountersRepository {
  async findByPatient(patientId: number) { return (db.prepare(`${SELECT} WHERE patient_id = ? ORDER BY started_at DESC`).all(patientId) as Row[]).map(map); }
  async findById(id: number) { const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as Row | undefined; return row && map(row); }
  async create(patientId: number, input: CreateEncounterInput, professionalId?: number) {
    return Number(db.prepare("INSERT INTO encounters (patient_id, started_at, chief_complaint, notes, professional_id) VALUES (?, ?, ?, ?, ?)").run(patientId, input.startedAt, input.chiefComplaint, input.notes ?? null, professionalId ?? null).lastInsertRowid);
  }
}
