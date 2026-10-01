import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { parse } from "dotenv";
let content = existsSync(".env") ? readFileSync(".env", "utf8") : "";
const values = parse(content);
function setDefault(key: string, value: string) {
  if (values[key]) return;
  content = content.replace(new RegExp(`^${key}=.*$`, "m"), "");
  content += `\n${key}=${value}\n`;
}
setDefault("DATABASE_URL", '"file:../database/prontuario-entrega.db"');
setDefault("JWT_SECRET", randomBytes(32).toString("hex"));
setDefault("JWT_EXPIRES_IN", "15m");
setDefault("SEED_PASSWORD", randomBytes(24).toString("base64url"));
writeFileSync(".env", content, { mode: 0o600 });
console.log(".env preparado; valores existentes preservados e segredos nunca exibidos.");
