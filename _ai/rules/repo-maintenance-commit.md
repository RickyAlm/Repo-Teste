---
id: repo-maintenance-commit
version: 2
description: Commit e push obrigatórios de artefatos do RepoMaster após qualquer alteração.
priority: 65
always_apply: true
applies_to:
  - "**/*"
conflicts_with: []
---

# Repo Maintenance — Commit e Push Obrigatórios

## Regra

**OBRIGATÓRIO:** Após editar qualquer arquivo dentro do escopo abaixo, antes de encerrar a tarefa, executar `git status`. Se houver alterações não commitadas, fazer `add + commit + push` imediatamente.

Esta regra não é opcional. Omitir o commit gera dessincronização entre o RepoMaster e os sistemas dependentes (ClickUp sync, agentes, ferramentas da CLI).

## Escopo (in scope)

- `/_docs/`
- `/_features/`
- `/_bugs/`
- `/_ai/`
- `/.cursor/rules/`
- `/.cursor/skills/`
- `/_scripts/`
- Raiz: `README.md`, `.cursorignore`, `CONTRIBUTING.md`

## Fora do escopo (out of scope)

- Código de aplicação (`api/`, `webapp/`, `sales/`, `gamification/`, etc.)
- Edições feitas exclusivamente pelo usuário, sem intervenção do agente

## Ação obrigatória

```bash
git add <paths>
git status
git commit -m "<type>(<scope>): <description>"
git push origin main
```

Formato de commit conforme `/_docs/standards/commit-conventions.md`.

## Exemplos de mensagens de commit

| Contexto | Mensagem |
|----------|----------|
| Nova feature criada | `feat(_features): add payment-retry-flow feature artifacts` |
| Card atualizado | `feat(_features): update payment-retry-flow card` |
| Spec criada/atualizada | `docs(_features): add payment-retry-flow spec/requirements` |
| Bug criado | `fix(_bugs): add api-event-registration-500 bug artifact` |
| Bug resolvido | `fix(_bugs): mark api-event-registration-500 as resolved` |
| Documentação atualizada | `docs(_docs): update feature-lifecycle standard` |

## Consequências da omissão

- Artefatos invisíveis para outros agentes e ferramentas
- ClickUp sync falha por não encontrar arquivos
- `create-spec` e `orchestrator` não conseguem ler specs recém-criadas
- Histórico do projeto fica inconsistente
