---
id: backend-api-development
version: 4
description: Backend API development standards — services, presenters, serializers, query objects, authorization, authentication, error handling and testing.
priority: 80
always_apply: false
applies_to:
  - "api/**/*"
conflicts_with: []
---

# Backend API Development

Backend responsável por regras de negócio, autenticação, integrações externas e processamento assíncrono.

## Princípios de design

- **KISS** — implementação mais simples que atende ao requisito. Se precisar explicar por que é complexo, provavelmente não é necessário.
- **YAGNI** — implementar apenas o que o requisito atual exige. Sem abstrações para casos hipotéticos.
- **SRP** — cada classe tem uma responsabilidade. Quando um service começa a fazer duas coisas, extrair.
- **DRY** — evitar duplicação de *conhecimento* (regras de negócio), não de linhas de código. Três linhas similares não são duplicação se representam conceitos distintos.
- **Explícito sobre implícito** — nomes que descrevem intenção, sem magic, sem metaprogramação desnecessária.

## Hierarquia de controllers

A hierarquia de herança define autenticação e ability usadas:

```
ApplicationController        # base: Doorkeeper, CanCan, helpers
  └── BaseController         # CRUD helpers: respond_with_serialized_record, pagy, etc.
        ├── Admin::BaseController    # before_action :authenticate_user!, Ability::Admin
        ├── User::BaseController     # before_action :authenticate_user!, authorize_resource :user, Ability::User
        └── Public::BaseController  # sem autenticação, Ability::Public
```

**Regra:** toda controladora deve herdar do `BaseController` do seu namespace (`Admin::BaseController`, `User::BaseController`). A única exceção é `Public::BaseController` e suas filhas, que expõem endpoints sem credencial intencionalmente.

## Autenticação — nenhum endpoint sem credencial

Nenhum endpoint autenticado deve ser acessível sem credencial válida. O projeto aceita dois formatos:

- **Bearer token**: header `Authorization: Bearer <token>`
- **Doorkeeper token**: mesmo fluxo — `ApplicationController#doorkeeper_token` resolve via `Doorkeeper::AccessToken`

`authenticate_user!` levanta `User::UnauthenticatedError` quando não há `current_user`, retornando 401. Isso já está em `Admin::BaseController` e `User::BaseController` via `before_action`.

Nunca remover ou bypassar esse `before_action` em controllers autenticados.

## Autorização com CanCanCan

Usar CanCanCan para controle de acesso. Cada namespace tem sua própria ability:

- `Ability::Admin` — para Admin::BaseController
- `Ability::User` — para User::BaseController
- `Ability::Public` — para Public::BaseController

```ruby
# ApplicationController já define:
rescue_from CanCan::AccessDenied, with: :user_not_authorized  # retorna 403

def current_ability
  @current_ability ||= ability.new(current_user)
end
```

Regras de acesso devem estar na ability correspondente ao namespace — nunca inline no controller. Usar `authorize!`, `can?`, ou `authorize_resource` conforme o contexto.

## Camadas de responsabilidade

| Camada | Onde | Faz | Não faz |
|--------|------|-----|---------|
| Controller | `app/controllers/` | recebe request, delega, responde | lógica de negócio, queries complexas |
| Service | `app/services/` | orquestra regras de negócio não-triviais | persistência direta, queries, formatação |
| Query Object | `app/queries/` | encapsula queries complexas/reutilizáveis | persiste, tem regras de negócio |
| Model | `app/models/` | persistência, validações, associações, scopes simples | orquestração, lógica de negócio complexa |
| Presenter | `app/presenters/` | formatação de dados para exibição | persistência, queries, regras de negócio |
| Serializer | `app/serializers/` | serialização JSON de recursos | formatação de exibição, lógica |
| Job | `app/jobs/` | orquestra chamadas de services de forma assíncrona | lógica de negócio direta |

## Regras de negócio — apenas na camada de services

Toda regra de negócio vai em `app/services/`. Controllers delegam; nunca orquestram.

### Exceção prática para CRUD padrão

Em endpoints CRUD simples já cobertos pelo comportamento base do projeto (`BaseController` + helpers de CRUD/serialização), **não criar service por padrão**.

Criar service somente quando existir regra de negócio além do fluxo padrão, por exemplo:

- validação de domínio adicional
- orquestração entre múltiplos modelos
- transação com múltiplas etapas
- side effects explícitos (job, integração externa, auditoria)

Se não houver regra adicional, manter no fluxo padrão do controller com os helpers existentes.

**Convenções de service:**

```ruby
# Padrão obrigatório: .call como entry point, initialize com keyword args semânticos
class GroupJoinService
  class Error < StandardError; end  # erro de domínio próprio quando necessário

  def self.call(...)
    new(...).call
  end

  def initialize(user:, code:)  # keyword args — semântica explícita
    @user = user
    @code = code
  end

  def call
    validate_preconditions!
    perform_operation
  end

  private

  attr_reader :user, :code  # accessors privados, sem @ivar direto nos métodos privados

  def validate_preconditions!
    # nomes de método descrevem intenção, não implementação
  end

  def perform_operation
    # ...
  end
end
```

**RDoc obrigatório** em métodos públicos de services não-triviais:

```ruby
# Processa a adesão de um usuário a um grupo via código de convite.
#
# @param user [User] usuário que está ingressando
# @param code [String] código ou slug do grupo
# @return [Group] grupo ao qual o usuário foi adicionado
# @raise [GroupJoinService::Error] se o código for inválido ou o grupo estiver fechado
def call
```

Nomes de métodos e variáveis devem expressar o domínio — evitar nomes genéricos como `process`, `data`, `result`, `obj`.

## Query Objects — app/queries/

Quando uma query for complexa, reutilizada em mais de um lugar, ou tiver múltiplos filtros condicionais, extrair para um Query Object em `app/queries/`.

```ruby
class ActiveUsersInGroupQuery
  def initialize(relation = User.all)
    @relation = relation
  end

  def call(group:, since: 30.days.ago)
    @relation
      .joins(:group_memberships)
      .where(group_memberships: { group_id: group.id })
      .where("users.last_active_at >= ?", since)
  end
end

# uso no service ou controller
ActiveUsersInGroupQuery.new.call(group: @group)
```

- Recebe uma relation como argumento (composição)
- Retorna `ActiveRecord::Relation` — nunca executa (sem `.to_a`, `.count` no query object)
- Nunca modifica dados
- Usar `preload`/`eager_load`/`joins` conforme o caso — documentar a escolha se não for óbvio

## Models — persistência e invariantes

Models são responsáveis por: persistência, validações, associações e scopes simples.

- **Callbacks**: apenas para normalização de dados (`before_validation`, `before_save` para transformar formato). Nunca para side effects (enviar email, chamar API, criar outros registros).
- **Scopes**: encapsular condições reutilizáveis simples — quando a query tiver joins ou múltiplas condições, usar Query Object.
- **Associações**: sempre declarar `dependent:` — nunca deixar implícito.
- **Validações**: no model E na constraint de banco quando o dado é crítico.
- **Tamanho**: model acima de 200 linhas é sinal de que acumulou responsabilidades demais — extrair concerns ou services.

```ruby
# enum com hash syntax (não array)
enum status: { pending: 0, active: 1, suspended: 2 }

# dependent explícito
has_many :memberships, dependent: :destroy
belongs_to :group, optional: false
```

## Apresentações — app/presenters/

Lógica de apresentação (formatação, agregação de dados para relatórios) vai em `app/presenters/`. Herdam de `ApplicationPresenter`.

Presenters não persistem, não disparam queries complexas e não contêm regras de negócio — apenas transformam dados já carregados para exibição.

## Serialização — app/serializers/

Toda resposta JSON de recurso usa serializer (`ActiveModel::Serializer`). Nunca expor `.as_json` ou `.to_json` direto de model no controller.

```ruby
class CategorySerializer < ActiveModel::Serializer
  attributes :id, :name, :ancestry
end
```

`BaseController` já fornece `respond_with_serialized_record` e `respond_with_serialized_records` que resolvem serializer via `resource_class.default_serializer`. Reutilizar — não construir render manual a menos que haja necessidade específica.

## Jobs — processamento assíncrono

Jobs apenas orquestram chamadas de services. Nunca contêm lógica de negócio.

- **Idempotência obrigatória**: reexecutar o job com os mesmos argumentos deve produzir o mesmo resultado
- **Passar IDs, não objetos**: argumentos devem ser primitivos — IDs serializáveis, não instâncias de model
- **Tratar registro deletado**: usar `discard_on ActiveRecord::RecordNotFound` ou verificar existência antes de prosseguir
- **Retentativas**: configurar `retry_on` com limite e backoff; logar falhas persistentes

```ruby
class ProcessMissionCompletionJob < ApplicationJob
  discard_on ActiveRecord::RecordNotFound
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(user_id, mission_id)
    user = User.find(user_id)
    mission = Mission.find(mission_id)

    MissionCompletionService.call(user: user, mission: mission)
  end
end
```

## Carregamento de dados

Usar `preload` (queries separadas, comportamento previsível) em vez de `includes` (pode gerar JOIN ou N+1 dependendo do uso):

```ruby
# correto
User.preload(:missions, :group)

# evitar
User.includes(:missions, :group)
```

Preferir `pluck` quando apenas IDs ou colunas específicas forem necessários — evita instanciar models desnecessariamente.

## Integrações externas

Encapsular em adapter ou integration service — nunca chamar SDK diretamente em controller ou model.

Mapear erros de integração para erros de domínio antes de propagar. Tratar timeouts e respostas inesperadas explicitamente.

## Tratamento de erros

Erros devem ser tratados e retornados com status HTTP correto:

- `ApplicationController` já trata `CanCan::AccessDenied` (403) e `User::UnauthenticatedError` (401)
- Services devem levantar erros de domínio próprios (inner class `Error < StandardError`) para condições de negócio
- Controllers capturam erros de service com `rescue` ou `rescue_from` e retornam resposta padronizada
- Nunca deixar exceção vazar sem tratamento — produz 500 sem contexto útil

```ruby
# no controller
def create
  result = MyService.call(...)
  respond_with_serialized_record
rescue MyService::Error => e
  render json: { error: e.message }, status: :unprocessable_entity
end
```

## Testes — specs devem passar 100% antes de entregar

Toda feature entregue exige specs passando. Não há entrega sem green.

**Cobertura obrigatória:**

- Request spec para cada endpoint (status, payload, autorização)
- Service spec para cada service com regra de negócio
- Query Object spec quando houver query objects
- Usar helpers do projeto em `api/spec/readme.md`: `crud_request_spec`, `request_spec`

**Convenções RSpec:**

- Um comportamento por `it` — não agrupar múltiplas asserções sem relação
- Usar `context` para cenários distintos: `context "when user is suspended"`, `context "when group is closed"`
- `build` em vez de `create` quando não é necessário persistir — testes mais rápidos
- `described_class` em vez de nome hardcoded da classe nos specs de service
- Factories reutilizáveis com traits para cenários específicos — não criar variações inline

```ruby
# preferir
let(:user) { build(:user) }

# em vez de
let(:user) { create(:user) }

# contextos claros
context "when the group is closed" do
  before { group.update!(status: :closed) }
  it "raises GroupJoinService::Error" do ...
end
```

**Executar antes de concluir:**

```bash
# Detectar ambiente automaticamente
command -v mise && mise exec -- bundle exec rspec <spec_path> || bundle exec rspec <spec_path>
```

Se qualquer spec falhar, investigar e corrigir — não entregar com falha.

## Qualidade e convenções

- RuboCop como fonte de verdade de formato — não ignorar offenses
- Commits com escopo `api`: `feat(api): ...`, `fix(api): ...`, `test(api): ...`
- Services pequenos e coesos; extrair quando crescer demais
- Respeitar nomenclatura e estrutura de pastas existentes no projeto

## Anti-patterns a evitar

| Anti-pattern | Critério | Solução |
|---|---|---|
| God Model | Model > 200 linhas | Extrair concerns ou services |
| Service Graveyard | Service com 1 linha que só delega | Manter lógica simples no controller ou model |
| Callback Spaghetti | Callback com side effect (email, API call, criar outro record) | Mover para service chamado explicitamente |
| Kitchen Sink Concern | Concern com > 30 linhas misturando responsabilidades | Separar em concerns focados |
| N+1 Silencioso | Query dentro de loop sem preload | Usar `preload` antes do loop |
| SDK Inline | Chamada de SDK externo direto no controller/model | Encapsular em integration service |

## Red flags

| Pensamento | Problema |
|------------|----------|
| "Vou colocar essa lógica no controller" | Regra de negócio só em service |
| "Vou herdar direto de ApplicationController no namespace admin" | Usar Admin::BaseController ou User::BaseController |
| "Esse endpoint é interno, não precisa de auth" | Nenhum endpoint autenticado sem credencial — sem exceções |
| "Vou colocar o `can?` inline no controller" | Regra de autorização na ability do namespace |
| "Vou chamar o SDK direto aqui" | Encapsular em adapter |
| "Vou usar `includes`" | Usar `preload` |
| "Vou retornar `record.as_json`" | Usar serializer via `respond_with_serialized_record` |
| "Vou formatar a exibição no model" | Lógica de apresentação no presenter |
| "Essa query complexa fica no service mesmo" | Query reutilizável ou com múltiplos filtros vai em Query Object |
| "Vou passar o objeto inteiro pro job" | Jobs recebem IDs, não objetos |
| "Vou colocar esse side effect no callback" | Side effects em services chamados explicitamente |
| "As specs eu rodo depois" | Specs fazem parte da implementação — rodar antes de entregar |
