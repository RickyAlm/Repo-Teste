---
name: create-feature
description: Cria feature com feature.config.yml, brief.md e um card (outcome doc) em _features/{ano}/{sprint}/{feature-slug}/.
version: 10
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
  - /_docs/standards/feature-brief.md
  - /_docs/standards/language-boundaries.md
  - /_docs/standards/outcome-based-cards.md
  - /_docs/standards/sprint-points-estimation.md
  - /_docs/standards/assignee-defaults.md
outputs:
  - _features/{ano}/{sprint}/{feature-slug}/feature.config.yml
  - _features/{ano}/{sprint}/{feature-slug}/brief.md
  - _features/{ano}/{sprint}/{feature-slug}/card.md
stability: stable
---

# Create Feature

Cria feature outcome-based em `/_features/` com brief.md (contexto rico) e um card (outcome doc para ClickUp). Um dev cuida da feature inteira. Tech lead define escopo; depois pode evoluir com create-card (refinamento) e criar spec com create-spec.

## Regra crítica: sempre criar feature nova

**OBRIGATÓRIO:** Cada invocação de create-feature cria uma **feature nova**. Nunca editar, modificar ou sobrescrever features existentes em `_features/`.

- Cada thread/conversa que aciona create-feature = nova feature em nova pasta
- Features existentes (mesmo com tema similar) são **somente leitura** para esta skill
- Se o usuário quiser alterar feature existente: direcionar para create-card ou edição manual
- Se o slug desejado já existir: usar slug distinto (ex: `dashboard-analytics-export`, `dashboard-analytics-filters`) em vez de reutilizar a pasta
- Pode mencionar features existentes como referência, mas nunca modificá-las

## Fluxo de evolução

Ver `/_docs/standards/feature-lifecycle.md`:

- **create-feature**: cria feature + brief.md (contexto rico) + 1 card (outcome doc para ClickUp)
- **create-card**: adiciona cards a feature existente (refinamento, quando escopo cresce)
- **create-spec**: lê brief.md + cards → requirements, design, tasks (features complexas)

## Workflow

### 1. Carregar contexto de domínio

Ler `/_docs/project-context/README.md` para domínio ativo; carregar personas, aplicações, módulos e glossário.

### 2. Fazer perguntas (uma por vez)

Conforme `/_docs/standards/outcome-based-cards.md`:

1. Quem é a persona/papel impactado?
2. Qual módulo/camada precisa (apps do domain doc)?
3. Qual o comportamento atual e qual é o desejado?
4. Quais regras de negócio, políticas ou restrições?
5. Quais objetivos/resultados mensuráveis justificam a entrega?
6. Há dependências externas?
7. **Relação com card já existente no ClickUp?** Se sim: pedir o **link completo** da task (ou o id) e a **intenção** em linguagem natural. O agente infere `kind` (`dependency` = ordem / waiting_on; `link` = vínculo sem ordem) e `direction` (quem espera quem). Se a frase for ambígua, confirmar com o tech lead antes de gravar o YAML.

Exemplos de formulação (sempre com URL ou id do ClickUp):

| O tech lead diz | Inferência típica |
|-----------------|-------------------|
| «Esta nova feature **depende deste** card …» / «A nova **espera** este card» / «Este card **bloqueia** a entrega nova» | `kind: dependency`, `direction: new_waits_on_other` |
| «Este card **depende desta** nova feature» / «**É bloqueado por** esta feature» / «A nova **bloqueia** aquele card» (o outro não avança até a nova existir) | `kind: dependency`, `direction: other_waits_on_new` |
| «Só **relacionar** / **vincular** ao card …» (sem ordem de execução) | `kind: link` (sem `direction`) |

No ClickUp, «depende» e «bloqueia» são o mesmo arco orientado visto de lados opostos; o que muda é **quem está waiting on** quem.

Materializar no frontmatter do `card.md` como `clickup_relations` (ver `_ai/rules/ttz-features.md`). O sync do `ttz` aplica as relações após criar a task.

### 3. Avaliar complexidade e estimar sprint points

Conforme `/_docs/standards/sprint-points-estimation.md`, avaliar as 5 dimensões:

1. **Amplitude** (peso 3): quantos apps (affected_projects)
2. **Profundidade** (peso 2): quantas camadas técnicas por app
3. **Regras de negócio** (peso 3): complexidade de validações, permissões, cenários
4. **Integrações** (peso 2): serviços externos, filas, webhooks
5. **Novidade** (peso 1): quanto se apoia em padrões existentes no codebase

Pontuar cada dimensão de 1 a 3, calcular o score ponderado e mapear para points:

| Score | Points | Complexity |
|-------|--------|------------|
| 11-16 | 1-3 | low |
| 17-22 | 5-8 | medium |
| 23-33 | 13-25 | high |

Definir `complexity` e `points` no frontmatter do card. Não inventar fatores não mencionados pelo tech lead para inflar o score.

### 4. Sugerir assignee

Consultar `/_docs/standards/assignee-defaults.md` (DEVELOPERS). Filtrar devs cujo `projects` inclui o projeto da feature e cuja `complexity` inclui a complexidade do card. Ordenar por senioridade (Senior > Pleno > Junior). Sugerir o primeiro match. Se o usuário definir assignee explicitamente no frontmatter, respeitar.

### 5. Determinar ano e sprint

- **Ano**: 4 dígitos. Padrão: ano atual.
- **Sprint**: slug válido de `/_ttz/sprints.json`. Padrão: sprint atual.

### 6. Gerar feature-slug

kebab-case, inglês, legível. Ex.: `payment-retry-flow`, `event-registration-form`.

**Se o slug já existir** em `/_features/{ano}/{sprint}/{slug}/`: usar slug distinto (ex: `dashboard-analytics-export`, `dashboard-analytics-filters`). Nunca reutilizar pasta existente.

### 7. Criar feature.config.yml (obrigatório)

Criar pasta nova `/_features/{ano}/{sprint}/{feature-slug}/` e gerar `feature.config.yml`:

- Perguntar (uma por vez, com base em `/_docs/project-context/`):
  1. Título da feature (estável; não alterar depois).
  2. Projetos afetados (api, webapp, webapp-nightly, sales, gamification, site, cms).
  3. Personas impactadas (em português, descritivo: ex. Membros de EJ, Usuário logado).
  4. Módulos por projeto (para cada projeto selecionado, quais módulos/áreas serão afetados).
- Gerar `feature.config.yml` com schema em `_ai/rules/ttz-features.md`.

**Nunca** escrever em pasta de feature existente. Sempre criar pasta nova.

### 8. Gerar brief.md (contexto rico)

Criar `/_features/{ano}/{sprint}/{feature-slug}/brief.md` conforme `/_docs/standards/feature-brief.md`.

O brief preserva TODA a informação fornecida pelo tech lead (ADR, análise, conversa) organizada em 7 seções fixas com conteúdo livre. É a fonte principal de contexto para o dev e para create-spec.

**Profundidade adaptativa:** Quando o input contiver documentação de API, contrato de parceiro ou especificação técnica densa: a seção "Referências Técnicas" deve usar sub-seções estruturadas conforme o standard (endpoints, payloads, códigos de erro, regras do parceiro). Não resumir payloads, tabelas de erro ou regras de parceiro. O brief é o único artefato que o dev consultará durante implementação; informação que não estiver no brief será perdida.

Regras:
- Não inventar conteúdo. Organizar o que o tech lead forneceu.
- Seção sem informação: marcar "A definir" — nunca preencher com suposições.
- Preservar riqueza: decisões, fluxos, cenários, referências técnicas, escopo.
- Conteúdo em português.

### 9. Gerar card (outcome doc para ClickUp)

Sempre **um único card** por feature em `/_features/{ano}/{sprint}/{feature-slug}/card.md`.

O card é o artefato leve para ClickUp (kanban, status, assignee). Formato restrito, outcome-focused. O contexto rico fica no brief.md.

O card deve:
- Sintetizar o outcome da feature (o que entregar, para quem, por que)
- Seguir o formato de `/_docs/standards/outcome-based-cards.md` (5 seções fixas)
- Ser coerente com o brief.md (mesma feature, mesmo escopo)

### 10. Template do card

**Frontmatter obrigatório:** `titulo`, `modulo`, `status`, `origem`, `product`, `tags`, `complexity`, `points`.

**Frontmatter opcional:** `taskType` (feature ou ajuste), `assignee`, `clickup_relations` (lista de relações com tasks já existentes no ClickUp — ver `_ai/rules/ttz-features.md`). `clickup_id` e `clickup_url` são escritos automaticamente pelo sync.

**points:** Calculado automaticamente pela heurística de `/_docs/standards/sprint-points-estimation.md`. Valor da escala [1, 3, 5, 8, 10, 13, 15, 18, 20, 25].

**product:** Deve ser um dos produtos de `/_ttz/metadata.json`. Se não souber, usar `modulo` com palavras que permitam inferência (admin, api, gamificacao, portal, plataforma, etc.). O sync usa inferProduto(modulo, apps) quando product ausente.

**modulo:** Preferir um dos módulos listados em `feature.config.yml` -> `feature.modules` para o projeto principal. Mantém consistência config <-> cards.

**Seções do body:** `Contexto`, `Solução Esperada`, `Objetivos`, `Restrições`, `Critérios de Aceitação` (conforme `/_docs/standards/outcome-based-cards.md`). Preencher cada seção com nível de detalhe adequado ao escopo completo da feature.

**taskType:** Usar `ajuste` quando a feature for pequena (complexity: low).

### 11. Onde desenvolver (app routing)

Usar `feature.config.yml` (`affected_projects`) e o mapeamento de App Routing no documento de domínio ativo.

### 12. Checklist antes de gerar

- [ ] Pasta da feature é nova (slug não conflita com feature existente)
- [ ] feature.config.yml: title e affected_projects preenchidos
- [ ] brief.md: 7 seções preenchidas (ou marcadas "A definir"), sem conteúdo inventado
- [ ] brief.md preserva toda a riqueza do input original (ADR, análise, conversa)
- [ ] Se o input continha documentação de API/parceiro: payloads, códigos de erro e regras do parceiro estão preservados integralmente na seção "Referências Técnicas"
- [ ] Card único: titulo, modulo, product (ou modulo com keyword para inferência), complexity, points, tags
- [ ] points calculado via sprint-points-estimation (score ponderado das 5 dimensões)
- [ ] Card coerente com brief.md (mesmo escopo, mesma feature)
- [ ] product existe em `/_ttz/metadata.json` ou modulo permite inferProduto
- [ ] modulo do card coerente com feature.modules da config
- [ ] Se houver relação com task ClickUp existente: `clickup_relations` no frontmatter com `url`, `kind` e `direction` (quando `kind` for `dependency`) coerentes com o que o tech lead descreveu

### 13. Commit obrigatório (OBRIGATÓRIO — não omitir)

**Após gerar todos os artefatos**, executar imediatamente conforme `/_ai/rules/repo-maintenance-commit.md`:

```bash
git add _features/{ano}/{sprint}/{feature-slug}/
git status
git commit -m "feat(_features): add {feature-slug} feature artifacts"
git push origin main
```

> **Atenção:** Esta etapa é obrigatória e não deve ser pulada. A ausência do commit gera falha de sincronização entre o RepoMaster e os sistemas dependentes (ClickUp sync, create-spec, etc.).
