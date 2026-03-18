# NestJS Enterprise Backend Starter

NestJS backend starter focused on enterprise-ready defaults: JWT auth, TypeORM + PostgreSQL, rate limiting, strict CORS, realtime pub/sub + WebSockets, and CI validation.

## Tech Stack

- NestJS 11
- TypeORM + PostgreSQL
- JWT + Passport
- Socket.IO
- Bun runtime/package manager

## Features

- Authentication
  - Sign up/sign in
  - Access + refresh token lifecycle
  - Logout and token revocation
  - Forgot/reset password token flow
- Security
  - Global validation pipeline
  - Global rate limiting via `@nestjs/throttler`
  - Environment-driven CORS policy
- Realtime
  - Internal pub/sub service
  - Authenticated WebSocket gateway (`/realtime`)
- Operations
  - Health endpoint (`GET /health`)
  - Request ID propagation (`x-request-id`)
  - Request logging middleware
  - GitHub Actions CI (`lint -> test -> build`)

## Project Structure

```text
src/
  app.module.ts
  main.ts
  auth/
  user/
  realtime/
  health/
  database/
  common/
  utils/
test/
.github/workflows/ci.yml
Dockerfile
```

## Setup

```bash
bun install
cp .env.example .env
```

Update `.env` with at least:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `PORT`

## Database

Run migrations:

```bash
bun run db:migrate:run
```

Seed admin user:

```bash
bun run db:seed
```

Create migration:

```bash
bun run db:migrate:create
```

Generate migration from entity changes:

```bash
bun run db:migrate:generate
```

## Run

```bash
bun run start:dev
```

Swagger UI:

- `http://localhost:3001/api`

## Quality Commands

```bash
bun run lint
bun run test
bun run test:e2e
bun run build
```

## Realtime

- Namespace: `/realtime`
- Auth:
  - `handshake.auth.token` with Bearer token value, or
  - `Authorization: Bearer <token>` header
- Events emitted:
  - `user.created`
  - `user.updated`
  - `user.password_changed`

## Additional Docs

- [Architecture](./ARCHITECTURE.md)
- [API](./API.md)
- [Contributing](./CONTRIBUTING.md)
