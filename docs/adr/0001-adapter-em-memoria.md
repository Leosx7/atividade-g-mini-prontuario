# ADR-0001: Segundo adapter em memória para verificar os ports

- **Status:** aceito no plano autorizado
- **Data:** 2026-09-30
- **Autor:** Leonardo José Alencar de Carvalho, com implementação assistida por Codex

## Contexto
ARQ introduziu ports assíncronos e ORM substituiu SQL direto por Prisma. Precisamos demonstrar que as regras e os testes HTTP dependem desses contratos, não de um banco específico. O smoke original está congelado e deve executar com o segundo adapter.

## Decisão
Usaremos InMemoryPatientsRepository, InMemoryEncountersRepository e InMemoryMedicationsRepository com os mesmos ports. InMemoryUsersRepository permite repetir também os ataques e a matriz AUTH. O servidor continua usando Prisma; apenas o harness de testes seleciona memória.

## Alternativas consideradas
- Refresh token com rotação: acrescenta política de sessão, persistência e revogação; escolhemos provar as fronteiras sem ampliar o contrato HTTP.
- Mockar respostas HTTP: não comprova services, validação, upload ou erros reais; recusado por ocultar regressões.
- Usar SQLite temporário como segundo adapter: valida um banco, mas não demonstra independência da persistência.

## Consequências
Os testes sobem Express real, repetem contratos, mantêm dados fictícios isolados e não abrem banco. O script usa DATABASE_URL deliberadamente inválida para denunciar acesso acidental ao driver. O smoke não muda; a matriz e os ataques também executam em memória.

Quando o repository em memória mente: não reproduz locks entre processos, transações e isolamento do SQLite, afinidade de tipos, durabilidade, limites de arquivo, crash recovery ou todos os detalhes de collation Unicode. Checagens de referências e unicidade aqui são em JavaScript, não constraints do banco. Dados desaparecem ao reiniciar. Passar em memória não dispensa os testes com Prisma e migrations reais.

Não usamos os adapters em memória em produção e não tratamos seus testes como prova de desempenho ou concorrência entre processos.
