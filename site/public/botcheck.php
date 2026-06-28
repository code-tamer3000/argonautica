<?php
// ─── Проверка доступности бота ───────────────────────────────────────────────
// Реально отправляет тестовое сообщение в админ-чат и сразу удаляет его.
// Если ушло → бот отправляет сообщения (то, что нужно для ответов воронке).
//
// Запуск:
//   CLI:  php botcheck.php
//   URL:  https://argonautica-systems.ru/botcheck.php?key=argo_check
//         (200 = ок, 503 = проблема — удобно для uptime-мониторов)

if (file_exists(__DIR__ . '/config_test.php')) require __DIR__ . '/config_test.php';
else                                           require __DIR__ . '/config.php';
if (!defined('BOT_TOKEN')) define('BOT_TOKEN', defined('TEST_BOT_TOKEN') ? TEST_BOT_TOKEN : '');

// Куда слать тестовое сообщение проверки (личка владельца)
const CHECK_CHAT = '871360533';

// HTTP-доступ только по ключу (чтобы случайные хиты не слали тест в чат)
if (php_sapi_name() !== 'cli' && (($_GET['key'] ?? '') !== 'argo_check')) {
    http_response_code(403); exit('forbidden');
}
header('Content-Type: text/plain; charset=utf-8');

function api(string $m, array $p = []): ?array {
    $ch = curl_init('https://api.telegram.org/bot' . BOT_TOKEN . '/' . $m);
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($p),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 10,
    ]);
    $r = curl_exec($ch); curl_close($ch);
    return json_decode($r, true);
}

// 1) Кто бот / токен жив
$me  = api('getMe');
$bot = (isset($me['ok']) && $me['ok']) ? '@' . $me['result']['username'] : '??? (токен/API недоступны)';

// 2) Реальная отправка: шлём и удаляем, до 3 попыток (как сам бот)
$send = null;
for ($i = 1; $i <= 3; $i++) {
    $send = api('sendMessage', ['chat_id' => CHECK_CHAT, 'text' => '🩺 проверка доставки — ' . date('H:i:s')]);
    if (isset($send['ok']) && $send['ok']) break;
    if ($i < 3) sleep(1);
}
$canSend = isset($send['ok']) && $send['ok'];
if ($canSend) {
    api('deleteMessage', ['chat_id' => CHECK_CHAT, 'message_id' => $send['result']['message_id']]);
}

echo 'СТАТУС: ' . ($canSend ? '✅ OK — бот отправляет сообщения' : '❌ ПРОБЛЕМА — бот НЕ отправляет') . "\n";
echo "бот: {$bot}\n";
echo 'отправка в личку (' . CHECK_CHAT . '): ' . ($canSend
        ? 'ok (тестовое отправлено и удалено)'
        : 'FAIL — ' . ($send['description'] ?? 'нет ответа (сеть)')) . "\n";

if (php_sapi_name() !== 'cli' && !$canSend) http_response_code(503);
