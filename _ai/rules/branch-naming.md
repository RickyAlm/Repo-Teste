---
id: branch-naming
version: 1
description: Git branch naming conventions in English using feature-branch pattern.
priority: 80
always_apply: true
applies_to:
  - "**/*"
conflicts_with: []
---

# Git Branch Naming Conventions

- Branch names must be written in English.
- Use the pattern `type/scope-short-description`.
- Use lowercase, kebab-case, and no spaces.
- Branches are always created from a base branch (`main`, `staging`) and never developed directly on base branches.

## Allowed types

- `feat`: new feature
- `fix`: bug fix
- `release`: sprint promotion snapshot to production (subprojects only; created via `ttz sprint:release`, e.g. `release/2026-sprint-02`)
- `chore`: tooling, config, infra
- `docs`: documentation/spec changes
- `refactor`: refactors without behavior change
- `perf`: performance improvements
- `test`: test code only (when explicitly allowed)

## Scope examples

- `webapp`, `webapp-nightly`, `api`, `id`, `site`
- `di-policy`, `cash-minimum`, `finance`, `auth`

## Examples

```text
feat/webapp-update-diversity-policy-flows
fix/api-diverse-politic-validation
chore/infra-ci-cache-optimization
docs/specs-diversity-policy-webapp
refactor/webapp-minimum-cash-widget
```

## Invalid examples

```text
ajuste-politica-di                # not English and no type/
feat:diversity                    # uses colon instead of /
feat/webapp/ajuste-politica       # nested scope and not English
bugfix/diversityPolicy            # wrong type and casing
```

## RepoMaster: Branch Creation

- **Never create branches in the RepoMaster root.** The root contains `_features/`, `.ttz/`, `.gitmodules`; it is not an app.
- **Branches belong only in subprojects** (e.g. `api/`, `frontend/`) listed in `feature.config.yml` → `affected_projects`.
- **Only the CLI creates branches:** run `ttz` → "Desenvolver uma Feature" (or `ttz feature:start`). Do not run `git checkout -b feature/...` when implementing a feature; the CLI handles branch creation in subprojects.
- **Release branches** (`release/<year>-<sprint-slug>`) are created only by `ttz sprint:release` (Tech Lead / advanced mode) from `staging` toward `main`, never by hand in the RepoMaster root.
