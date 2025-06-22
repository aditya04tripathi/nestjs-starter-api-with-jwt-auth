@echo off
setlocal enabledelayedexpansion

if "%1"=="--help" goto :help
if "%1"=="-h" goto :help

set PROJECT_NAME=%1
set CURRENT_DIR=%cd%

if "%PROJECT_NAME%"=="" (
  echo Error: Project name is required.
  echo Usage: %0 ^<project-name^>
  exit /b 1
)

if exist "%PROJECT_NAME%" (
  echo Error: Directory '%PROJECT_NAME%' already exists.
  exit /b 1
)

where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo pnpm could not be found.
  set /p INSTALL_PNPM="Would you like to install pnpm? (Y/n) "
  if "!INSTALL_PNPM!"=="" set INSTALL_PNPM=Y
  if /i "!INSTALL_PNPM!"=="Y" (
    echo Installing pnpm...
    where npm >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
      npm install -g pnpm
    ) else (
      echo npm not found. Cannot install pnpm. Please install npm first.
      exit /b 1
    )
  ) else (
    echo Please install pnpm first.
    exit /b 1
  )
)

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Git could not be found.
  set /p INSTALL_GIT="Would you like to install Git? (Y/n) "
  if "!INSTALL_GIT!"=="" set INSTALL_GIT=Y
  if /i "!INSTALL_GIT!"=="Y" (
    echo Please download and install Git from https://git-scm.com/download/win
    echo After installation, restart this script.
    exit /b 1
  ) else (
    echo Please install Git first.
    exit /b 1
  )
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Node.js could not be found.
  set /p INSTALL_NODE="Would you like to install Node.js? (Y/n) "
  if "!INSTALL_NODE!"=="" set INSTALL_NODE=Y
  if /i "!INSTALL_NODE!"=="Y" (
    echo Please download and install Node.js from https://nodejs.org/
    echo After installation, restart this script.
    exit /b 1
  ) else (
    echo Please install Node.js first.
    exit /b 1
  )
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo npm could not be found.
  set /p INSTALL_NPM="Would you like to install npm? (Y/n) "
  if "!INSTALL_NPM!"=="" set INSTALL_NPM=Y
  if /i "!INSTALL_NPM!"=="Y" (
    echo npm is typically installed with Node.js
    echo Please download and install Node.js from https://nodejs.org/
    echo After installation, restart this script.
    exit /b 1
  ) else (
    echo Please install npm first.
    exit /b 1
  )
)

where nest >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Nest CLI could not be found.
  set /p INSTALL_NEST="Would you like to install Nest CLI? (Y/n) "
  if "!INSTALL_NEST!"=="" set INSTALL_NEST=Y
  if /i "!INSTALL_NEST!"=="Y" (
    echo Installing Nest CLI using npm...
    npm install -g @nestjs/cli
  ) else (
    echo Please install Nest CLI first.
    exit /b 1
  )
)

git clone https://github.com/aditya04tripathi/nestjs-starter-api-with-jwt-auth.git
rename nestjs-starter-api-with-jwt-auth %PROJECT_NAME%
cd %PROJECT_NAME%
pnpm add -g @nestjs/cli
pnpm install
echo NestJS project '%PROJECT_NAME%' has been created in %CURRENT_DIR%\%PROJECT_NAME%.
echo To start the project run:
echo cd %PROJECT_NAME%
echo pnpm run start
echo.
echo To start the project in development mode, run:
echo pnpm run start:dev
echo.
echo To set up the database, run:
echo docker compose up -d
echo.
echo To run the tests, run:
echo pnpm run test
echo.
echo To run the tests with coverage, run:
echo pnpm run test:cov
echo.
echo To run the linter, run:
echo pnpm run lint
echo.
echo To run the linter with fix, run:
echo pnpm run lint:fix
echo.
echo To run prettier, run:
echo pnpm run format
echo.
echo To run prettier with fix, run:
echo pnpm run format:fix

exit /b 0

:help
echo Usage: %0 ^<project-name^>
echo.
echo Example:
echo   %0 my-nest-app
exit /b 0
