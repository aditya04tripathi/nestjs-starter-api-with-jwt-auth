# Architecture

## Overview

This project uses modular NestJS architecture with TypeORM persistence and shared cross-cutting infrastructure.

## Core Modules

- `auth`: authentication, token lifecycle, password operations
- `user`: profile read/update and domain user persistence access
- `realtime`: pub/sub abstraction and WebSocket gateway
- `health`: runtime and database health checks
- `common` and `utils`: shared decorators, guards, filters, interceptors, middleware

## Data Layer

- ORM: TypeORM
- Database: PostgreSQL
- Entity: `UserEntity` with UUID primary key
- Migration strategy: TypeORM migrations under `src/database/migrations`

## Security Flow

- Global `JwtGuard` protects routes except `@Public()`
- Global `RolesGuard` supports role metadata checks
- Global `ThrottlerGuard` enforces request limits
- Refresh token hashes are persisted and rotated
- Password reset tokens are hashed and expire by policy

## Realtime Flow

- Domain services publish events through `PubSubService`
- `RealtimeGateway` subscribes to pub/sub events
- Authenticated socket clients are joined to `user:<id>` rooms
- User-targeted events are emitted to room channels

## Operational Concerns

- Request ID middleware propagates `x-request-id`
- Request logger middleware logs method, route, status, latency, request ID
- Health endpoint checks DB connectivity
- CI validates lint, tests, and build on push/PR
