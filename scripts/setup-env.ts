import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".env")) console.log(".env já existe; preservado.");
else {
  writeFileSync(".env", `DATABASE_URL="file:../database/prontuario-entrega.db"\nJWT_SECRET=${randomBytes(32).toString("hex")}\nJWT_EXPIRES_IN=15m\n`, { mode: 0o600 });
  console.log(".env local criado; nenhum segredo foi exibido.");
}
