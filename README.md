# Atividade G — Mini-Prontuário T3

**Instituição:** Instituto Federal do Piauí — IFPI  
**Curso:** Tecnologia em Análise e Desenvolvimento de Sistemas  
**Disciplina:** Programação para Internet II — ADS IV — 2026.2  
**Professor:** Rogério Silva  
**Aluno:** Leonardo José Alencar de Carvalho

Implementação das trilhas ARQ, ORM e AUTH e do Nível 3, caminho B. O frontend original permanece congelado. O projeto-base é de rogeriosilva-ifpi/ifpi-ads-2026.2-internet-ii, pasta topico3/base-mini-prontuario-t3, commit original `0b3da239c9a1c402035b7e07787606f37a7f956b`.

## O que foi concluído

| Nível | Resultado |
|---|---|
| N1 — ARQ | ARQ-1..3: ports assíncronos e adapters SQLite; SQL e mapeamento saem dos services. ARQ-4/5: controller deixa o banco, service deixa Express. ARQ-6: quarta regra impede import do driver fora de repositories. |
| N1 — ORM | ORM-1..5: introspecção, `@map`/`@@map`, client gerado, adapters Prisma nos mesmos ports e baseline `0_init`. Nenhum service mudou durante a troca de SQLite por Prisma. |
| N2 — AUTH | AUTH-1..8: 401/403, migration users/autoria, register/login/me, Argon2id, JWT HS256, validação e matriz completa. A autoria da prescrição é verificada no service. |
| N3 — caminho B | Quatro adapters em memória, inclusive usuários, repetindo smoke, ataques e matriz sem abrir banco. Decisão e custos em `docs/adr/0001-adapter-em-memoria.md`. |

## Instalação e execução

Requisitos: **Node 22**, npm, Git Bash/Bash para `gate.sh` e **gitleaks no PATH** para a quarta checagem. Não usar Node 24 nesta base: o better-sqlite3 fornecido não tem o binário correspondente no ambiente testado. Não há biblioteca nova de aplicação.

Na pasta deste README:

```bash
npm ci
npm run setup
npm run db:generate
npm run db:deploy
npm run db:seed
npm run gate
npm run dev
```

Abra `http://localhost:3000`. O setup gera `.env` local, sem imprimir segredos. O caminho do SQLite é relativo à pasta `prisma/`: `file:../database/prontuario-entrega.db`. A montagem do servidor sempre exige autenticação; falta de JWT_SECRET forte impede inicialização.

Contas **fictícias de demonstração**:

| E-mail | Papel |
|---|---|
| `admin@clinica.local` | admin |
| `profissional@clinica.local` | profissional |
| `recepcao@clinica.local` | recepcao |

A senha dessas contas é o valor **local** de `SEED_PASSWORD` no `.env`, gerado por `npm run setup`. Não é enviada no repositório/ZIP. Os atendimentos do seed ficam vinculados ao profissional de demonstração para testar prescrição. O seed não substitui contas existentes e aborta se IDs de fixture pertencerem a outras identidades. Não usar o seed sobre banco com dados reais.

## Comandos

| Script | Função |
|---|---|
| `setup` | Completa configuração local sem divulgar nem substituir valores existentes |
| `db:generate` | Gera Prisma Client |
| `db:deploy` | Aplica migrations versionadas; não reseta banco |
| `db:seed` | Insere dados fictícios e contas, com verificação de colisões |
| `db:reset` | Recria banco por `prisma migrate reset`; **apaga dados**, apenas para banco descartável |
| `dev` | Sobe servidor protegido, com recarga |
| `check` | TypeScript strict, sem emissão |
| `arch` | Quatro regras executáveis de arquitetura |
| `test` | Smoke, ataques, matriz, contratos de memória e segurança do seed |
| `test:memory` | Smoke original, ataques e matriz usando memória e URL sentinela inválida |
| `verify:requests` | Executa os casos A1–A7 em servidor protegido de porta efêmera |
| `gate` | Script original: tipos, arquitetura, testes e gitleaks |

Depois da baseline, esquema só muda por `prisma migrate dev --name descricao`. Migrations aplicadas nunca são editadas. `database/schema.sql` e `database/seed.sql` são históricos preservados. O banco usado no diagnóstico inicial foi preservado; a entrega foi validada em banco novo, sem contornar o bloqueio do reset destrutivo.

## Arquitetura

`server.ts` liga a montagem de produção de `composition.ts`. `app.ts` monta Express recebendo ports. Rotas encaminham para controllers e aplicam middlewares; controllers traduzem HTTP; services decidem; repositories persistem e traduzem formatos. Prisma, SQLite e memória implementam os mesmos contratos.

O domínio recebe `{ id, name, role }`, sem tipos Express. A conexão/driver só aparece em `src/repositories/`. `active` continua boolean no JSON; datas mantêm os formatos originais; `photoUrl` e opcionais mantêm null; listas preservam ordenação. UNIQUE/P2002 é traduzido para 409, inclusive em inserções concorrentes.

`tests/api.smoke.test.ts` permanece original. Para compatibilizar a definição congelada da API aberta de ARQ/ORM com AUTH, o harness sobe explicitamente uma montagem de regressão sem autenticação. A suíte AUTH usa **a mesma composição protegida do servidor**. Não existe flag HTTP ou variável de ambiente que desative autenticação no servidor. `TEST_PERSISTENCE` é lida somente pelo harness.

## Matriz de permissões

| Ação | admin | profissional | recepcao | Sem token |
|---|---|---|---|---|
| Ver pacientes/atendimentos | Sim | Sim | Sim | 401 |
| Criar paciente / enviar foto | Sim | Sim | Sim | 401 |
| Registrar atendimento | Sim | Sim | 403 | 401 |
| Ver prescrições | Sim | Sim | 403 | 401 |
| Prescrever | 403 | Somente no próprio atendimento | 403 | 401 |

Admin pode registrar atendimento, mas não prescrever. Mesmo dois usuários profissionais não podem prescrever nos atendimentos um do outro. A verificação fina usa `professional_id` no domínio, não só o middleware.

## Resposta ao TODO AUTH-4

No **registro**, a senha mínima é uma regra para criar uma credencial aceitável: senha curta recebe 400 com os detalhes de validação. No **login**, a credencial deve ser verificada sem dar pistas adicionais sobre a política ou sobre a existência da conta. Senha curta, senha incorreta e e-mail inexistente recebem o mesmo 401 e a mensagem `Credenciais inválidas.`. Exigir mínimo de oito caracteres no schema de login interromperia a autenticação com um 400 diferente. O login também paga uma verificação Argon2 com hash fictício quando o e-mail não existe, reduzindo a diferença temporal; isto não elimina todos os canais laterais possíveis.

## Evidências e integridade

- Saídas reais e completas por trilha em `docs/evidencias/` e no `IA.md`.
- `auth-requests-a1-a7.txt`: 201, 200, 401, 401, 403, 401 e 401.
- `n3-memory-final.txt`: smoke, ataques, matriz e contratos repetidos em memória, zero falhas e SKIP.
- `gate-final.txt`: resultado final com Prisma, sem checagem de segredos pulada.
- `ui-login.png` e `ui-autenticada.png`: login real no Chrome headless usando frontend original e dados fictícios.
- Verificação contra a base original: `public/`, `tests/api.smoke.test.ts`, `gate.sh` e `database/schema.sql` intactos; régua original somente acrescida de ARQ-6.

As capturas e logs representam execuções reais; os números de duração, portas e registros gerados variam entre execuções. Os testes gravam dados fictícios e uploads no banco usado para testes. A ADR explicita que memória não substitui provas de migrations, durabilidade e concorrência entre processos.

## Limites didáticos e auditoria de dependências

O cadastro público aceita o papel no corpo porque este é o contrato fornecido pela atividade. Antes de uso real, concessão de papéis precisa ser administrativa; não publicar esta demonstração como prontuário clínico real. Fotos seguem o contrato original de `/uploads` estático. JWT mantém papel até expirar; refresh/revogação não é o caminho N3 escolhido. Payload não leva senha, hash, e-mail ou CNS. `.env`, tokens e bancos não são enviados na entrega.

O `npm audit` da árvore fornecida reportou **4 alertas: 3 altos e 1 moderado**, documentados em `docs/evidencias/npm-audit.json`. São dependências transitivas da ferramenta Prisma/config e da verificação de arquitetura. Não foi executado `audit fix --force`: ele propõe Prisma 6.12.0 fora da faixa da base e não é parte das trilhas. Gate verde prova os critérios executáveis da atividade, não ausência universal de vulnerabilidades.

## Autoavaliação — texto-base para revisão do aluno

A decisão técnica mais delicada do projeto foi manter os testes de regressão originais e, ao mesmo tempo, proteger todas as portas exigidas pela matriz. A solução separa a montagem aberta de regressão da composição autenticada do servidor. Isso preserva o contrato anterior sem criar um bypass na aplicação executada pelo usuário. Outra decisão importante foi adotar ports assíncronos na ARQ: o Prisma pôde substituir o driver sem modificar os services na trilha ORM.

Na revisão assistida, foi corrigido o risco de o seed anexar registros fictícios a identidades diferentes com IDs coincidentes. Também foi corrigido o logger que poderia divulgar credenciais em JSON malformado. A proposta de mudar Prisma apenas por depreciação foi recusada tecnicamente por não resolver um defeito da atividade e ampliar a troca de versão; os alertas concretos do audit ficaram registrados, sem afirmar que não existem. Esta triagem foi preparada pelo agente e deve ser lida criticamente pelo aluno antes da entrega.

Começando novamente, eu planejaria desde o início o ciclo de vida dos clients, o banco descartável de validação e o seed com identidade explícita. Manteria commits por trilha, gates com saídas reais e revisões independentes, pois a separação entre uma afirmação de funcionamento e uma prova executável foi o principal aprendizado do trabalho. Este texto-base não substitui a explicação pessoal do código e a validação crítica exigidas pela disciplina.

## Recebimento do código

O ZIP contém os arquivos do projeto; o arquivo `.bundle` separado preserva o histórico Git do repositório completo. Para restaurar o histórico: `git clone Historico_Atividade_G.bundle atividade-g`, depois abrir `atividade-g/topico3/base-mini-prontuario-t3`. Em checkout Git, o gate original verifica também segredos no histórico. Um ZIP extraído não contém `.git`: restaure pelo bundle para essa checagem, ou inicialize um repositório de validação local. Não editar o gate para dispensar o Git.
