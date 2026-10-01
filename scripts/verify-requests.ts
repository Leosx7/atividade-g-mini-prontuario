import { setTimeout } from "node:timers/promises";
import { randomUUID } from "node:crypto";
import { createProductionApplication } from "../src/composition";
// Espelho A1–A7 de requests.http; só status sai no log, nunca tokens ou senhas.
process.env.JWT_EXPIRES_IN = "5s";
const application = createProductionApplication();
const server = application.app.listen(0);
await new Promise<void>(resolve => server.once("listening", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Porta de teste não encontrada.");
const base = `http://127.0.0.1:${address.port}`;
function request(path: string, body?: unknown, token?: string) {
  return fetch(`${base}${path}`, { method: body === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
function verify(name: string, response: Response, expected: number) {
  console.log(`${name}: HTTP ${response.status}; esperado ${expected}`);
  if (response.status !== expected) throw new Error(`${name}: status inesperado`);
}
try {
  const email = `requests.${randomUUID()}@teste.local`;
  const password = randomUUID();
  verify("A1 registro", await request("/api/auth/register", { name: "Profissional Requests", email, password, role: "profissional" }), 201);
  const login = await request("/api/auth/login", { email, password });
  verify("A2 login", login, 200);
  const { token } = await login.json() as { token: string };
  const encounter = { startedAt: "2026-09-30T10:00", chiefComplaint: "Requests" };
  verify("A3 sem token", await request("/api/patients/1/encounters", encounter), 401);
  const parts = token.split(".");
  const adulterated = `${parts[0]}.${parts[1]!.slice(0, -2)}AA.${parts[2]}`;
  verify("A4 token adulterado", await request("/api/patients/1/encounters", encounter, adulterated), 401);
  const receptionEmail = `requests.recepcao.${randomUUID()}@teste.local`;
  verify("apoio registro recepção", await request("/api/auth/register", { name: "Recepção Requests", email: receptionEmail, password, role: "recepcao" }), 201);
  const receptionLogin = await request("/api/auth/login", { email: receptionEmail, password });
  const reception = await receptionLogin.json() as { token: string };
  verify("A5 recepção prescreve", await request("/api/encounters/1/medications", { medication: "Teste", dosage: "Teste" }, reception.token), 403);
  verify("A6 senha incorreta", await request("/api/auth/login", { email, password: "incorreta" }), 401);
  await setTimeout(6000);
  verify("A7 token expirado", await request("/api/auth/me", undefined, token), 401);
} finally {
  await new Promise<void>(resolve => server.close(() => resolve()));
  await application.close();
}
