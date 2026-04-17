# Repo-Teste

Repositório de teste para validar monitoramento recorrente de CVEs e bloqueio de PR por severidade no GitHub.

## Esteira de segurança configurada

- Dependabot version updates: `.github/dependabot.yml`
- Gate de PR por severidade (`high` e `critical`): `.github/workflows/dependency-review.yml`
- Scan recorrente diário de CVEs: `.github/workflows/osv-scan.yml`

## Como validar

1. Abra um PR para a branch `main` alterando dependências.
2. Verifique a execução do workflow `Dependency Review`.
3. Dispare manualmente o workflow `OSV Scan` em `Actions`.
4. Confira se a execução falha quando houver vulnerabilidades detectadas.

## Importante

Para o bloqueio de merge funcionar de fato, configure em `Settings > Branches` da branch `main` a exigência do status check `dependency-review`.