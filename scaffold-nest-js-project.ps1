#!/usr/bin/env pwsh
param(
  [string]$ProjectName
)

if ($args -contains "--help" -or $args -contains "-h") {
  Write-Host "Usage: $($MyInvocation.MyCommand.Name) <project-name>"
  Write-Host ""
  Write-Host "Example:"
  Write-Host "  $($MyInvocation.MyCommand.Name) my-nest-app"
  exit 0
}

$PROJECT_NAME = $ProjectName
$CURRENT_DIR = (Get-Location).Path

if ([string]::IsNullOrEmpty($PROJECT_NAME)) {
  Write-Host "Error: Project name is required." -ForegroundColor Red
  Write-Host "Usage: $($MyInvocation.MyCommand.Name) <project-name>"
  exit 1
}
if (Test-Path $PROJECT_NAME) {
  Write-Host "Error: Directory '$PROJECT_NAME' already exists." -ForegroundColor Red
  exit 1
}

function Test-CommandExists {
  param (
    [string]$Command
  )
  $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

if (-not (Test-CommandExists "pnpm")) {
  Write-Host "pnpm could not be found." -ForegroundColor Yellow
  $installPnpm = Read-Host "Would you like to install pnpm? (Y/n)"
  if ($installPnpm -eq "" -or $installPnpm.ToLower() -eq "y") {
    Write-Host "Installing pnpm using winget..." -ForegroundColor Cyan
    winget install pnpm
  } else {
    Write-Host "Please install pnpm first." -ForegroundColor Red
    exit 1
  }
}
if (-not (Test-CommandExists "git")) {
  Write-Host "Git could not be found." -ForegroundColor Yellow
  $installGit = Read-Host "Would you like to install Git? (Y/n)"
  if ($installGit -eq "" -or $installGit.ToLower() -eq "y") {
    Write-Host "Installing Git using winget..." -ForegroundColor Cyan
    winget install Git.Git
  } else {
    Write-Host "Please install Git first." -ForegroundColor Red
    exit 1
  }
}
if (-not (Test-CommandExists "node")) {
  Write-Host "Node.js could not be found." -ForegroundColor Yellow
  $installNode = Read-Host "Would you like to install Node.js? (Y/n)"
  if ($installNode -eq "" -or $installNode.ToLower() -eq "y") {
    Write-Host "Installing Node.js using winget..." -ForegroundColor Cyan
    winget install OpenJS.NodeJS
  } else {
    Write-Host "Please install Node.js first." -ForegroundColor Red
    exit 1
  }
}
if (-not (Test-CommandExists "npm")) {
  Write-Host "npm could not be found." -ForegroundColor Yellow
  $installNpm = Read-Host "Would you like to install npm? (Y/n)"
  if ($installNpm -eq "" -or $installNpm.ToLower() -eq "y") {
    Write-Host "Installing npm (via Node.js) using winget..." -ForegroundColor Cyan
    winget install OpenJS.NodeJS
  } else {
    Write-Host "Please install npm first." -ForegroundColor Red
    exit 1
  }
}
if (-not (Test-CommandExists "nest")) {
  Write-Host "Nest CLI could not be found." -ForegroundColor Yellow
  $installNest = Read-Host "Would you like to install Nest CLI? (Y/n)"
  if ($installNest -eq "" -or $installNest.ToLower() -eq "y") {
    Write-Host "Installing Nest CLI using npm..." -ForegroundColor Cyan
    npm install -g @nestjs/cli
  } else {
    Write-Host "Please install Nest CLI first." -ForegroundColor Red
    exit 1
  }
}

git clone https://github.com/aditya04tripathi/nestjs-starter-api-with-jwt-auth.git
Rename-Item -Path "nestjs-starter-api-with-jwt-auth" -NewName $PROJECT_NAME
Set-Location $PROJECT_NAME
pnpm add -g @nestjs/cli
pnpm install

Write-Host "NestJS project '$PROJECT_NAME' has been created in $CURRENT_DIR\$PROJECT_NAME."
Write-Host "To start the project run:"
Write-Host "cd $PROJECT_NAME"
Write-Host "pnpm run start"
Write-Host ""
Write-Host "To start the project in development mode, run:"
Write-Host "pnpm run start:dev"
Write-Host ""
Write-Host "To set up the database, run:"
Write-Host "docker compose up -d"
Write-Host ""
Write-Host "To run the tests, run:"
Write-Host "pnpm run test"
Write-Host ""
Write-Host "To run the tests with coverage, run:"
Write-Host "pnpm run test:cov"
Write-Host ""
Write-Host "To run the linter, run:"
Write-Host "pnpm run lint"
Write-Host ""
Write-Host "To run the linter with fix, run:"
Write-Host "pnpm run lint:fix"
Write-Host ""
Write-Host "To run prettier, run:"
Write-Host "pnpm run format"
Write-Host ""
Write-Host "To run prettier with fix, run:"
Write-Host "pnpm run format:fix"
