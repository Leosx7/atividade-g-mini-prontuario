# Prisma — ORM concluída

1. Foi criado o scaffold, preservando esta pasta pré-existente; prisma init recusou a pasta já fornecida pela base.
2. prisma db pull introspectou o banco original.
3. Models e campos receberam @map/@@map; datas são String e active é Int traduzido no adapter.
4. Adapters Prisma mantiveram os ports da ARQ; client gerado com Prisma 6.
5. Baseline 0_init marcada no diagnóstico; novo banco de entrega criado por migrate deploy. A migration create_users acrescenta users e autoria.

Em instalação nova: npm run setup; npm run db:generate; npm run db:deploy; npm run db:seed. URL file:../database/prontuario-entrega.db é relativa a prisma/. Schema só muda por migration; migrations aplicadas são imutáveis. Arquivos SQL legados foram preservados. Não conectar migrate dev ao banco legado original sem tratar a diferença de nomenclatura do índice UNIQUE descrita no IA.md.
