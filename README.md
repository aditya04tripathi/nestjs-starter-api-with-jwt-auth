# NestJS Starter API with JWT Authentication

A production-ready NestJS starter template with JWT authentication, Prisma ORM, and Docker setup.

## Scaffold Scripts

Use one of these scripts to easily scaffold a new project:

- **Bash (Unix/macOS)**: [scaffold-nest-js-project.sh](https://gist.githubusercontent.com/aditya04tripathi/f6a55dc4ebe2c85fc571b12ad2df1353/raw/5ae9b28b8e7827dabbb8769e0d722bb2051ac4a3/scaffold-nest-js-project.sh)
- **PowerShell (Windows)**: [scaffold-nest-js-project.ps1](https://gist.githubusercontent.com/aditya04tripathi/f6a55dc4ebe2c85fc571b12ad2df1353/raw/5ae9b28b8e7827dabbb8769e0d722bb2051ac4a3/scaffold-nest-js-project.ps1)
- **Batch (Windows)**: [scaffold-nest-js-project.bat](https://gist.githubusercontent.com/aditya04tripathi/f6a55dc4ebe2c85fc571b12ad2df1353/raw/5ae9b28b8e7827dabbb8769e0d722bb2051ac4a3/scaffold-nest-js-project.bat)

## Features

- JWT Authentication with refresh tokens
- User registration and login
- Prisma ORM with PostgreSQL
- Comprehensive test setup
- Input validation
- Environment configuration
- Error handling
- Logging

## Quick Start

### 1. Clone using a scaffold script

Using bash (Unix/macOS):

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
npx prisma migrate dev --name "init"

# Start the development server
pnpm run start:dev
```

## Available Commands

- `pnpm run start` - Start the application
- `pnpm run start:dev` - Start the application in development mode
- `pnpm run start:debug` - Start the application in debug mode
- `pnpm run start:prod` - Start the application in production mode
- `pnpm run test` - Run tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:cov` - Run tests with coverage
- `pnpm run test:debug` - Run tests in debug mode
- `pnpm run test:e2e` - Run end-to-end tests
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier
- `pnpm run pr-ready` - Check if the current code base is ready for a pull request

## Project Structure

```
src/
├── auth/              # Authentication modules and services
├── common/            # Common utilities, decorators, guards
├── config/            # Configuration modules
├── prisma/            # Prisma schema and migrations
├── user/              # User modules and services
├── app.module.ts      # Main application module
├── main.ts            # Application entry point
```

## Contributing

Before submitting a pull request, please ensure your code is ready by running:

```bash
npm run pr-ready
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
2. Clone your fork: `git clone https://github.com/your-username/nestjs-starter-api-with-jwt-auth.git`
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
SOFTWARE.

MIT
