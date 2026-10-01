import type { Server } from "node:http";
import { createApp } from "../src/app";
export async function startServer(options: { auth?: boolean } = {}): Promise<{ base: string; server: Server }> {
  // Somente o harness lê TEST_PERSISTENCE; server.ts não tem modo aberto/memória.
  const repositories = process.env.TEST_PERSISTENCE === "memory"
    ? (await import("../src/repositories/memory.repositories")).createMemoryRepositories()
    : (await import("../src/repositories/prisma.repositories")).createPrismaRepositories();
  const application = options.auth
    ? (await import("../src/composition")).createProductionApplication(repositories)
    : { app: createApp(repositories), close: repositories.close };
  return new Promise(resolve => {
    const server = application.app.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ base: `http://127.0.0.1:${port}`, server });
    });
    server.once("close", () => { void application.close(); });
  });
}
export function jsonRequest(base: string) {
  return (path: string, options: RequestInit = {}) => fetch(`${base}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers ?? {}) } });
}
export function randomCns(): string { return `7${Math.floor(Math.random() * 1e14).toString().padStart(14, "0")}`; }
