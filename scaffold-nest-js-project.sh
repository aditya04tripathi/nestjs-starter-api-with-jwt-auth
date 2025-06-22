#!/bin/bash
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
  echo "Usage: $0 <project-name>"
  echo ""
  echo "Example:"
  echo "  $0 my-nest-app"
  exit 0
fi

PROJECT_NAME=$1
CURRENT_DIR=$(pwd)

if [ -z "$PROJECT_NAME" ]; then
  echo "Error: Project name is required."
  echo "Usage: $0 <project-name>"
  exit 1
fi
if [ -d "$PROJECT_NAME" ]; then
  echo "Error: Directory '$PROJECT_NAME' already exists."
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  echo "pnpm could not be found."
  read -p "Would you like to install pnpm? (Y/n) " INSTALL_PNPM
  INSTALL_PNPM=${INSTALL_PNPM:-Y}
  if [[ $INSTALL_PNPM =~ ^[Yy]$ ]]; then
    echo "Installing pnpm..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      if command -v brew &> /dev/null; then
        brew install pnpm
      else
        echo "Homebrew not found. Installing via npm..."
        npm install -g pnpm
      fi
    else
      if command -v npm &> /dev/null; then
        npm install -g pnpm
      else
        echo "npm not found. Cannot install pnpm. Please install npm first."
        exit 1
      fi
    fi
  else
    echo "Please install pnpm first."
    exit 1
  fi
fi

if ! command -v git &> /dev/null; then
  echo "Git could not be found."
  read -p "Would you like to install Git? (Y/n) " INSTALL_GIT
  INSTALL_GIT=${INSTALL_GIT:-Y}
  if [[ $INSTALL_GIT =~ ^[Yy]$ ]]; then
    echo "Installing Git..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      if command -v brew &> /dev/null; then
        brew install git
      else
        echo "Homebrew not found. Please install git manually."
        exit 1
      fi
    else
      if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y git
      elif command -v dnf &> /dev/null; then
        sudo dnf install -y git
      elif command -v yum &> /dev/null; then
        sudo yum install -y git
      else
        echo "Unable to install git. Please install it manually."
        exit 1
      fi
    fi
  else
    echo "Please install Git first."
    exit 1
  fi
fi

if ! command -v node &> /dev/null; then
  echo "Node.js could not be found."
  read -p "Would you like to install Node.js? (Y/n) " INSTALL_NODE
  INSTALL_NODE=${INSTALL_NODE:-Y}
  if [[ $INSTALL_NODE =~ ^[Yy]$ ]]; then
    echo "Installing Node.js..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      if command -v brew &> /dev/null; then
        brew install node
      else
        echo "Homebrew not found. Please install Node.js manually."
        exit 1
      fi
    else
      if command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
      elif command -v dnf &> /dev/null; then
        sudo dnf install -y nodejs
      elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
      else
        echo "Unable to install Node.js. Please install it manually."
        exit 1
      fi
    fi
  else
    echo "Please install Node.js first."
    exit 1
  fi
fi

if ! command -v npm &> /dev/null; then
  echo "npm could not be found."
  read -p "Would you like to install npm? (Y/n) " INSTALL_NPM
  INSTALL_NPM=${INSTALL_NPM:-Y}
  if [[ $INSTALL_NPM =~ ^[Yy]$ ]]; then
    echo "Installing npm (via Node.js)..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      if command -v brew &> /dev/null; then
        brew install node
      else
        echo "Homebrew not found. Please install npm manually."
        exit 1
      fi
    else
      if command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
      elif command -v dnf &> /dev/null; then
        sudo dnf install -y nodejs
      elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
      else
        echo "Unable to install npm. Please install it manually."
        exit 1
      fi
    fi
  else
    echo "Please install npm first."
    exit 1
  fi
fi

if ! command -v nest &> /dev/null; then
  echo "Nest CLI could not be found."
  read -p "Would you like to install Nest CLI? (Y/n) " INSTALL_NEST
  INSTALL_NEST=${INSTALL_NEST:-Y}
  if [[ $INSTALL_NEST =~ ^[Yy]$ ]]; then
    echo "Installing Nest CLI using npm..."
    npm install -g @nestjs/cli
  else
    echo "Please install Nest CLI first."
    exit 1
  fi
fi

git clone https://github.com/aditya04tripathi/nestjs-starter-api-with-jwt-auth.git
mv nestjs-starter-api-with-jwt-auth $PROJECT_NAME
cd $PROJECT_NAME
pnpm add -g @nestjs/cli
pnpm install
echo "NestJS project '$PROJECT_NAME' has been created in $CURRENT_DIR/$PROJECT_NAME."
echo "To start the project run:"
echo "cd $PROJECT_NAME"
echo "pnpm run start"
echo ""
echo "To start the project in development mode, run:"
echo "pnpm run start:dev"
echo ""
echo "To set up the database, run:"
echo "docker compose up -d"
echo ""
echo "To run the tests, run:"
echo "pnpm run test"
echo ""
echo "To run the tests with coverage, run:"
echo "pnpm run test:cov"
echo ""
echo "To run the linter, run:"
echo "pnpm run lint"
echo ""
echo "To run the linter with fix, run:"
echo "pnpm run lint:fix"
echo ""
echo "To run prettier, run:"
echo "pnpm run format"
echo ""
echo "To run prettier with fix, run:"
echo "pnpm run format:fix"
