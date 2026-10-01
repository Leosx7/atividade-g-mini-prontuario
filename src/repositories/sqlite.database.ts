import "dotenv/config";
import Database from "better-sqlite3";
import { resolve } from "node:path";
// Adapters SQLite e Prisma respeitam a mesma URL, relativa à pasta prisma/.
const url = process.env.DATABASE_URL ?? "file:../database/prontuario-entrega.db";
if (!url.startsWith("file:")) throw new Error("SQLite exige DATABASE_URL file:.");
export const DATABASE_FILE = resolve(process.cwd(), "prisma", url.slice(5));
export const db = new Database(DATABASE_FILE);
db.pragma("foreign_keys = ON");
