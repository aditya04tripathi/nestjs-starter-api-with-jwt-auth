# NestJS Enterprise Backend Starter

Single-source project documentation for an enterprise-ready NestJS backend starter using TypeORM, JWT auth, realtime events, health probes, audit logging, and CI validation.

## Table of Contents

- [Overview](#overview)
- [Enterprise Capabilities](#enterprise-capabilities)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Quick Start](#quick-start)
- [Database and Migration Strategy](#database-and-migration-strategy)
- [API Reference](#api-reference)
- [Authentication and Security Model](#authentication-and-security-model)
- [Realtime WebSocket and PubSub](#realtime-websocket-and-pubsub)
- [Health, Observability, and Audit Logging](#health-observability-and-audit-logging)
- [Testing](#testing)
- [CI and Delivery](#ci-and-delivery)
- [Docker Deployment](#docker-deployment)
- [Contribution Workflow](#contribution-workflow)
- [Troubleshooting](#troubleshooting)
- [Roadmap and Known Limitations](#roadmap-and-known-limitations)

## Overview

This project is a backend starter built with NestJS and designed for production-oriented API development:

- TypeORM + PostgreSQL persistence
- JWT authentication with refresh token rotation
- Password reset lifecycle with expiring reset tokens
- Global rate limiting and strict CORS
- Realtime event fanout via WebSocket + internal pub/sub
- Health endpoints for live/ready checks
- Request ID propagation and persisted audit logs
- CI pipeline for lint/test/build enforcement

## Enterprise Capabilities

### Identity and access

- Signup/signin with hashed passwords (`argon2`)
- Access + refresh token issuance on signin/signup
- Refresh token verification and rotation on `/auth/refresh`
- Logout revoking refresh token state
- Password change and reset flows
- Public/guarded route model via custom decorators and global JWT guard

### Security controls

- DTO validation with whitelist and forbidden non-whitelisted fields
- Global request throttling through `@nestjs/throttler`
- Endpoint-level tighter throttling on signin/forgot-password routes
- Configurable CORS origins and allowed headers/methods
- Secret-driven JWT configuration

### Runtime reliability

- `/health/live` for liveness probe
- `/health/ready` for readiness probe (database check)
- `/health` composite endpoint
- Request correlation with `x-request-id`
- HTTP access logging and persisted audit logs

### Realtime capability

- Socket.IO gateway under `/realtime`
- JWT-authenticated socket connections
- User room routing (`user:<id>`)
- Domain event fanout:
  - `user.created`
  - `user.updated`
  - `user.password_changed`

## Architecture

### High-level module map

- `AppModule`: root wiring for config, ORM, throttling, guards, middleware
- `AuthModule`: auth endpoints and token lifecycle
- `UserModule`: profile read/update with repository boundary
- `RealtimeModule`: pub/sub abstraction and WebSocket gateway
- `HealthModule`: liveness/readiness/composite health checks
- `AuditModule`: audit record persistence for each HTTP request

### Data access pattern

- `UserService` and `AuthService` consume a `UserRepository` port (`USER_REPOSITORY`) instead of direct ORM calls.
- Current adapter implementation is TypeORM (`TypeOrmUserRepository`), making future adapter swaps easier.

### Request flow

1. Request enters middleware stack (`RequestIdMiddleware`, `RequestLoggerMiddleware`)
2. Global guards apply (`ThrottlerGuard`, `JwtGuard`, `RolesGuard`)
3. Controller handles request
4. Response interceptor wraps payload under `data`
5. Logger middleware writes structured log and persisted audit entry

### Auth token lifecycle

1. `signin/signup` issue access + refresh tokens
2. Refresh token hash stored in DB
3. `refresh` verifies token signature and DB hash, rotates tokens
4. `logout` clears refresh token hash
5. Password reset clears reset token state and invalidates refresh token state

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **ORM**: TypeORM 0.3.x
- **Database**: PostgreSQL (runtime), SQL.js (test fallback path in app config)
- **Auth**: JWT + Passport
- **Password hashing**: argon2
- **Realtime**: Socket.IO
- **Validation**: class-validator + class-transformer
- **API docs**: @nestjs/swagger
- **Caching**: @nestjs/cache-manager (Keyv + Redis optional)
- **Queues**: BullMQ (@nestjs/bullmq)
- **Scheduling**: @nestjs/schedule
- **Runtime/package manager**: Bun
- **Testing**: Jest + Supertest
- **CI**: GitHub Actions

## Project Structure

```text
src/
  app.module.ts
  main.ts
  app.controller.ts
  auth/
    auth.controller.ts
    auth.service.ts
    dto/
  user/
    user.controller.ts
    user.service.ts
    entities/
    repositories/
  realtime/
    realtime.gateway.ts
    realtime.module.ts
    pubsub/
  health/
    health.controller.ts
    health.service.ts
  audit/
    audit.module.ts
    audit.service.ts
    entities/
  database/
    data-source.ts
    seed.ts
    migrations/
  common/
    middleware/
  utils/
    guards/
    strategy/
    filters/
    interceptors/
    decorator/
test/
  app.e2e-spec.ts
  jest-e2e.json
.github/workflows/ci.yml
Dockerfile
```

## Environment Variables

Configure a `.env` file from `.env.example`.

```bash
cp .env.example .env
```

### Required

- `NODE_ENV` (example: `development`)
- `PORT` (default project expectation: `3001`)
- `DATABASE_URL` (PostgreSQL connection URL)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `THROTTLE_TTL_MS`
- `THROTTLE_LIMIT`
- `CORS_ORIGIN` (comma-separated list)

### Optional (supported by code with fallback defaults)

- `PASSWORD_RESET_TOKEN_TTL_MINUTES` (default behavior in service is `15`)
- `REDIS_URL` (example: `redis://localhost:6379`)
- `CACHE_TTL_MS` (example: `60000`)
- `BULLMQ_PREFIX` (optional key prefix for BullMQ)
- `S3_ENDPOINT` (example: `localhost`)
- `S3_PORT` (example: `9000`)
- `S3_USE_SSL` (example: `false`)
- `S3_ACCESS_KEY` (example: `minioadmin`)
- `S3_SECRET_KEY` (example: `minioadmin`)
- `S3_BUCKET` (example: `template-bucket`)

### Security notes

- Keep JWT secrets strong and environment-specific.
- Never commit `.env` to git.
- Use different secrets for access and refresh in production.
- Restrict `CORS_ORIGIN` to trusted frontend origins.

## Quick Start

### 1) Install dependencies

```bash
bun install
```

### 2) Configure environment

```bash
cp .env.example .env
```

### 3) Run migrations

```bash
bun run db:migrate:run
```

### 4) Seed initial data

```bash
bun run db:seed
```

### 5) Start supporting services (Postgres/Redis/MinIO)

If you’re using the provided `docker-compose.yml`:

```bash
docker compose up -d dev-db redis minio minio-init
```

### 6) Start development server

```bash
bun run start:dev
```

Swagger docs:

- `http://localhost:3001/api`

## Database and Migration Strategy

### Commands

- Create empty migration:

```bash
bun run db:migrate:create
```

- Generate migration from entity changes:

```bash
bun run db:migrate:generate
```

- Apply migrations:

```bash
bun run db:migrate:run
```

- Revert latest migration:

```bash
bun run db:migrate:revert
```

- Seed baseline user:

```bash
bun run db:seed
```

### Current migration baseline

- `1700000000000-InitUserUuid`:
  - user table bootstrap
  - UUID primary key setup
  - refresh/reset token storage columns
- `1700000000001-CreateAuditLogTable`:
  - audit log table creation
  - indexes on `createdAt` and `userId`

### ORM configuration

- Runtime DataSource: PostgreSQL via `DATABASE_URL`
- Entities: `UserEntity`, `AuditLogEntity`
- `synchronize: false` in standard runtime

## API Reference

All API responses pass through a response-transform interceptor and are wrapped under `data`.

### Public vs private routes

This starter is **public by default**: routes do not require authentication unless explicitly marked.

- Mark a route as authenticated with `@Private()`.
- Restrict a route to specific roles with `@Roles([Role.USER, Role.ADMIN])`.

### Public endpoints

- `GET    /`
- `GET    /health`
- `GET    /health/live`
- `GET    /health/ready`
- `POST   /auth/signup`
- `POST   /auth/signin`
- `POST   /auth/forgot-password`
- `POST   /auth/reset-password`
- `POST   /auth/refresh`

### Authenticated endpoints

- `POST   /upload` (multipart file upload using `file` field)
- `GET    /auth/me`
- `PATCH  /auth/change-password`
- `POST   /auth/logout`
- `GET    /user/profile`
- `PATCH  /user/profile`

### Auth payload contracts

#### `POST   /auth/signup`

Request:

```json
{
	"email": "user@example.com",
	"name": "User",
	"password": "Password123!"
}
```

Response `data` includes:

```json
{
	"access_token": "<jwt>",
	"refresh_token": "<jwt>"
}
```

#### `POST /auth/signin`

Request:

```json
{
	"email": "user@example.com",
	"password": "Password123!"
}
```

Response `data`:

```json
{
	"access_token": "<jwt>",
	"refresh_token": "<jwt>"
}
```

#### `POST /auth/refresh`

Request:

```json
{
	"refreshToken": "<jwt>"
}
```

Response `data`:

```json
{
	"access_token": "<rotated-jwt>",
	"refresh_token": "<rotated-jwt>"
}
```

#### `POST /auth/forgot-password`

Request:

```json
{
	"email": "user@example.com"
}
```

Response always generic to avoid account enumeration.

#### `POST /auth/reset-password`

Request:

```json
{
	"email": "user@example.com",
	"token": "<reset-token>",
	"newPassword": "NewPassword123!"
}
```

#### `PATCH /auth/change-password`

Requires bearer auth.

Request:

```json
{
	"currentPassword": "Password123!",
	"newPassword": "NewPassword123!"
}
```

## Authentication and Security Model

### JWT strategy

- Access tokens signed with `JWT_SECRET`.
- Refresh tokens signed with `JWT_REFRESH_SECRET` (fallback to `JWT_SECRET` when unset).
- Expirations are env-driven via `JWT_EXPIRES_IN` and `JWT_REFRESH_EXPIRES_IN`.

### Refresh token rotation

- Refresh token hashes are persisted.
- On refresh, signature + DB hash are both validated.
- New token pair is issued and stored, invalidating prior refresh token.

### Password reset flow

- Forgot-password creates random token and stores only a hash + expiry.
- Reset-password validates hash and expiry, then rotates password and clears reset state.

### Guards and decorators

- Global guards:
  - `ThrottlerGuard`
  - `JwtGuard`
  - `RolesGuard`
- `@Private()` enables JWT auth for a route/controller.
- `@Roles([Role.USER, Role.ADMIN])` requires JWT auth and checks `req.user.roles`.

### Roles

- `Role.USER`
- `Role.ADMIN`

New signups default to `Role.USER`.
The seed script creates `admin@example.com` with `Role.ADMIN`.

### Throttling and CORS

- Global throttling from env (`THROTTLE_TTL_MS`, `THROTTLE_LIMIT`).
- Endpoint-level overrides:
  - `/auth/signin` stricter limit
  - `/auth/forgot-password` stricter limit
- CORS origins are split from comma-separated `CORS_ORIGIN`.

## Realtime WebSocket and PubSub

### Namespace and auth

- Namespace: `/realtime`
- Client auth options:
  - `handshake.auth.token`
  - `Authorization: Bearer <access_token>` header

Connections with invalid/missing token are disconnected.

### Rooming model

- Authenticated users join room `user:<userId>`.

### Event fanout behavior

- `user.created`: broadcast to all connected clients.
- `user.updated`: emitted to `user:<id>` room.
- `user.password_changed`: emitted to `user:<id>` room.

### Pub/Sub abstraction

- Internal pub/sub service decouples event production from websocket transport.
- Domain services publish events without direct socket dependencies.

## Health, Observability, and Audit Logging

### Health endpoints

- `GET /health/live`: process-level liveness
- `GET /health/ready`: readiness including DB connectivity check
- `GET /health`: aggregated live + ready status

### Request tracing

- `RequestIdMiddleware` propagates `x-request-id`.
- Existing `x-request-id` is preserved when provided by caller.

### Request logging

- Middleware logs method, URL, status, latency, request ID.

### Audit logging

- Every HTTP request is persisted via `AuditService` into `AuditLog`.
- Stored fields include:
  - method
  - path
  - statusCode
  - durationMs
  - requestId
  - userId (when available)
  - ipAddress
  - userAgent
  - createdAt

## Testing

### Commands

- Unit tests:

```bash
bun run test
```

- E2E tests:

```bash
bun run test:e2e
```

- Coverage:

```bash
bun run test:cov
```

### Current baseline

- Unit test: auth service refresh/signin path checks
- E2E tests:
  - `/`
  - `/health`
  - `/health/live`
  - `/health/ready`

## CI and Delivery

GitHub Actions workflow at `.github/workflows/ci.yml` runs:

1. `bun install --frozen-lockfile`
2. `bun run lint`
3. `bun run test -- --runInBand`
4. `bun run build`

Triggered on:

- push to `main`, `dev`, `feature/**`, `fix/**`
- pull requests

## Docker Deployment

Multi-stage `Dockerfile` flow:

1. Install dependencies with Bun
2. Build NestJS app (`dist`)
3. Run production image with built output

Build image:

```bash
docker build -t nestjs-enterprise-starter .
```

Run container:

```bash
docker run --rm -p 3001:3001 --env-file .env nestjs-enterprise-starter
```

## Contribution Workflow

### Branching and commits

- Prefer `feature/*` and `fix/*` branches
- Keep commits focused and small
- Use Conventional Commits:
  - `feat(scope): ...`
  - `fix(scope): ...`
  - `refactor(scope): ...`
  - `docs(scope): ...`
  - `test(scope): ...`
  - `chore(scope): ...`

### Local validation before PR

```bash
bun run lint
bun run test -- --runInBand
bun run test:e2e
bun run build
```

### PR checklist

- Code is modular and readable
- Tests cover new behavior
- README updated for contract changes
- No secrets committed
- CI pipeline passes

## Troubleshooting

### Migration command fails

- Verify `DATABASE_URL` points to reachable PostgreSQL.
- Ensure DB user has migration privileges.

### 401 on protected endpoints

- Confirm bearer access token is provided.
- Verify `JWT_SECRET` matches token issuer.

### Refresh token rejected

- Token may already be rotated or revoked.
- Re-authenticate and use latest refresh token only.

### WebSocket disconnects immediately

- Ensure valid JWT is sent in handshake.
- Confirm `CORS_ORIGIN` includes frontend origin.

### Readiness endpoint reports degraded

- Database connectivity failed from app runtime.
- Verify DB is up and `DATABASE_URL` is correct.

### CI or local tests failing from module alias errors

- Ensure ts-jest path alias mapping remains configured:
  - unit Jest mapping in `package.json`
  - e2e mapping in `test/jest-e2e.json`

## Roadmap and Known Limitations

- Add explicit RBAC role model and admin role management APIs.
- Add externalized pub/sub adapter (Redis/NATS) for horizontal realtime scaling.
- Add metrics/tracing integration (OpenTelemetry/Prometheus).
- Expand unit/integration/e2e coverage across auth edge cases and realtime behavior.
- Add CI security steps (`npm audit`/SCA) and release workflow.
