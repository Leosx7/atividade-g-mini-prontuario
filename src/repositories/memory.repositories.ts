import type { Patient, PatientsRepository } from "./patients.repository";
import type { Encounter, EncountersRepository } from "./encounters.repository";
import type { Medication, MedicationsRepository } from "./medications.repository";
import type { StoredUser, UsersRepository } from "./users.repository";
import type { CreatePatientInput } from "../validation/patients.schemas";
import type { CreateEncounterInput } from "../validation/encounters.schemas";
import type { CreateMedicationInput } from "../validation/medications.schemas";
import { ConflictError, NotFoundError } from "../errors/HttpError";
import { seedData } from "./seed-data";
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
export class InMemoryPatientsRepository implements PatientsRepository {
  private readonly rows = new Map<number, Patient>();
  private sequence = 0;
  constructor(initial: Patient[] = []) { for (const row of initial) { this.rows.set(row.id, { ...row }); this.sequence = Math.max(this.sequence, row.id); } }
  async findAll() { return [...this.rows.values()].sort((a, b) => compare(a.name, b.name)).map(row => ({ ...row })); }
  async findById(id: number) { const row = this.rows.get(id); return row && { ...row }; }
  async findByNationalId(cns: string) { const row = [...this.rows.values()].find(row => row.nationalId === cns); return row && { ...row }; }
  async create(input: CreatePatientInput) {
    // Checagem e inserção sem await: duplicata não vence a corrida neste processo.
    if ([...this.rows.values()].some(row => row.nationalId === input.nationalId)) throw new ConflictError("Já existe um paciente com este CNS.");
    const id = ++this.sequence;
    this.rows.set(id, { id, ...input, photoUrl: null, active: true });
    return id;
  }
  async updatePhoto(id: number, url: string) { const row = this.rows.get(id); if (!row) throw new NotFoundError("Paciente não encontrado."); row.photoUrl = url; }
}
export class InMemoryUsersRepository implements UsersRepository {
  private readonly rows = new Map<number, StoredUser>();
  private sequence = 0;
  async findById(id: number) { const row = this.rows.get(id); return row && { ...row }; }
  async findByEmail(email: string) { const row = [...this.rows.values()].find(row => row.email === email); return row && { ...row }; }
  async create(input: Omit<StoredUser, "id">) {
    if ([...this.rows.values()].some(row => row.email === input.email)) throw new ConflictError("Já existe um usuário com este e-mail.");
    const row = { id: ++this.sequence, ...input }; this.rows.set(row.id, row); return { ...row };
  }
}
export class InMemoryEncountersRepository implements EncountersRepository {
  private readonly rows = new Map<number, Encounter>();
  private sequence = 0;
  constructor(private readonly patients: PatientsRepository, private readonly users: UsersRepository, initial: Encounter[] = []) {
    for (const row of initial) { this.rows.set(row.id, { ...row }); this.sequence = Math.max(this.sequence, row.id); }
  }
  async findByPatient(patientId: number) { return [...this.rows.values()].filter(row => row.patientId === patientId).sort((a, b) => compare(b.startedAt, a.startedAt)).map(row => ({ ...row })); }
  async findById(id: number) { const row = this.rows.get(id); return row && { ...row }; }
  async create(patientId: number, input: CreateEncounterInput, professionalId?: number) {
    if (!(await this.patients.findById(patientId))) throw new NotFoundError("Paciente não encontrado.");
    if (professionalId !== undefined && !(await this.users.findById(professionalId))) throw new NotFoundError("Usuário não encontrado.");
    const id = ++this.sequence;
    this.rows.set(id, { id, patientId, startedAt: input.startedAt, chiefComplaint: input.chiefComplaint, notes: input.notes ?? null, professionalId: professionalId ?? null });
    return id;
  }
}
export class InMemoryMedicationsRepository implements MedicationsRepository {
  private readonly rows = new Map<number, Medication>();
  private sequence = 0;
  constructor(private readonly encounters: EncountersRepository, initial: Medication[] = []) {
    for (const row of initial) { this.rows.set(row.id, { ...row }); this.sequence = Math.max(this.sequence, row.id); }
  }
  async findByEncounter(encounterId: number) { return [...this.rows.values()].filter(row => row.encounterId === encounterId).sort((a, b) => a.id - b.id).map(row => ({ ...row })); }
  async create(encounterId: number, input: CreateMedicationInput) {
    if (!(await this.encounters.findById(encounterId))) throw new NotFoundError("Atendimento não encontrado.");
    const row = { id: ++this.sequence, encounterId, ...input }; this.rows.set(row.id, row); return { ...row };
  }
}
export function createMemoryRepositories() {
  const patients = new InMemoryPatientsRepository(seedData.patients);
  const users = new InMemoryUsersRepository();
  const encounters = new InMemoryEncountersRepository(patients, users, seedData.encounters.map(row => ({ ...row, professionalId: null })));
  const medications = new InMemoryMedicationsRepository(encounters, seedData.medications);
  return { patients, users, encounters, medications, close: async () => {} };
}
