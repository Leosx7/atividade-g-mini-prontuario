import type { UsersRepository, StoredUser } from "./users.repository";
import { roleSchema } from "../validation/auth.schemas";
import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import type { PatientsRepository, Patient } from "./patients.repository";
import type { EncountersRepository } from "./encounters.repository";
import type { MedicationsRepository } from "./medications.repository";
import type { CreatePatientInput } from "../validation/patients.schemas";
import type { CreateEncounterInput } from "../validation/encounters.schemas";
import type { CreateMedicationInput } from "../validation/medications.schemas";
import { ConflictError } from "../errors/HttpError";

function patientJson(row: { id: number; name: string; birthDate: string; nationalId: string; photoUrl: string | null; active: number }): Patient {
  return { ...row, active: row.active === 1 };
}
export class PrismaPatientsRepository implements PatientsRepository {
  constructor(private readonly client: PrismaClient) {}
  async findAll() { return (await this.client.patient.findMany({ orderBy: { name: "asc" } })).map(patientJson); }
  async findById(id: number) { const row = await this.client.patient.findUnique({ where: { id } }); return row ? patientJson(row) : undefined; }
  async findByNationalId(cns: string) { const row = await this.client.patient.findUnique({ where: { nationalId: cns } }); return row ? patientJson(row) : undefined; }
  async create(input: CreatePatientInput) {
    try { return (await this.client.patient.create({ data: { ...input, active: 1 } })).id; }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictError("Já existe um paciente com este CNS.");
      throw error;
    }
  }
  async updatePhoto(id: number, url: string) { await this.client.patient.update({ where: { id }, data: { photoUrl: url } }); }
}
export class PrismaEncountersRepository implements EncountersRepository {
  constructor(private readonly client: PrismaClient) {}
  findByPatient(patientId: number) { return this.client.encounter.findMany({ where: { patientId }, orderBy: { startedAt: "desc" } }); }
  async findById(id: number) { return (await this.client.encounter.findUnique({ where: { id } })) ?? undefined; }
  async create(patientId: number, input: CreateEncounterInput, professionalId?: number) { return (await this.client.encounter.create({ data: { patientId, ...input, professionalId } })).id; }
}
export class PrismaMedicationsRepository implements MedicationsRepository {
  constructor(private readonly client: PrismaClient) {}
  findByEncounter(encounterId: number) { return this.client.medicationRequest.findMany({ where: { encounterId }, orderBy: { id: "asc" } }); }
  create(encounterId: number, input: CreateMedicationInput) { return this.client.medicationRequest.create({ data: { encounterId, ...input } }); }
}
function storedUser(row: { id: number; name: string; email: string; passwordHash: string; role: string }): StoredUser { return { ...row, role: roleSchema.parse(row.role) }; }
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly client: PrismaClient) {}
  async findByEmail(email: string) { const row = await this.client.user.findUnique({ where: { email } }); return row ? storedUser(row) : undefined; }
  async findById(id: number) { const row = await this.client.user.findUnique({ where: { id } }); return row ? storedUser(row) : undefined; }
  async create(input: Omit<StoredUser, "id">) {
    try { return storedUser(await this.client.user.create({ data: input })); }
    catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictError("Já existe um usuário com este e-mail."); throw error; }
  }
}
export function createPrismaRepositories() {
  const client = new PrismaClient();
  return { patients: new PrismaPatientsRepository(client), encounters: new PrismaEncountersRepository(client), medications: new PrismaMedicationsRepository(client), users: new PrismaUsersRepository(client), close: () => client.$disconnect() };
}
