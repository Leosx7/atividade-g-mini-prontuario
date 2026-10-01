import { test } from "node:test";
import assert from "node:assert/strict";
import { createMemoryRepositories } from "../src/repositories/memory.repositories";
test("memória: instâncias isoladas e cópias impedem mutação externa", async () => {
  const first = createMemoryRepositories();
  const second = createMemoryRepositories();
  const row = (await first.patients.findById(1))!;
  row.name = "Mutação externa";
  assert.notEqual((await first.patients.findById(1))!.name, row.name);
  const id = await first.patients.create({ name: "Novo", birthDate: "2000-01-01", nationalId: "999999999999999" });
  assert.equal(await second.patients.findById(id), undefined);
});
test("memória: unicidade e referências não são ignoradas", async () => {
  const repositories = createMemoryRepositories();
  await assert.rejects(() => repositories.patients.create({ name: "Duplicado", birthDate: "2000-01-01", nationalId: "700012345678901" }), { statusCode: 409 });
  await assert.rejects(() => repositories.encounters.create(999999, { startedAt: "2026-09-30T10:00", chiefComplaint: "Fantasma" }), { statusCode: 404 });
  await assert.rejects(() => repositories.medications.create(999999, { medication: "Teste", dosage: "Teste" }), { statusCode: 404 });
});
