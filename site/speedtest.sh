#!/bin/bash
# Замер скорости загрузки ключевых ресурсов сайта

BASE_URL="${1:-https://argonautica-systems.ru}"

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

CURL_FMT='  TTFB:      %{time_starttransfer}s\n  Всего:     %{time_total}s\n  Скорость:  %{speed_download} байт/с\n  Размер:    %{size_download} байт\n'

test_url() {
  local label="$1"
  local url="$2"
  echo -e "${CYAN}▸ $label${NC}"
  echo "  $url"
  result=$(curl -sL --max-time 60 -o /dev/null \
    -w "ttfb=%{time_starttransfer} total=%{time_total} speed=%{speed_download} size=%{size_download}" \
    "$url" 2>&1)

  ttfb=$(echo "$result"   | grep -oP 'ttfb=\K[0-9.]+')
  total=$(echo "$result"  | grep -oP 'total=\K[0-9.]+')
  speed=$(echo "$result"  | grep -oP 'speed=\K[0-9.]+')
  size=$(echo "$result"   | grep -oP 'size=\K[0-9.]+')

  speed_mb=$(echo "scale=2; $speed / 1048576" | bc 2>/dev/null || echo "?")
  size_mb=$(echo "scale=2; $size / 1048576" | bc 2>/dev/null || echo "?")

  echo -e "  TTFB:      ${YELLOW}${ttfb}s${NC}"
  echo -e "  Загрузка:  ${YELLOW}${total}s${NC}"
  echo -e "  Скорость:  ${GREEN}${speed_mb} МБ/с${NC}"
  echo -e "  Размер:    ${size_mb} МБ"
  echo ""
}

echo ""
echo -e "${GREEN}=== Speedtest: $BASE_URL ===${NC}"
echo ""

test_url "HTML (главная)"          "$BASE_URL/"
test_url "JS бандл"                "$BASE_URL/$(curl -sL "$BASE_URL/" | grep -oP 'assets/index\.[^"]+\.js' | head -1)"
test_url "CSS"                     "$BASE_URL/$(curl -sL "$BASE_URL/" | grep -oP 'assets/index\.[^"]+\.css' | head -1)"
test_url "Видео десктоп (desk)"    "$BASE_URL/media/waves_desk.mp4"
test_url "Видео мобайл (opt)"      "$BASE_URL/media/waves_opt.mp4"
test_url "Постер видео"            "$BASE_URL/media/waves_poster.jpg"
test_url "Карта (background.jpg)"  "$BASE_URL/media/background.jpg"

echo -e "${GREEN}=== Готово ===${NC}"
