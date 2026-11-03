#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
fi

if ! grep -q '^ADMIN_PASSWORD=.\+' .env || grep -q '^ADMIN_PASSWORD=change-this-password$' .env; then
  echo "Set ADMIN_PASSWORD in .env before starting the dashboard."
  exit 1
fi

export PYTHONPATH="$ROOT_DIR"
exec python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
