#!/usr/bin/env bash

set -euo pipefail

if [ -z "${HOME:-}" ] || [ ! -s "$HOME/.nvm/nvm.sh" ]; then
  echo "[node] nvm이 설치되어 있지 않거나 초기화 스크립트를 찾을 수 없습니다." >&2
  echo "[node] Node.js 22.x를 사용하려면 ~/.nvm/nvm.sh 가 필요합니다." >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$HOME/.nvm/nvm.sh"
nvm use 22 >/dev/null

exec "$@"
