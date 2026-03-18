# API

## Base

- Local base URL: `http://localhost:3001`
- Swagger: `/api`

## Public Endpoints

- `GET /` - hello endpoint
- `GET /health` - service and DB health
- `POST /auth/signup`
- `POST /auth/signin`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/refresh`

## Authenticated Endpoints

- `GET /auth/me`
- `PATCH /auth/change-password`
- `POST /auth/logout`
- `GET /user/profile`
- `PATCH /user/profile`

## Auth Request/Response Notes

### Signin

- Request:
  - `email`
  - `password`
- Response:
  - `access_token`
  - `refresh_token`

### Refresh

- Request:
  - `refreshToken`
- Response:
  - rotated `access_token`
  - rotated `refresh_token`

### Forgot Password

- Request:
  - `email`
- Response:
  - generic success message regardless of user existence

### Reset Password

- Request:
  - `email`
  - `token`
  - `newPassword`
- Response:
  - success/failure message

## WebSocket API

- Namespace: `/realtime`
- Auth:
  - `auth.token` in handshake, or
  - `Authorization: Bearer <access_token>`

### Events

- Outbound:
  - `user.created`
  - `user.updated`
  - `user.password_changed`
