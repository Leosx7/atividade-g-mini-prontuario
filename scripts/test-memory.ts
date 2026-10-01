import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
// URL deliberadamente inutilizável: qualquer tentativa de abrir Prisma/SQLite falha.
const result = spawnSync(process.execPath, [resolve("node_modules/tsx/dist/cli.mjs"), "--test", "tests/api.smoke.test.ts", "tests/auth.attacks.test.ts", "tests/auth.matrix.test.ts", "tests/memory.contract.test.ts"], {
  stdio: "inherit", env: { ...process.env, TEST_PERSISTENCE: "memory", DATABASE_URL: "file:./__memory_must_not_open__/never.db" },
});
process.exitCode = result.status ?? 1;
