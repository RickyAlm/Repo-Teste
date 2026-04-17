---
name: create-spec
description: Cria spec em fases (requirements -> design -> tasks) com revisão humana em cada etapa.
version: 3
entrypoint: true
required_rules:
  - /_ai/rules/ttz-features.md
  - /_ai/rules/repo-maintenance-commit.md
  - /_ai/rules/commit-conventions.md
  - /_ai/rules/testing-policy.md
  - /_ai/rules/no-code-comments.md
  - /_ai/rules/professional-profile.md
  - /_ai/rules/language-boundaries.md
  - /_ai/rules/backend-api-development.md
required_references:
  - /_docs/standards/feature-lifecycle.md
  - /_docs/standards/feature-brief.md
  - /_docs/standards/language-boundaries.md
outputs:
  - _features/{ano}/{sprint}/{feature-slug}/spec/requirements.md
  - _features/{ano}/{sprint}/{feature-slug}/spec/design.md
  - _features/{ano}/{sprint}/{feature-slug}/spec/tasks.md
stability: stable
---

# Create Spec

Cria especificação técnica em fases, em `/_features/{ano}/{sprint}/{slug}/spec/`. Cada fase exige revisão do arquiteto antes de prosseguir. Todo o conteúdo deve ser escrito em português.

Obrigatório: usuário deve informar qual feature evoluir (ano, sprint, slug).

## Fluxo de evolução

Ver `/_docs/standards/feature-lifecycle.md`:

- create-feature: cria feature + 1 card único (outcome doc)
- create-card: adiciona cards (refinamento)
- create-spec: formaliza em fases com revisão humana

Traceability: requirements derivam do brief.md e dos cards. Novos cards podem exigir atualização de requirements.

## Workflow em fases

### 1. Resolver feature alvo

- Usuário informa feature (ano, sprint, slug) ou slug + desambiguação
- Verificar se existe `/_features/{ano}/{sprint}/{slug}/` com `card.md`
- Ler `brief.md` da feature como fonte principal de contexto (se existir)
- Ler `card.md` para outcomes
- Criar pasta `spec/` se não existir

### 2. Fase 1 - Requirements

- Criar apenas `requirements.md` (português)
- Extrair do brief.md (contexto rico: decisões, fluxos, referências técnicas) e do card.md (outcomes)
- Formato EARS em português: `O [sistema] DEVE [ação]; QUANDO [gatilho], O [sistema] DEVE...`
- Manter referência: `Derivado do card X` quando relevante
- Pausar e solicitar revisão humana antes da fase 2

### 3. Fase 2 - Design

- Após aprovação dos requirements, criar apenas `design.md` (português)
- Documentar arquitetura, componentes e propriedades de correção
- Pausar e solicitar revisão humana antes da fase 3

### 4. Fase 3 - Tasks

- Após aprovação do design, criar apenas `tasks.md` (português)
- Implementação bottom-up por app
- Solicitar validação final do arquiteto

### 5. Atualização futura

Quando card.md for atualizado via create-card, tech lead revisa `spec/requirements.md` e atualiza conforme necessário, documentando a origem de cada requisito novo ou alterado.

### 6. Commit obrigatório por fase (OBRIGATÓRIO — não omitir)

**Após cada fase aprovada**, executar imediatamente conforme `/_ai/rules/repo-maintenance-commit.md`:

```bash
git add _features/{ano}/{sprint}/{feature-slug}/spec/
git status
git commit -m "docs(_features): add {feature-slug} spec/{fase}"
git push origin main
```

> **Atenção:** O commit deve ser feito ao final de cada fase aprovada (não apenas no final da spec completa). A ausência do commit gera falha de sincronização — outros agentes (orchestrator, senior-executor) dependem do estado persistido da spec para operar corretamente.
