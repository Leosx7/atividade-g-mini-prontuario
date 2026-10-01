import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
// Desde ORM, recriar o esquema é responsabilidade exclusiva das migrations.
const result = spawnSync(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", "reset", "--force"], { stdio: "inherit" });
process.exitCode = result.status ?? 1;
