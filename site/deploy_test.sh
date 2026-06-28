#!/bin/bash
# Деплой на ТЕСТ-сервер (beget). Не трогает прод. Пароль вводится интерактивно.
set -e
cd "$(dirname "$0")"

TEST_USER="parfenf2"
TEST_HOST="parfenf2.beget.tech"
TEST_PATH="/home/p/parfenf2/parfenf2.beget.tech/public_html"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}→ npm run build${NC}"
npm run build

echo -e "${CYAN}→ rsync на тест-сервер ${TEST_HOST}${NC}"
rsync -avz --delete \
  --exclude='.argo.db*' \
  --exclude='.argo_test_offset' \
  --exclude='.argo_test_lock' \
  --exclude='.poll_err.log' \
  --exclude='.bot.log' \
  --exclude='config.php' \
  --exclude='.well-known' \
  -e ssh \
  dist/ \
  "${TEST_USER}@${TEST_HOST}:${TEST_PATH}/"

echo -e "${GREEN}✓ Тест-сервер обновлён${NC}"
