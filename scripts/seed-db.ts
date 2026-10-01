import { seedDatabase } from "../src/repositories/prisma.seed";
seedDatabase().catch(error => { console.error(error); process.exitCode = 1; });
