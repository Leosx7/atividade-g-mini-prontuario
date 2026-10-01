import { db } from "./sqlite.database";
import { ConflictError } from "../errors/HttpError";
import type { CreatePatientInput } from "../validation/patients.schemas";

export type Patient = { id: number; name: string; birthDate: string; nationalId: string; photoUrl: string | null; active: boolean };
export interface PatientsRepository {
  findAll(): Promise<Patient[]>;
  findById(id: number): Promise<Patient | undefined>;
  findByNationalId(cns: string): Promise<Patient | undefined>;
  create(input: CreatePatientInput): Promise<number>;
  updatePhoto(id: number, url: string): Promise<void>;
}
type PatientRow = { id: number; name: string; birth_date: string; national_id: string; photo_url: string | null; active: number };
const SELECT = "SELECT id, name, birth_date, national_id, photo_url, active FROM patients";
function map(row: PatientRow): Patient {
  return { id: row.id, name: row.name, birthDate: row.birth_date, nationalId: row.national_id, photoUrl: row.photo_url, active: row.active === 1 };
}
// O port é assíncrono desde ARQ: Prisma poderá substituí-lo sem mudar o service.
export class SqlitePatientsRepository implements PatientsRepository {
  async findAll() { return (db.prepare(`${SELECT} ORDER BY name`).all() as PatientRow[]).map(map); }
  async findById(id: number) {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as PatientRow | undefined;
    return row && map(row);
  }
  async findByNationalId(cns: string) {
    const row = db.prepare(`${SELECT} WHERE national_id = ?`).get(cns) as PatientRow | undefined;
    return row && map(row);
  }
  async create(input: CreatePatientInput) {
    try {
      return Number(db.prepare("INSERT INTO patients (name, birth_date, national_id, active) VALUES (?, ?, ?, 1)").run(input.name, input.birthDate, input.nationalId).lastInsertRowid);
    } catch (error) {
      // UNIQUE fecha a corrida entre a consulta do service e o INSERT.
      if (typeof error === "object" && error !== null && "code" in error && error.code === "SQLITE_CONSTRAINT_UNIQUE") throw new ConflictError("Já existe um paciente com este CNS.");
      throw error;
    }
  }
  async updatePhoto(id: number, url: string) { db.prepare("UPDATE patients SET photo_url = ? WHERE id = ?").run(url, id); }
}
