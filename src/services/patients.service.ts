import type { PatientsRepository } from "../repositories/patients.repository";
import { ConflictError, NotFoundError } from "../errors/HttpError";
import type { CreatePatientInput } from "../validation/patients.schemas";

export class PatientsService {
  constructor(private readonly repository: PatientsRepository) {}
  listPatients() { return this.repository.findAll(); }
  async getPatientById(id: number) {
    if (!Number.isInteger(id) || id < 1) throw new NotFoundError("Paciente não encontrado.");
    const patient = await this.repository.findById(id);
    if (!patient) throw new NotFoundError("Paciente não encontrado.");
    return patient;
  }
  async createPatient(input: CreatePatientInput) {
    if (await this.repository.findByNationalId(input.nationalId)) throw new ConflictError("Já existe um paciente com este CNS.");
    return this.getPatientById(await this.repository.create(input));
  }
  async setPatientPhoto(id: number, photoUrl: string) {
    await this.getPatientById(id);
    await this.repository.updatePhoto(id, photoUrl);
    return this.getPatientById(id);
  }
}
