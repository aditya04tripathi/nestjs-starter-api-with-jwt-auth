# Contributing

## Workflow

- Branch from `dev` or create `feature/*` / `fix/*` branches
- Keep commits small and logically scoped
- Use Conventional Commits:
  - `feat(scope): ...`
  - `fix(scope): ...`
  - `refactor(scope): ...`
  - `docs(scope): ...`
  - `test(scope): ...`
  - `chore(scope): ...`

## Local Validation

Run before creating a PR:

```bash
bun run lint
bun run test
bun run build
```

## Pull Request Checklist

- Code is readable and modular
- Tests for changed behavior are added or updated
- Docs updated when contracts/commands changed
- No secrets or credentials in commits
- CI is passing

## Security and Configuration

- Keep secrets in `.env`
- Never commit credentials or private keys
- Validate external input using DTO + class-validator
