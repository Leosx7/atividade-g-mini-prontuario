import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { startServer, jsonRequest, randomCns } from "./helpers";
let server: Server;
let base = "";
let api: ReturnType<typeof jsonRequest>;
const roles = ["admin", "profissional", "recepcao"] as const;
const sessions = new Map<string, { token: string; user: { id: number; name: string; role: string }; email: string; password: string }>();
before(async () => {
  ({ server, base } = await startServer({ auth: true }));
  api = jsonRequest(base);
  for (const role of roles) {
    const email = `${role}.${randomUUID()}@teste.local`;
    const password = randomUUID();
    const register = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name: role, email, password, role }) });
    assert.equal(register.status, 201);
    const user = await register.json() as { id: number; name: string; role: string };
    assert.deepEqual(Object.keys(user).sort(), ["id", "name", "role"]);
    const login = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    assert.equal(login.status, 200);
    const session = await login.json() as { token: string; user: typeof user };
    sessions.set(role, { ...session, email, password });
  }
});
after(() => server.close());
function requestAs(role: string, path: string, body?: unknown) {
  return api(path, { method: body === undefined ? "GET" : "POST", headers: { Authorization: `Bearer ${sessions.get(role)!.token}` }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
test("matriz: todas as portas de dados exigem token", async () => {
  for (const path of ["/api/patients", "/api/patients/1/encounters", "/api/encounters/1/medications", "/api/auth/me"]) assert.equal((await api(path)).status, 401);
  for (const path of ["/api/patients", "/api/patients/1/photo", "/api/patients/1/encounters", "/api/encounters/1/medications"]) assert.equal((await api(path, { method: "POST", body: "{}" })).status, 401);
});
test("matriz completa de leitura, criação, upload e prescrição", async () => {
  for (const role of roles) {
    assert.equal((await requestAs(role, "/api/patients")).status, 200);
    assert.equal((await requestAs(role, "/api/patients/1/encounters")).status, 200);
    assert.equal((await requestAs(role, "/api/patients", { name: `Matriz ${role}`, birthDate: "1990-01-01", nationalId: randomCns() })).status, 201);
    const form = new FormData();
    form.append("photo", new Blob([new Uint8Array(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"))], { type: "image/png" }), "matrix.png");
    assert.equal((await fetch(`${base}/api/patients/2/photo`, { method: "POST", headers: { Authorization: `Bearer ${sessions.get(role)!.token}` }, body: form })).status, 200);
    assert.equal((await requestAs(role, "/api/encounters/1/medications")).status, role === "recepcao" ? 403 : 200);
    const encounter = await requestAs(role, "/api/patients/1/encounters", { startedAt: "2026-09-30T10:00", chiefComplaint: "Matriz" });
    assert.equal(encounter.status, role === "recepcao" ? 403 : 201);
    const id = role === "recepcao" ? 1 : (await encounter.json() as { id: number }).id;
    assert.equal((await requestAs(role, `/api/encounters/${id}/medications`, { medication: "Teste", dosage: "Teste" })).status, role === "profissional" ? 201 : 403);
  }
});
test("JWT expirado, sem expiração, algoritmo diferente e payload inválido recebem 401", async () => {
  const session = sessions.get("profissional")!;
  const secret = process.env.JWT_SECRET!;
  const invalidTokens = [
    jwt.sign(session.user, secret, { expiresIn: -1 }),
    jwt.sign(session.user, secret),
    jwt.sign(session.user, secret, { algorithm: "HS384", expiresIn: "1m" }),
    jwt.sign({ ...session.user, role: "superadmin" }, secret, { expiresIn: "1m" }),
  ];
  for (const token of invalidTokens) assert.equal((await api("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })).status, 401);
  const payload = jwt.decode(session.token) as Record<string, unknown>;
  assert.deepEqual(Object.keys(payload).sort(), ["exp", "iat", "id", "name", "role"]);
});
test("registro duplicado e normalização de e-mail; login curto responde 401 genérico", async () => {
  const session = sessions.get("profissional")!;
  assert.equal((await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Duplicado", email: session.email.toUpperCase(), password: session.password, role: "profissional" }) })).status, 409);
  for (const email of [session.email, `${randomUUID()}@teste.local`]) {
    const response = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password: "x" }) });
    assert.equal(response.status, 401);
    const body = await response.json() as { error: { message: string; statusCode: number; details: unknown } };
    assert.deepEqual(body, { error: { message: "Credenciais inválidas.", statusCode: 401, details: null } });
  }
  assert.equal((await requestAs("profissional", "/api/auth/me")).status, 200);
});
test("upload maior que 2MB preserva 413 e contrato de erro", async () => {
  const form = new FormData();
  form.append("photo", new Blob([new Uint8Array(2 * 1024 * 1024 + 1)], { type: "image/png" }), "large.png");
  const response = await fetch(`${base}/api/patients/2/photo`, { method: "POST", headers: { Authorization: `Bearer ${sessions.get("profissional")!.token}` }, body: form });
  assert.equal(response.status, 413);
  const body = await response.json() as { error: { statusCode: number } };
  assert.equal(body.error.statusCode, 413);
});

test("JSON malformado de AUTH responde 400 sem registrar corpo ou credenciais", async t => {
  const logs: unknown[][] = [];
  t.mock.method(console, "error", (...args: unknown[]) => { logs.push(args); });
  for (const path of ["/api/auth/login", "/api/auth/register"]) {
    const response = await api(path, { method: "POST", body: `{"password":"${randomUUID()}",` });
    assert.equal(response.status, 400);
    const body = await response.json() as { error: { statusCode: number } };
    assert.equal(body.error.statusCode, 400);
  }
  assert.equal(logs.length, 0);
});
test("cadastros concorrentes com o mesmo e-mail preservam 201/409", async () => {
  const input = { name: "Concorrência", email: `${randomUUID()}@teste.local`, password: randomUUID(), role: "profissional" };
  const responses = await Promise.all([1, 2].map(() => api("/api/auth/register", { method: "POST", body: JSON.stringify(input) })));
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
});
