# NestJS Skilltree API

A comprehensive NestJS API with JWT authentication, user management, and skilltree functionality, based on the FIT3170 project structure.

## Features

- **Authentication & Authorization**
  - JWT Authentication with refresh tokens
  - User registration and login
  - Password change and reset functionality
  - Role-based access control
  - Public route decorators

- **User Management**
  - User profiles
  - User statistics
  - Profile updates

- **Skilltree Management**
  - Create and manage skilltrees
  - User-specific skilltree progress
  - CRUD operations for skilltrees

- **Technical Features**
  - Prisma ORM with PostgreSQL
  - Global exception filters
  - Response transformation interceptors
  - Input validation with class-validator
  - Swagger API documentation
  - Environment configuration
  - CORS support

## Project Structure

```
.env
.env.example
.gitignore
.prettierrc
api.http
docker-compose.yml
eslint.config.mjs
LICENSE
nest-cli.json
package.json
pnpm-lock.yaml
README.md
swagger.json
tsconfig.build.json
tsconfig.json
validate-swagger.js
prisma/
  ├── schema.prisma
  └── seed.ts
src/
  ├── app.controller.ts
  ├── app.module.ts
  ├── app.service.ts
  ├── main.ts
  ├── auth/
  │   ├── auth.controller.ts
  │   ├── auth.module.ts
  │   ├── auth.service.ts
  │   └── dto/
  ├── common/
  ├── prisma/
  ├── types/
  ├── user/
  │   └── dto/
  │   └── ...
  └── utils/
test/
  ├── app.e2e-spec.ts
  └── jest-e2e.json
uploads/
  └── UPLOADS_GO_HERE
```

## Quick Start

### 1. Scaffold a new project (optional)

```bash
curl -o scaffold.sh https://gist.githubusercontent.com/aditya04tripathi/f6a55dc4ebe2c85fc571b12ad2df1353/raw/5ae9b28b8e7827dabbb8769e0d722bb2051ac4a3/scaffold-nest-js-project.sh
chmod +x scaffold.sh
./scaffold.sh my-project-name
```

Using PowerShell (Windows):

```powershell
Invoke-WebRequest -Uri "https://gist.githubusercontent.com/aditya04tripathi/f6a55dc4ebe2c85fc571b12ad2df1353/raw/5ae9b28b8e7827dabbb8769e0d722bb2051ac4a3/scaffold-nest-js-project.ps1" -OutFile "scaffold.ps1"
./scaffold.ps1 my-project-name
```

Using Batch (Windows):

```batch
curl -o scaffold.bat https://gist.githubusercontent.com/aditya04tripathi/f6a55dc4ebe2c85fc571b12ad2df1353/raw/5ae9b28b8e7827dabbb8769e0d722bb2051ac4a3/scaffold-nest-js-project.bat
scaffold.bat my-project-name
```

### 2. Manual setup if not using scripts

```bash
# Clone the repository
git clone https://github.com/aditya04tripathi/nestjs-starter-api-with-jwt-auth.git my-project-name

# Navigate to project directory
cd my-project-name

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env file with your database credentials

# Run database migrations
pnpm run db:dev:generate

# Start the development server
pnpm run start:dev
```

## Environment Configuration

### Backend Environment Variables

The backend uses separate environment configuration from the frontend. Copy `.env.example` to `.env` and configure the following variables:

#### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (default: 3001)

#### Storage Configuration (Backend Only)

- `AWS_S3_BUCKET`: S3 bucket for file storage
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `UPLOAD_PATH`: Local upload directory path

#### AI Configuration

- `OPENAI_API_KEY`: OpenAI API key for AI features
- `AI_MODEL`: AI model to use (default: gpt-4)

#### Monitoring

- `SENTRY_DSN`: Sentry DSN for error tracking
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

**Note**: Storage configurations are separated between frontend and backend. Frontend handles client-side storage (localStorage, sessionStorage), while backend manages server-side storage (S3, Redis, database).

### Database Commands

- `pnpm run db:dev:generate` - Generate Prisma client
- `pnpm run db:dev:push` - Push schema changes to database
- `pnpm run db:dev:reset` - Reset database and migrations
- `pnpm run db:dev:studio` - Open Prisma Studio
- `pnpm run db:dev:prod` - Deploy migrations to production
- `pnpm run db:dev:ready-for-deployment` - Prepare database for deployment

### Testing Commands

- `pnpm run test` - Run tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:cov` - Run tests with coverage
- `pnpm run test:debug` - Run tests in debug mode
- `pnpm run test:e2e` - Run end-to-end tests

### Code Quality Commands

- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier
- `pnpm run format:check` - Check code formatting
- `pnpm run pr-ready` - Check if the current code base is ready for a pull request

## Contributing

Before submitting a pull request, please ensure your code is ready by running:

```bash
pnpm run pr-ready
```

This command will:

1. Check for linting errors
2. Verify code formatting
3. Run all tests
4. Build the project

All these checks must pass before your PR can be accepted.

Contributions are welcome! Here's how you can help improve this project:

### Setting up for Development

1. Fork the repository
2. Clone your fork: `git clone https://github.com/aditya04tripathi/nestjs-starter-api-with-jwt-auth.git`
3. Create your feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`

### Development Workflow

1. Make your changes
2. Run tests to ensure your changes don't break anything: `pnpm test`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Write tests for new features
- Update documentation for any changes
- Keep commits focused and atomic

### Issues and Discussions

- Use the GitHub Issues tab to report bugs or request features
- Check existing issues before opening a new one
- Provide detailed information when reporting bugs

Thank you for contributing!

## License

MIT License

Copyright (c) 2025 Aditya Tripathi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
