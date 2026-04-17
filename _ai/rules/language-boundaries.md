---
id: language-boundaries
version: 1
description: Boundaries between technical English and product language for UI copy, specs, and identifiers.
priority: 71
always_apply: true
applies_to:
  - "**/*"
conflicts_with: []
---

# Language boundaries

Fonte detalhada: `/_docs/standards/language-boundaries.md`. Idioma do produto (microcopy, mensagens ao usuario, specs em `_features/`): ver `/_docs/project-context/README.md` e o brief da feature.

## O que fica em ingles

- Identificadores tecnicos: nomes de variaveis, funcoes, classes, tipos, modulos, constantes de codigo (nao copy).
- Commits, branch names, slugs de feature/bug quando a stack TTZ exige ingles (ver `/_ai/rules/commit-conventions.md`, `/_ai/rules/branch-naming.md`, `/_ai/rules/ttz-features.md`).
- Nomes de arquivos e rotas em kebab-case em ingles quando o padrao do projeto assim definir.

## O que segue o idioma do produto

- Strings renderizadas na UI, labels, placeholders, tooltips, titulos de pagina, empty states.
- Mensagens de erro e validacao mostradas ao usuario final (toast, inline, dialogs).
- Conteudo de `brief.md`, `card.md`, `spec/` (requirements, design, tasks) conforme `/_docs/standards/feature-lifecycle.md`.
- Artefatos em `/_bugs/` descritos para humanos (titulo pode seguir convencoes do projeto).

## Proibicoes

- Nao remover acentos nem substituir caracteres Unicode em copy visivel ou em texto de spec/brief existente para forcar ASCII, salvo pedido explicito no escopo.
- Nao alterar microcopy ou strings de UI fora do escopo da task ou spec em curso.
- Nao inferir que "codigo em ingles" significa traduzir ou despojar acentuacao de textos voltados ao usuario.

## Comunicacao com o humano

- Portugues para dialogo com o time, salvo politica explicita do repositorio em contrario.
