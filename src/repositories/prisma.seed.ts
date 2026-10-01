import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedData } from "./seed-data";
export async function seedDatabase() {
  const client = new PrismaClient();
  try {
    await client.$transaction(async transaction => {
      // IDs fixos são seguros somente se pertencem aos mesmos dados fictícios.
      for (const expected of seedData.patients) {
        const current = await transaction.patient.findUnique({ where: { id: expected.id } });
        if (current && current.nationalId !== expected.nationalId) throw new Error("Seed abortado: ID de paciente ocupado por outro cadastro.");
      }
      for (const expected of seedData.encounters) {
        const current = await transaction.encounter.findUnique({ where: { id: expected.id } });
        if (current && (current.patientId !== expected.patientId || current.startedAt !== expected.startedAt || current.chiefComplaint !== expected.chiefComplaint)) throw new Error("Seed abortado: ID de atendimento ocupado por outro registro.");
      }
      for (const expected of seedData.medications) {
        const current = await transaction.medicationRequest.findUnique({ where: { id: expected.id } });
        if (current && (current.encounterId !== expected.encounterId || current.medication !== expected.medication || current.dosage !== expected.dosage)) throw new Error("Seed abortado: ID de prescrição ocupado por outro registro.");
      }
      for (const patient of seedData.patients) await transaction.patient.upsert({ where: { id: patient.id }, create: { ...patient, active: patient.active ? 1 : 0 }, update: {} });
      for (const encounter of seedData.encounters) await transaction.encounter.upsert({ where: { id: encounter.id }, create: encounter, update: {} });
      for (const medication of seedData.medications) await transaction.medicationRequest.upsert({ where: { id: medication.id }, create: medication, update: {} });
    });
    console.log("Seed Prisma aplicado: 8 pacientes, 5 atendimentos e 3 prescrições fictícias.");
  } finally { await client.$disconnect(); }
}
