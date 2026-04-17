---
id: no-code-comments
version: 1
description: Self-documenting code without inline comments.
priority: 85
always_apply: true
applies_to:
  - "**/*.{ts,tsx,js,jsx,rb}"
conflicts_with: []
---

# No Code Comments

Codigo autoexplicativo, sem comentarios inline.

Regras completas: `/_docs/standards/no-code-comments.md`

## Resumo

- Proibido: comentarios explicativos, TODO, FIXME, codigo comentado.
- Permitido: `@ts-ignore` com justificativa, JSDoc em APIs, anotacao para algoritmo realmente complexo.
- Alternativas: nomes descritivos, funcoes extraidas, tipos, constantes nomeadas.
