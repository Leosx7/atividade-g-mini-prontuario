import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/repositories/prisma.seed";
test("seed aborta colisão de identidade sem anexar registros fictícios", async () => {
  const database = join(tmpdir(), `mini-prontuario-seed-${randomUUID()}.db`);
  const url = `file:${database.replaceAll("\\", "/")}`;
  const deployment = spawnSync(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"], { env: { ...process.env, DATABASE_URL: url }, encoding: "utf8" });
  assert.equal(deployment.status, 0, "migrations devem criar o banco temporário de teste");
  const client = new PrismaClient({ datasourceUrl: url });
  const previousUrl = process.env.DATABASE_URL;
  try {
    await client.patient.create({ data: { id: 1, name: "Outro cadastro", birthDate: "2000-01-01", nationalId: randomUUID(), active: 1 } });
    process.env.DATABASE_URL = url;
    await assert.rejects(() => seedDatabase(), /Seed abortado: ID de paciente ocupado/);
    assert.equal(await client.patient.count(), 1);
    assert.equal(await client.encounter.count(), 0);
    assert.equal(await client.medicationRequest.count(), 0);
  } finally {
    if (previousUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousUrl;
    await client.$disconnect();
    await rm(database, { force: true });
  }
});
