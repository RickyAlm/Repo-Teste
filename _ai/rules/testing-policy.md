---
id: testing-policy
version: 1
description: Testing policy for frontend and API flows.
priority: 88
always_apply: true
applies_to:
  - "**/*"
conflicts_with: []
---

# Testing Policy

Regra completa: `/_docs/standards/testing-policy.md`

- Frontend: sem testes no fluxo (unit, e2e, integration), exceto solicitacao explicita.
- API: incluir specs (RSpec) em feature development.
