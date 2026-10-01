import type { EncountersRepository, Encounter } from "../repositories/encounters.repository";
import type { PatientsService } from "./patients.service";
import type { User } from "./identity";
import { NotFoundError } from "../errors/HttpError";
import type { CreateEncounterInput } from "../validation/encounters.schemas";
// A autoria é interna: o contrato JSON anterior não ganha campo de infraestrutura.
function publicEncounter(encounter: Encounter) {
  const { professionalId: _professionalId, ...publicFields } = encounter;
  return publicFields;
}
export class EncountersService {
  constructor(private readonly repository: EncountersRepository, private readonly patients: PatientsService) {}
  async listEncountersByPatient(patientId: number) {
    await this.patients.getPatientById(patientId);
    return (await this.repository.findByPatient(patientId)).map(publicEncounter);
  }
  async getEncounterById(id: number) {
    if (!Number.isInteger(id) || id < 1) throw new NotFoundError("Atendimento não encontrado.");
    const encounter = await this.repository.findById(id);
    if (!encounter) throw new NotFoundError("Atendimento não encontrado.");
    return encounter;
  }
  async createEncounter(patientId: number, input: CreateEncounterInput, actor?: User) {
    await this.patients.getPatientById(patientId);
    const id = await this.repository.create(patientId, input, actor?.id);
    return publicEncounter(await this.getEncounterById(id));
  }
}
