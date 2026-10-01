import "dotenv/config";
import { createApp } from "./app";
import { createPrismaRepositories } from "./repositories/prisma.repositories";
import { AuthService } from "./services/auth.service";
import type { SignOptions } from "jsonwebtoken";
export function createProductionApplication() {
  const secret = process.env.JWT_SECRET ?? "";
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "15m";
  if (!/^\d+(s|m|h|d)$/.test(expiresIn)) throw new Error("JWT_EXPIRES_IN deve ser duração como 15m ou 5s.");
  const repositories = createPrismaRepositories();
  const authentication = { service: new AuthService(repositories.users, secret, expiresIn as SignOptions["expiresIn"]), secret };
  return { app: createApp(repositories, authentication), close: repositories.close };
}
