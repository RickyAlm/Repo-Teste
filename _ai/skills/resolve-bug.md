---
name: resolve-bug
description: Analisa artefato de bug em _bugs/ e orienta a resolução (análise, passos, código sugerido).
version: 4
entrypoint: true
required_rules:
  - /_ai/rules/ttz-features.md
  - /_ai/rules/repo-maintenance-commit.md
  - /_ai/rules/commit-conventions.md
  - /_ai/rules/testing-policy.md
  - /_ai/rules/no-code-comments.md
  - /_ai/rules/professional-profile.md
  - /_ai/rules/language-boundaries.md
required_references:
  - /_docs/standards/bug-lifecycle.md
  - /_docs/standards/assignee-defaults.md
  - /_docs/standards/language-boundaries.md
outputs: []
stability: stable
---

# Resolve Bug

Analisa o artefato de bug em `_bugs/{ano}/{sprint}/{bug-slug}/bug.md` e orienta a resolução. O artefato contém contexto, passos para reproduzir, impacto e hipóteses iniciais.

## Quando usar

- Usuário recebeu instrução após `ttz card:start` em card de bug
- Artefato em `_bugs/` foi criado (via skill `create-bug` ou `card:start`) e precisa ser resolvido

## Workflow

### 1. Carregar artefato

Ler o arquivo informado (ex.: `_bugs/2026/sprint-02/bug-slug/bug.md`). Validar frontmatter (titulo, modulo, severity, complexity, affected_projects, tags, clickup_id, clickup_url, status).

### 2. Analisar contexto

- Entender o comportamento atual vs esperado
- Avaliar severidade e impacto
- Identificar módulo/app afetado (de `affected_projects` e `modulo`)
- Localizar código relevante no projeto

### 3. Investigar causa raiz

- Usar hipótese inicial do artefato como ponto de partida
- Buscar código no(s) projeto(s) afetado(s)
- Analisar logs, traces, ou evidências referenciadas
- Descrever causa provável do bug com referência ao código

### 4. Propor solução

- Sugerir alterações (código, config, migração)
- Incluir critérios para validar a correção
- Priorizar correção mínima (não refatorar além do necessário)

### 5. Orientar implementação

- Passos concretos para implementar a correção
- Considerar testes (unitários ou integração) para evitar regressão
- Sugerir commit message (`fix:` conforme convenções)
- Branch: `fix/{bug-slug}` nos projetos de `affected_projects`
- PR para `main` e `staging` (bugs têm SLA curto)

### 6. Atualizar status e commitar (OBRIGATÓRIO — não omitir)

Após resolução, atualizar frontmatter do `bug.md`:

```yaml
status: resolvido
```

Em seguida, executar imediatamente conforme `/_ai/rules/repo-maintenance-commit.md`:

```bash
git add _bugs/{ano}/{sprint}/{bug-slug}/bug.md
git status
git commit -m "fix(_bugs): mark {bug-slug} as resolved"
git push origin main
```

> **Atenção:** Esta etapa é obrigatória. A atualização de status sem commit deixa o artefato dessincronizado — o ClickUp sync e demais ferramentas dependem do estado persistido.

## Restrições

- Não criar spec nem feature; bugs são artefatos isolados
- Manter referência ao clickup_url para rastreabilidade
- Não refatorar código além do escopo do bug
