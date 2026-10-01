import type { CreatePatientInput } from "../validation/patients.schemas";

export type Patient = { id: number; name: string; birthDate: string; nationalId: string; photoUrl: string | null; active: boolean };
export interface PatientsRepository {
  findAll(): Promise<Patient[]>;
  findById(id: number): Promise<Patient | undefined>;
  findByNationalId(cns: string): Promise<Patient | undefined>;
  create(input: CreatePatientInput): Promise<number>;
  updatePhoto(id: number, url: string): Promise<void>;
}
