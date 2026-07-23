#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is required but was not found on PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but was not found on PATH." >&2
  exit 1
fi

if [ "${INSTALL_DEPS:-0}" = "1" ] || [ ! -d node_modules ]; then
  echo "Installing backend dependencies..."
  npm install
fi

npm run start:dev
