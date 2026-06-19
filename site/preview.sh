#!/bin/bash
# Открывает сайт в Chrome (инкогнито), Edge (InPrivate), Yandex (инкогнито)

URL="${1:-https://argonautica-systems.ru}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

CHROME="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
EDGE="/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"

# Ищем Яндекс по всем пользователям
YANDEX=$(find /mnt/c/Users -maxdepth 6 -name "browser.exe" 2>/dev/null \
  | grep -i yandex | head -1)

echo -e "\n${GREEN}Открываю $URL${NC}\n"

# Chrome
if [ -f "$CHROME" ]; then
  "$CHROME" --incognito --new-window "$URL" &
  echo -e "${GREEN}✓ Chrome${NC} — инкогнито"
else
  echo -e "${RED}✗ Chrome не найден${NC}"
fi

sleep 0.5

# Edge
if [ -f "$EDGE" ]; then
  "$EDGE" --inprivate --new-window "$URL" &
  echo -e "${GREEN}✓ Edge${NC} — InPrivate"
else
  echo -e "${RED}✗ Edge не найден${NC}"
fi

sleep 0.5

# Yandex
if [ -n "$YANDEX" ] && [ -f "$YANDEX" ]; then
  "$YANDEX" --incognito --new-window "$URL" &
  echo -e "${GREEN}✓ Yandex Browser${NC} — инкогнито"
else
  echo -e "${YELLOW}⚠ Yandex Browser не установлен${NC}"
fi

echo ""
