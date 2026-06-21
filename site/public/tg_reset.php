<?php
require_once __DIR__ . '/config.php';

// ─── Одноразовый сброс бота ───────────────────────────────────────────────────
// Убирает постоянную клавиатуру управления, снимает вебхук и чистит меню команд.
// Открой в браузере ОДИН раз:
//   https://argonautica-systems.ru/tg_reset.php?go=argo
// После — удали этот файл (или попроси удалить при следующем деплое).

if (($_GET['go'] ?? '') !== 'argo') { http_response_code(403); exit('forbidden'); }

header('Content-Type: text/plain; charset=utf-8');

function tg(string $method, array $payload = []): ?array {
    $ch = curl_init('https://api.telegram.org/bot' . BOT_TOKEN . '/' . $method);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 10,
    ]);
    $res = curl_exec($ch);
    curl_close($ch);
    return json_decode($res, true);
}

// 1) Снять постоянную клавиатуру (отправив сообщение с remove_keyboard)
$r1 = tg('sendMessage', [
    'chat_id'      => CHAT_ID,
    'text'         => '⚓ Клавиатура управления убрана. Бот теперь только присылает новые заявки.',
    'reply_markup' => ['remove_keyboard' => true],
]);

// 2) Снять вебхук и сбросить накопленные апдейты
$r2 = tg('deleteWebhook', ['drop_pending_updates' => true]);

// 3) Убрать команды из меню бота
$r3 = tg('deleteMyCommands');

$ok = fn($r) => !empty($r['ok']) ? 'ok' : json_encode($r, JSON_UNESCAPED_UNICODE);
echo "remove_keyboard:  {$ok($r1)}\n";
echo "deleteWebhook:    {$ok($r2)}\n";
echo "deleteMyCommands: {$ok($r3)}\n";
echo "\nГотово. Можешь удалить этот файл (tg_reset.php).";
