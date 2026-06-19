<?php
// ──────────────────────────────────────────────────────────────────────────────
// АРГОНАВТИКА · send.php
// Принимает заявку с сайта и пересылает в Telegram.
// Секреты хранятся в config.php (рядом на сервере, не в git).
// ──────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://argonautica-systems.ru');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ─── Rate limiting: не более 3 заявок с одного IP за 60 секунд ───────────────
$ip       = preg_replace('/[^a-f0-9:.]/', '', $_SERVER['REMOTE_ADDR'] ?? '');
$rateFile = sys_get_temp_dir() . '/argo_rate_' . md5($ip) . '.json';

$now      = time();
$hits     = [];
if (file_exists($rateFile)) {
    $hits = json_decode(file_get_contents($rateFile), true) ?? [];
}
$hits = array_filter($hits, fn($t) => $now - $t < 60);

if (count($hits) >= 3) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Слишком много запросов. Подожди минуту.']);
    exit;
}

$hits[] = $now;
file_put_contents($rateFile, json_encode(array_values($hits)));

// ─── Читаем тело ─────────────────────────────────────────────────────────────
$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Неверный формат данных']);
    exit;
}

// ─── Honeypot: скрытое поле — если заполнено, это бот ────────────────────────
if (!empty($data['website'])) {
    http_response_code(200);
    echo json_encode(['ok' => true]); // притворяемся что всё ок
    exit;
}

// ─── Валидация contact ───────────────────────────────────────────────────────
$contact = trim($data['contact'] ?? '');

if ($contact === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Поле контакта обязательно']);
    exit;
}

if (mb_strlen($contact) > 100) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Контакт слишком длинный']);
    exit;
}

$isPhone = preg_match('/^[\+\d][\d\s\-\(\)]{6,19}$/', $contact);
$isTg    = preg_match('/^@[\w]{3,32}$/', $contact);

if (!$isPhone && !$isTg) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Введи номер телефона или @username в Telegram']);
    exit;
}

// ─── Валидация about (необязательное) ────────────────────────────────────────
$about = trim($data['about'] ?? '');
if (mb_strlen($about) > 1000) {
    $about = mb_substr($about, 0, 1000) . '…';
}

// ─── Собираем сообщение ───────────────────────────────────────────────────────
$text  = "📥 *Новая заявка — Аргонавтика*\n\n";
$text .= "👤 *Контакт:* " . escapeMarkdown($contact) . "\n";
if ($about !== '') {
    $text .= "\n📝 *О себе:*\n" . escapeMarkdown($about);
}
$text .= "\n\n🕐 " . escapeMarkdown(date('d.m.Y H:i')) . " (UTC)";

// ─── Отправляем в Telegram ────────────────────────────────────────────────────
$url     = "https://api.telegram.org/bot" . BOT_TOKEN . "/sendMessage";
$payload = [
    'chat_id'    => CHAT_ID,
    'text'       => $text,
    'parse_mode' => 'MarkdownV2',
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 10,
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Ошибка соединения с Telegram']);
    exit;
}

$tgData = json_decode($response, true);

if ($httpCode === 200 && ($tgData['ok'] ?? false)) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => $tgData['description'] ?? 'Ошибка Telegram']);
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function escapeMarkdown(string $text): string {
    return preg_replace('/([_*\[\]()~`>#+\-=|{}.!\\\\])/', '\\\\$1', $text);
}
