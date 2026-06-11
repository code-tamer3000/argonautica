<?php
// ──────────────────────────────────────────────────────────────────────────────
// АРГОНАВТИКА · send.php
// Принимает заявку с сайта и пересылает в Telegram-бот.
//
// Настройка:
//   BOT_TOKEN  — токен бота от @BotFather
//   CHAT_ID    — chat_id куда слать (id канала, группы или личный id)
//
// Разверни рядом с index.html на PHP-хостинге.
// ──────────────────────────────────────────────────────────────────────────────

define('BOT_TOKEN', 'ВАШ_BOT_TOKEN');   // ← вставить токен
define('CHAT_ID',   'ВАШ_CHAT_ID');     // ← вставить chat_id

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
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

// Читаем JSON-тело
$raw   = file_get_contents('php://input');
$data  = json_decode($raw, true);

if (!$data || empty(trim($data['contact'] ?? ''))) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Поле contact обязательно']);
    exit;
}

$contact = trim($data['contact']);
$about   = trim($data['about'] ?? '');

// Собираем сообщение
$text  = "📥 *Новая заявка — Аргонавтика*\n\n";
$text .= "👤 *Контакт:* " . escapeMarkdown($contact) . "\n";
if ($about !== '') {
    $text .= "\n📝 *О себе:*\n" . escapeMarkdown($about);
}
$text .= "\n\n🕐 " . escapeMarkdown(date('d.m.Y H:i')) . " (UTC)";

// Отправляем в Telegram
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
    $desc = $tgData['description'] ?? 'Неизвестная ошибка Telegram';
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => $desc]);
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function escapeMarkdown(string $text): string {
    // MarkdownV2 requires escaping: _ * [ ] ( ) ~ ` > # + - = | { } . !
    return preg_replace('/([_*\[\]()~`>#+\-=|{}.!\\\\])/', '\\\\$1', $text);
}
