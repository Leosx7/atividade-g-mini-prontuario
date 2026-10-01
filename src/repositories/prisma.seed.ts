import argon2 from "argon2";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedData } from "./seed-data";
export async function seedDatabase() {
  const client = new PrismaClient();
  try {
    const password = process.env.SEED_PASSWORD ?? "";
    if (password.length < 12) throw new Error("Configure SEED_PASSWORD no .env com npm run setup.");
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
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
      const accounts = [
        { name: "Admin de demonstração", email: "admin@clinica.local", role: "admin" },
        { name: "Profissional de demonstração", email: "profissional@clinica.local", role: "profissional" },
        { name: "Recepção de demonstração", email: "recepcao@clinica.local", role: "recepcao" },
      ];
      for (const account of accounts) {
        const current = await transaction.user.findUnique({ where: { email: account.email } });
        if (current && current.role !== account.role) throw new Error("Seed abortado: conta de demonstração pertence a outro papel.");
        await transaction.user.upsert({ where: { email: account.email }, create: { ...account, passwordHash }, update: {} });
      }
      for (const patient of seedData.patients) await transaction.patient.upsert({ where: { id: patient.id }, create: { ...patient, active: patient.active ? 1 : 0 }, update: {} });
      for (const encounter of seedData.encounters) await transaction.encounter.upsert({ where: { id: encounter.id }, create: encounter, update: {} });
      for (const medication of seedData.medications) await transaction.medicationRequest.upsert({ where: { id: medication.id }, create: medication, update: {} });
      const professional = await transaction.user.findUniqueOrThrow({ where: { email: "profissional@clinica.local" } });
      await transaction.encounter.updateMany({ where: { id: { in: seedData.encounters.map(encounter => encounter.id) }, professionalId: null }, data: { professionalId: professional.id } });
    });
    console.log("Seed Prisma aplicado: 8 pacientes, 5 atendimentos, 3 prescrições e 3 contas de demonstração. Senha apenas no .env.");
  } finally { await client.$disconnect(); }
}
