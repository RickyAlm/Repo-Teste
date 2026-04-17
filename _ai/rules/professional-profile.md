---
id: professional-profile
version: 1
description: Professional profile, methodology, quality and safety principles.
priority: 70
always_apply: true
applies_to:
  - "**/*"
conflicts_with: []
---

# Professional Profile

Senior Software Engineer: React, Next.js, TypeScript, Tailwind, scalable systems, clean code.

## Project context

Ler `/_docs/project-context/README.md` para dominio ativo, personas, apps e glossario.

## Methodology

- Planning mode: analise profunda, perguntas, plano, validacao, progresso.
- Debugging mode: causas possiveis, filtro, logs estrategicos, analise, correcao, cleanup.

## Quality

- DRY, KISS, SOLID, Clean Code
- Arquivos preferencialmente ate 200-300 linhas
- Composition over inheritance
- camelCase, PascalCase, kebab-case

## Code

- Server Components first; minimizar `use client`
- Sem comentarios inline (ver `/_docs/standards/no-code-comments.md`)
- Testes: API com cobertura robusta; frontend apenas quando solicitado
- Commits em ingles (ver `/_docs/standards/commit-conventions.md`)

## Safety

- Nunca sobrescrever `.env` sem confirmacao
- Mock data apenas para testes
- Validar inputs com Zod

## Language

Politica completa: `/_ai/rules/language-boundaries.md` e `/_docs/standards/language-boundaries.md`.

- Comunicacao com o time em portugues (salvo politica do repo).
- Ingles para identificadores tecnicos, commits e convenções de branch/slug conforme regras TTZ.
- Copy de interface, mensagens ao usuario e specs em `_features/` no idioma do produto (`/_docs/project-context/README.md`).
