-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_encounters" (
    "professional_id" INTEGER,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patient_id" INTEGER NOT NULL,
    "started_at" TEXT NOT NULL,
    "chief_complaint" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "encounters_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "encounters_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
INSERT INTO "new_encounters" ("chief_complaint", "id", "notes", "patient_id", "started_at") SELECT "chief_complaint", "id", "notes", "patient_id", "started_at" FROM "encounters";
DROP TABLE "encounters";
ALTER TABLE "new_encounters" RENAME TO "encounters";
CREATE INDEX "idx_encounters_patient" ON "encounters"("patient_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
