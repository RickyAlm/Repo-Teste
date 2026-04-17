---
name: create-card
description: Refina/atualiza card.md de uma feature existente. Exige feature alvo (ano, sprint, slug).
version: 5
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
  - /_docs/standards/feature-lifecycle.md
  - /_docs/standards/outcome-based-cards.md
  - /_docs/standards/language-boundaries.md
outputs:
  - _features/{ano}/{sprint}/{feature-slug}/card.md
stability: stable
---

# Create Card

Refina ou atualiza o `card.md` de uma feature existente. Evolução do escopo: tech lead criou a feature com create-feature (brief.md + card.md); durante refinamento ou descoberta, atualiza card.md.

## Quando usar

- Feature existe em `/_features/{ano}/{sprint}/{slug}/`
- Tech lead quer refinar o card sem criar nova feature
- Refinamento: descoberta de escopo que não estava no card inicial

## Workflow

### 1. Resolver feature alvo

- Usuário informa feature-slug (e opcionalmente ano/sprint)
- Verificar se existe `/_features/{ano}/{sprint}/{slug}/`
- Se ambíguo: listar features recentes, perguntar ano/sprint
- Ler `card.md` existente e `feature.config.yml` (se houver) para contexto

### 2. Garantir feature.config.yml (obrigatório)

Se não existir `feature.config.yml` na pasta da feature:

1. Id da demanda
2. Título da feature (reutilizar título da demanda)
3. Projetos afetados (api, webapp, etc.)
4. Personas impactadas
5. Módulos por projeto

Preencher `feature.affected_projects` com a lista de projetos envolvidos.

Se existir: ler para validar consistência com o refinamento.

### 3. Fazer perguntas outcome-based

Mesmo fluxo de `/_docs/standards/outcome-based-cards.md`, uma por vez:

1. Persona impactada?
2. Módulo/app?
3. Comportamento atual vs desejado?
4. Regras, políticas?
5. Objetivos mensuráveis?
6. Dependências?
7. **Relação com outra task no ClickUp?** Mesmas regras que em create-feature: link + intenção (dependência ordenada vs vínculo); materializar em `clickup_relations` no frontmatter conforme `_ai/rules/ttz-features.md`. Ao **remover** uma relação, retirar a entrada da lista e rodar o sync de novo.

### 4. Atualizar feature.config.yml quando escopo mudar

Se o refinamento revelar novo app, novo módulo ou nova persona:

- Atualizar `feature.config.yml` antes ou junto com a atualização do card
- Nunca alterar `feature.title`; apenas ampliar `apps`, `personas` e `modules`
- Manter `affected_projects` sincronizado com `apps`

Se o refinamento indicar app/módulo/persona não listado na config: alertar e propor ajuste.

### 5. Atualizar ou criar card.md

- Se `card.md` existir: atualizar com o novo escopo (merge ou substituição conforme contexto)
- Se não existir: criar `card.md` com o formato de `/_docs/standards/outcome-based-cards.md`
- Card consistente com `feature.config.yml` (apps, módulos, personas)
- `task-type` de `/_ttz/metadata.json` (feature ou ajuste)
- `clickup_relations` atualizado quando o refinamento alterar vínculos com o ClickUp

### 6. Traceability com spec

Se existe `spec/requirements.md` dentro da feature, informar ao tech lead:

`Card atualizado. Revise spec/requirements.md para verificar se há requisitos a incluir ou atualizar.`

### 7. Commit obrigatório (OBRIGATÓRIO — não omitir)

**Após atualizar todos os artefatos**, executar imediatamente conforme `/_ai/rules/repo-maintenance-commit.md`:

```bash
git add _features/{ano}/{sprint}/{feature-slug}/
git status
git commit -m "feat(_features): update {feature-slug} card"
git push origin main
```

> **Atenção:** Esta etapa é obrigatória e não deve ser pulada. A ausência do commit gera falha de sincronização entre o RepoMaster e os sistemas dependentes (ClickUp sync, create-spec, etc.).
