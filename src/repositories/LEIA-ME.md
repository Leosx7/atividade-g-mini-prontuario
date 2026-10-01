# Repositories — trilhas concluídas

Os ports de Patient, Encounter, Medication e User ficam nos arquivos *.repository.ts e são assíncronos. Services recebem esses contratos. Os adapters *.sqlite.ts preservam o motor legado; prisma.repositories.ts é a persistência do servidor; memory.repositories.ts demonstra o N3.

Somente esta pasta importa driver/client. A composição escolhe adapters; banco interno nunca vaza no JSON. memory recebe cópias dos fixtures, preserva unicidade/referências e não substitui testes de SQL real. Seed seguro aborta colisões de identidade. Regras executáveis: npm run arch.
