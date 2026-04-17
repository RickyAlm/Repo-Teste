---
name: implement-backend
description: Use when implementing backend API code in a Rails project — controllers, services, integrations, API contracts, validations, or tests — to apply the project's backend engineering standards
version: 4
entrypoint: true
required_rules:
  - /_ai/rules/backend-api-development.md
  - /_ai/rules/commit-conventions.md
  - /_ai/rules/no-code-comments.md
  - /_ai/rules/testing-policy.md
  - /_ai/rules/professional-profile.md
  - /_ai/rules/language-boundaries.md
required_references:
  - /_docs/development/api-rails.md
  - /_docs/development/crud-patterns.md
  - /_docs/standards/language-boundaries.md
outputs: []
stability: stable
---

# Implement Backend

Padrões de implementação backend para a API Rails do projeto.

**Princípio central:** controllers finos, lógica de negócio não-trivial em services, queries complexas em query objects, integrações encapsuladas em adapters. Seguir convenções de nomenclatura e estrutura de pastas do projeto.

## Decidir a camada correta antes de implementar

| O que implementar | Camada |
|---|---|
| Regra de negócio, orquestração, transação | `app/services/` |
| Query complexa, multi-filtro, reutilizada | `app/queries/` |
| Formatação/agregação para resposta JSON | `app/presenters/` |
| Serialização de recurso para JSON | `app/serializers/` |
| Processamento assíncrono | `app/jobs/` (delega para service) |
| Persistência e invariantes simples | `app/models/` |
| Receber request e responder | `app/controllers/` (delega tudo acima) |

Nunca colocar regras de negócio em controllers, models, jobs ou callbacks.

Para CRUD simples já coberto pela base controller e helpers do projeto, não criar service automaticamente. Criar service apenas quando houver regra de negócio além do fluxo padrão.

## Ciclo de implementação — RED → GREEN → REFACTOR

Todo novo comportamento segue o ciclo TDD:

### 1. RED — escrever o teste que falha

Antes de qualquer código de produção, escrever a spec descrevendo o comportamento esperado:

- **Service**: escrever spec de service descrevendo o comportamento público de `#call`
- **Endpoint**: escrever request spec cobrindo status, payload e autenticação/autorização
- **Query Object**: escrever spec com cenários de filtro e resultado esperado

Verificar que a spec falha pelo motivo certo (não por erro de sintaxe ou setup).

### 2. GREEN — implementar o mínimo para passar

Implementar apenas o suficiente para a spec passar — sem antecipar casos futuros.

Executar as specs após cada mudança significativa:

```bash
# Detectar ambiente automaticamente
command -v mise && mise exec -- bundle exec rspec <spec_path> \
  || command -v asdf && asdf exec bundle exec rspec <spec_path> \
  || bundle exec rspec <spec_path>
```

Não avançar enquanto a spec não estiver green.

### 3. REFACTOR — melhorar sem quebrar

Com os testes passando, identificar:

- Nomes que não expressam o domínio
- Métodos com mais de uma responsabilidade
- Duplicação de conhecimento entre camadas
- Services ou models que cresceram além do escopo

Rodar as specs após cada refatoração para garantir que nenhum comportamento quebrou.

**Nunca refatorar código com specs falhando.**

## Autenticação e autorização

- Controllers autenticados **sempre** herdam de `Admin::BaseController` ou `User::BaseController` — nunca de `BaseController` ou `ApplicationController` diretamente
- Endpoints públicos herdam de `Public::BaseController`
- Regras de acesso na ability do namespace (`Ability::Admin`, `Ability::User`) — nunca inline no controller

## Contratos de API

- Validação de entrada rigorosa; respostas no formato padrão do projeto (dados, paginação, erros)
- Serializers para respostas — nunca expor estrutura interna de domínio diretamente
- Evitar breaking changes: quando inevitável, novo endpoint ou campo opcional com versão documentada
- Reutilizar helpers/serializers existentes — não inventar novos padrões paralelos
- Request specs: usar os helpers documentados em `api/spec/readme.md`:
  - **CRUD simples:** `crud_request_spec(resource:, base_url:, serialized_keys:, tags:, ...)`
  - **Nested resource:** `crud_request_spec(..., base_url: "/parent/{parent_id}/resources", url_params: [:parent_id])`
  - **Custom:** `request_spec(action:, method:, resource:, base_url:, url_params:, ...)`

## Carregamento de dados

- Usar `preload` em vez de `includes` — queries separadas, comportamento previsível, sem N+1
- Query complexa, multi-filtro ou reutilizada em mais de um lugar: extrair para `app/queries/`
- Preferir `pluck` quando apenas IDs ou colunas isoladas forem necessários

## Integrações externas

- Encapsular chamadas externas em adapters ou services de integração
- Nunca chamar SDK diretamente em controller ou model
- Mapear explicitamente erros de integração para erros de domínio
- Tratar timeouts, erros de rede e respostas inesperadas

## Tratamento de erros

- Services levantam erros de domínio próprios (`class Error < StandardError`)
- Controllers capturam com `rescue` e retornam resposta padronizada com status correto
- `ApplicationController` já trata 401 (`UnauthenticatedError`) e 403 (`CanCan::AccessDenied`)

## Testes — specs 100% antes de entregar

Cobertura obrigatória:

- Request spec para cada endpoint (status, payload, autenticação, autorização)
- Service spec para cada service com regra de negócio
- Query Object spec quando houver query objects

Convenções RSpec:

- Um comportamento por `it`
- `context` para cenários distintos: `context "when user is suspended"`
- `build` em vez de `create` quando não precisa persistir
- `described_class` em vez de nome hardcoded da classe
- Factories com traits para cenários específicos

```bash
# Exemplos de execução
bundle exec rspec api/spec/requests/resource_spec.rb
bundle exec rspec api/spec/services/my_service_spec.rb
bundle exec rspec api/spec/  # suite completa antes de entregar
```

Se qualquer spec falhar, investigar e corrigir antes de prosseguir. Não há entrega com red.

## Qualidade

- Seguir RuboCop como fonte de verdade de formato
- Services pequenos e coesos; extrair quando crescer demais
- Respeitar nomenclatura, estrutura de pastas e convenções de erro da API existentes
- Commits com escopo `api`: `feat(api): ...`, `fix(api): ...`, `test(api): ...`

## Red Flags

| Pensamento | Problema |
|------------|----------|
| "Vou colocar essa lógica no controller" | Regra de negócio só em service |
| "Vou herdar direto de BaseController no namespace admin" | Usar Admin::BaseController ou User::BaseController |
| "Esse endpoint não precisa de auth" | Nenhum endpoint autenticado sem credencial |
| "Vou chamar o SDK direto aqui" | Encapsular em adapter/integration service |
| "Vou usar `includes` pra carregar" | Usar `preload` para evitar N+1 |
| "O teste de controller basta" | Service logic precisa de teste de service também |
| "Vou retornar `record.as_json`" | Usar serializer via `respond_with_serialized_record` |
| "Essa query complexa fica no service" | Query reutilizável vai em Query Object |
| "Vou passar o objeto inteiro pro job" | Jobs recebem IDs, não instâncias |
| "Vou colocar o side effect no callback" | Side effects em services chamados explicitamente |
| "As specs vou rodar depois" | Rodar specs antes de concluir — fazem parte da implementação |
