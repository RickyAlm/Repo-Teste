---
id: react-admin-architecture
version: 1
description: React Admin @tootz architecture patterns.
priority: 60
always_apply: false
applies_to:
  - "webapp/**/*"
  - "webapp-nightly/**/*"
  - "site/**/*"
  - "**/packages/@tootz/**/*"
conflicts_with: []
---

# React Admin Architecture

Ler `/_docs/stack/react-admin.md` para especificacao completa.

Resumo: pacotes `form`, `ui`, `shell`, `auth`, `core`; `useFormField + useController`; imports de `@tootz/react-admin/form` e `@tootz/react-admin/ui`; apps com App Router podem usar shadcn direto quando aplicavel.
