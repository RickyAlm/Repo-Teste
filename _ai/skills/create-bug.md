---
name: create-bug
description: Cria artefato de bug em _bugs/{ano}/{sprint}/{bug-slug}/ com contexto crítico para resolução. Primeiro passo do fluxo (create-bug -> resolve-bug).
version: 3
entrypoint: true
required_rules:
  - /_ai/rules/ttz-features.md
  - /_ai/rules/repo-maintenance-commit.md
  - /_ai/rules/commit-conventions.md
  - /_ai/rules/branch-naming.md
  - /_ai/rules/testing-policy.md
  - /_ai/rules/no-code-comments.md
  - /_ai/rules/professional-profile.md
  - /_ai/rules/language-boundaries.md
required_references:
  - /_docs/standards/bug-lifecycle.md
  - /_docs/standards/assignee-defaults.md
  - /_docs/standards/language-boundaries.md
outputs:
  - _bugs/{ano}/{sprint}/{bug-slug}/bug.md
stability: stable
---

# Create Bug

Cria artefato de bug crítico e completo em `/_bugs/`. Um bug é um artefato isolado (sem cards múltiplos, sem spec por padrão). O artefato serve como base para a skill `resolve-bug` atuar na resolução.

## Fluxo de evolução

Ver `/_docs/standards/bug-lifecycle.md`:

- **create-bug**: documenta bug com contexto crítico, cria artefato pronto para resolução
- **resolve-bug**: analisa artefato, investiga causa raiz, orienta implementação da correção

## Diferença de features

- Bugs vivem em `/_bugs/`, não em `/_features/`
- Um bug = um artefato (`bug.md`), não múltiplos cards
- Branch: `fix/{bug-slug}` (não `feature/`)
- PR deve apontar para `main` **e** `staging` (SLA curto)
- Sem `feature.config.yml`; metadata vive no frontmatter do `bug.md`
- Sem spec por padrão (exceções: bugs complexos que exigem investigação profunda)

## Workflow

### 1. Carregar contexto de domínio

Ler `/_docs/project-context/README.md` para domínio ativo; carregar personas, aplicações, módulos e glossário.

### 2. Investigar o bug (perguntas críticas, uma por vez)

Estas perguntas devem extrair o máximo de contexto para que `resolve-bug` tenha tudo que precisa:

1. **Qual o comportamento incorreto?** Descrever o que está acontecendo de errado.
2. **Qual o comportamento esperado?** Como deveria funcionar.
3. **Qual persona/usuário é afetado?** Quem reportou ou quem sofre o impacto.
4. **Em qual módulo/app ocorre?** Identificar projeto e área específica.
5. **Quais passos reproduzem o bug?** Sequência exata para reproduzir.
6. **Qual a severidade?** critical (sistema indisponível), high (funcionalidade principal quebrada), medium (funcionalidade secundária), low (cosmético/menor).
7. **Há logs, screenshots ou evidências?** Coletar referência a evidências.
8. **Há hipótese sobre a causa?** Se o reporter tem palpite, registrar.

### 3. Avaliar complexidade e severidade

**Complexidade** (para alocação):

- **high**: múltiplos projetos afetados, causa raiz não óbvia, requer investigação profunda
- **medium**: um projeto, causa provável identificada, correção moderada
- **low**: causa clara, correção pontual

**Severidade** (para priorização):

- **critical**: sistema indisponível ou dados corrompidos; SLA imediato
- **high**: funcionalidade principal quebrada; SLA curto
- **medium**: funcionalidade secundária com workaround; SLA padrão
- **low**: cosmético ou edge case raro; próximo sprint

### 4. Sugerir assignee

Consultar `/_docs/standards/assignee-defaults.md` (DEVELOPERS). Filtrar devs cujo `projects` inclui o projeto do bug e cuja `complexity` inclui a complexidade avaliada. Para bugs critical/high, preferir devs Senior. Se o usuário definir assignee explicitamente, respeitar.

### 5. Determinar ano e sprint

- **Ano**: 4 dígitos. Padrão: ano atual.
- **Sprint**: slug válido de `/_ttz/sprints.json`. Padrão: sprint atual.

### 6. Gerar bug-slug

kebab-case, inglês, legível, descritivo do problema. Ex.: `api-event-registration-500`, `admin-dashboard-blank-page`, `payment-double-charge`.

### 7. Criar bug.md

Criar `/_bugs/{ano}/{sprint}/{bug-slug}/bug.md` com frontmatter completo e seções detalhadas.

**Frontmatter obrigatório:**

```yaml
---
titulo: Descrição concisa do bug
modulo: modulo-afetado
status: aberto
tags: [bug]
taskType: bug
complexity: high | medium | low
severity: critical | high | medium | low
product: Produto (de /_ttz/metadata.json)
affected_projects: [api, webapp-nightly]
---
```

**Frontmatter opcional:** `assignee`, `points`. `clickup_id` e `clickup_url` são escritos automaticamente pelo sync.

**product:** Deve ser um dos produtos de `/_ttz/metadata.json`. Se não souber, usar `modulo` com palavras que permitam inferência. O sync usa inferProduto(modulo, apps) quando product ausente.

### 8. Seções do bug.md (body)

```markdown
### Contexto

Descrição do bug. Onde ocorre, quando foi detectado, quem reportou.

### Comportamento Atual

O que está acontecendo de errado. Ser específico: mensagens de erro, comportamento visual, dados incorretos.

### Comportamento Esperado

Como o sistema deveria se comportar. Descrever o fluxo correto.

### Passos para Reproduzir

1. Passo 1
2. Passo 2
3. Passo 3

### Impacto

Quantos usuários afetados, frequência de ocorrência, workaround existente.

### Evidências

Links para logs, screenshots, gravações. Se não houver: "_Sem evidências registradas._"

### Hipótese Inicial

Se houver palpite sobre a causa raiz, registrar aqui. Se não: "_Nenhuma hipótese levantada. Aguarda investigação via resolve-bug._"

### Critérios de Aceitação

- [ ] Bug não ocorre mais ao seguir os passos de reprodução
- [ ] Testes unitários/integração cobrem o cenário corrigido
- [ ] Nenhuma regressão em funcionalidades relacionadas
```

### 9. Checklist antes de gerar

- [ ] bug.md: titulo, modulo, product, complexity, severity, tags, taskType preenchidos
- [ ] affected_projects lista projetos corretos (subprojetos do RepoMaster)
- [ ] product existe em `/_ttz/metadata.json` ou modulo permite inferProduto
- [ ] Passos para reproduzir são claros e acionáveis
- [ ] Comportamento atual vs esperado está explícito
- [ ] Impacto e severidade condizentes
- [ ] Artefato pronto para resolve-bug atuar sem perguntas adicionais

### 10. Commit obrigatório (OBRIGATÓRIO — não omitir)

**Após criar o artefato**, executar imediatamente conforme `/_ai/rules/repo-maintenance-commit.md`:

```bash
git add _bugs/{ano}/{sprint}/{bug-slug}/
git status
git commit -m "fix(_bugs): add {bug-slug} bug artifact"
git push origin main
```

> **Atenção:** Esta etapa é obrigatória e não deve ser pulada. A ausência do commit gera falha de sincronização — `resolve-bug` e o ClickUp sync dependem do artefato persistido.

### 11. Próximos passos (informar ao usuário)

Após criar e commitar o artefato:

1. **Sync com ClickUp**: `ttz` → menu → "Sync bugs com ClickUp" para criar o card no ClickUp
2. **Resolver**: rodar skill `resolve-bug` passando o caminho do artefato
3. **Branch**: a CLI criará branch `fix/{bug-slug}` nos projetos afetados
