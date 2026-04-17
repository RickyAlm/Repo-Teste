---
id: ttz-features
version: 4
description: Estrutura de features (config, brief, cards) TTZ; fluxo outcome-based e descoberta.
priority: 100
always_apply: false
applies_to:
  - "_features/**/*"
conflicts_with: []
---

# TTZ Features - Estrutura, Cards e Fluxo

Regra unica para features em `/_features/`: estrutura do config, padroes de path e template de cards, e fluxo de descoberta outcome-based.

## feature.config.yml

Cada feature tem `feature.config.yml` em `/_features/{ano}/{sprint}/{slug}/`. O identificador da feature e o **slug** (nome da pasta).

Campos (nao usar `feature.id` nem `feature.apps`):

- **title**: titulo estavel da feature
- **affected_projects**: subprojetos onde serao criadas branches (ex.: api, webapp-nightly). Obrigatorio para `ttz feature:start` / retomar
- **personas**: em portugues, descritivo (ex.: Usuario logado, Administradores, Membros de EJ, Diretores de Instancia)
- **modules**: chaves = slugs dos projetos em `affected_projects`; valores = modulos/areas afetados em cada projeto

Cards devem ser consistentes com affected_projects, modulos e personas da config. Ver `/_docs/standards/feature-lifecycle.md`.

## brief.md

Cada feature tem `brief.md` na raiz da pasta da feature. Documento rico de contexto com 7 secoes fixas (Visao Geral, Motivacao, Decisoes, Fluxos e Cenarios, Referencias Tecnicas, Escopo e Limites, Perguntas em Aberto). Conteudo livre dentro de cada secao, em portugues.

O brief preserva TODA a informacao do tech lead (ADR, analise, conversa). Nao inventar conteudo; secao sem informacao: marcar "A definir". Ver `/_docs/standards/feature-brief.md`.

O brief e fonte principal para `create-spec` (junto com os cards).

## Metadata do projeto

Ler `/_ttz/metadata.json` antes de criar card. Define modulos, tags e task-types validos.

## Padrao de caminho

```text
/_features/{ano}/{sprint}/{feature-slug}/card.md
```

- ano: 4 digitos (padrao ano atual)
- sprint: slug valido (padrao sprint atual, ver `/_ttz/sprints.json`)
- feature-slug: kebab-case em ingles
- card: `card.md` (1 por feature)

## Template do card (frontmatter obrigatorio)

```yaml
---
titulo: Implementar tela/modal de ajuste de estoque da lojinha
modulo: gestao-eventos-gamificacao
status: rascunho
origem: create-feature
product: Admin
tags: [feat]
complexity: medium
points: 8
---

### Contexto
...
```

## Campos para criacao no ClickUp

- `product`: obrigatorio para sync. Um dos produtos de `/_ttz/metadata.json`. Se ausente, inferido de modulo/apps (keywords: admin, api, gamificacao, portal, plataforma, etc.).
- `modulo`: usado para inferir product quando product ausente. Preferir valor de feature.modules da config.
- `tags`: array com uma tag valida (`feat`, `bug`, `ajuste`, `refinar`, `mapeamento`, `devops`, `design`, `suporte`)
- `complexity`: high | medium | low (para alocacao por senioridade)
- `points`: obrigatorio. Calculado via `/_docs/standards/sprint-points-estimation.md` (scoring por 5 dimensoes). Valor da escala [1, 3, 5, 8, 10, 13, 15, 18, 20, 25].
- `taskType`: feature (padrao) ou ajuste (feature pequena). Se ausente, usa ajuste quando complexity=low
- `assignee`: opcional; se ausente, usa default por projeto/complexidade (ver `/_docs/standards/assignee-defaults.md`)
- `clickup_id`, `clickup_url`: auto-gerados pelo sync. Nao editar manualmente.
- `clickup_relations` (opcional): relacoes com **tasks ClickUp ja existentes** (fora da pasta da feature). O sync cria a task nova e em seguida aplica `link` ou `dependency` na API. Lista de objetos:

```yaml
clickup_relations:
  - url: https://app.clickup.com/t/86abc12345
    kind: dependency
    direction: new_waits_on_other
  - url: https://app.clickup.com/t/86xyz99999
    kind: link
```

- `kind`: `dependency` (waiting_on / ordem) ou `link` (Linked Tasks, sem ordem).
- `direction` (obrigatorio se `kind` for `dependency`): `new_waits_on_other` (a **nova** task espera a task da `url`) ou `other_waits_on_new` (a task da `url` espera a **nova** task). Ignorado quando `kind` e `link`.
- `url`: URL publica da task ou id alfanumerico (formato ClickUp).

## create-feature: sempre feature nova

Cada invocacao de create-feature cria uma **feature nova**. Nunca editar features existentes. Se o slug conflitar, usar slug distinto. Para alterar feature existente: create-card ou edicao manual.

## Fluxo de descoberta (outcome-based)

Cards descrevem entrega de valor sem prescrever implementacao. Ao criar cards, seguir o fluxo de perguntas antes de gerar arquivos.

Referencias: `/_docs/project-context/` (dominio, personas, apps, glossario), `/_docs/standards/outcome-based-cards.md`, `/_docs/standards/feature-lifecycle.md`.

1. Perguntar (uma por vez): persona, modulo, comportamento, regras, objetivos, dependencias.
2. Avaliar complexidade (high/medium/low).
3. Definir ano/sprint e feature-slug (kebab-case).
4. Garantir `feature.config.yml` com title, affected_projects, personas e modules.
5. Gerar `brief.md` com todo o contexto rico (7 secoes fixas, sem inventar conteudo).
6. Gerar `card.md` em `/_features/{ano}/{sprint}/{feature-slug}/` (outcome doc para ClickUp) consistente com a config e o brief.
