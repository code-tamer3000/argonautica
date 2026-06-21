#!/bin/bash
set -e

# ─── Цвета ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

cd "$(dirname "$0")"

# ─── Загружаем .env ──────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo -e "${RED}Файл .env не найден. Скопируй .env.example и заполни.${NC}"
  exit 1
fi
source .env

if [ -z "$SSH_HOST" ] || [ -z "$SSH_USER" ] || [ -z "$SSH_PASS" ] || [ -z "$SSH_REMOTE_PATH" ]; then
  echo -e "${RED}В .env не заполнены все переменные (SSH_HOST, SSH_USER, SSH_PASS, SSH_REMOTE_PATH).${NC}"
  exit 1
fi

# ─── Версия / описание ───────────────────────────────────────────────────────
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
if [ -n "$1" ]; then
  COMMIT_MSG="deploy: $1 [$TIMESTAMP]"
else
  COMMIT_MSG="deploy: $TIMESTAMP"
fi

# ─── Git коммит ──────────────────────────────────────────────────────────────
echo -e "${CYAN}→ Git commit${NC}"
cd ..
git add -A
if git diff --cached --quiet; then
  echo "  Нет изменений — коммит пропущен"
else
  git commit -m "$COMMIT_MSG"
  echo -e "  ${GREEN}✓ $COMMIT_MSG${NC}"
fi
cd site

# ─── Сборка ──────────────────────────────────────────────────────────────────
echo -e "${CYAN}→ npm run build${NC}"
npm run build
echo -e "  ${GREEN}✓ Сборка завершена${NC}"

# ─── Деплой ──────────────────────────────────────────────────────────────────
echo -e "${CYAN}→ Деплой на $SSH_HOST:$SSH_REMOTE_PATH${NC}"

if ! command -v sshpass &>/dev/null; then
  echo -e "${RED}sshpass не установлен. Установи: sudo apt install sshpass${NC}"
  exit 1
fi

sshpass -p "$SSH_PASS" rsync -avz --delete \
  --exclude='config.php' \
  --exclude='.argo.db*' \
  --exclude='.argo_offset' \
  -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  dist/ \
  "$SSH_USER@$SSH_HOST:$SSH_REMOTE_PATH"

echo -e "\n${GREEN}✓ Деплой завершён${NC}"
