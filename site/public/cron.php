<?php
// Запускается раз в минуту через cron (CLI):
//   /usr/bin/php /var/www/u3511992/data/www/argonautica-systems.ru/cron.php
// Назначение: ловить из чата команду /price и менять цену Экспедиции на сайте.

require_once __DIR__ . '/config.php';

const DEFAULT_PRICE = '9000 ₽';

// Запуск возможен двумя способами:
//   1) CLI — панельный cron (без ограничений)
//   2) HTTP — веб-крон по URL: https://argonautica-systems.ru/cron.php
//      Если в config.php задан CRON_KEY, требуем ?key=... ; иначе доступ открыт
//      (эндпоинт ничего не отдаёт и действует только на сообщения из своего чата).
if (php_sapi_name() !== 'cli') {
    if (defined('CRON_KEY') && CRON_KEY !== '' && ($_GET['key'] ?? '') !== CRON_KEY) {
        http_response_code(403); exit;
    }
    header('Content-Type: text/plain; charset=utf-8');
    register_shutdown_function(fn() => print('ok'));
}

$offsetFile = __DIR__ . '/.argo_offset';
$offset     = file_exists($offsetFile) ? (int)file_get_contents($offsetFile) : 0;

$res = tgRequest('getUpdates', ['offset' => $offset, 'limit' => 100, 'timeout' => 0]);
if (!($res['ok'] ?? false) || empty($res['result'])) exit;

$db = getDB();

foreach ($res['result'] as $upd) {
    if (isset($upd['message'])) handleCommand($upd['message'], $db);
    $offset = $upd['update_id'] + 1;
}

file_put_contents($offsetFile, $offset);

// ─── Команды ──────────────────────────────────────────────────────────────────
function handleCommand(array $msg, PDO $db): void {
    if ((string)($msg['chat']['id'] ?? '') !== (string)CHAT_ID) return;
    $text = trim($msg['text'] ?? '');
    if ($text === '' || $text[0] !== '/') return;

    $parts = preg_split('/\s+/', $text, 2);
    $cmd   = strtolower(strtok($parts[0], '@'));
    $arg   = trim($parts[1] ?? '');

    switch ($cmd) {
        case '/price':
            if ($arg === '') {
                sendMsg(CHAT_ID, "Текущая цена на сайте: <b>" . htmlspecialchars(getPrice($db), ENT_QUOTES) . "</b>\n\nЧтобы изменить: <code>/price 12000</code>");
                return;
            }
            // только цифры и пробелы → добавляем ₽; иначе берём как есть
            $val = preg_match('/^\d[\d\s]*$/u', $arg)
                ? preg_replace('/\s+/', ' ', $arg) . ' ₽'
                : $arg;
            if (mb_strlen($val) > 50) $val = mb_substr($val, 0, 50);
            setPrice($db, $val);
            sendMsg(CHAT_ID, "✅ Новая цена на сайте: <b>" . htmlspecialchars($val, ENT_QUOTES) . "</b>");
            break;

        case '/start':
        case '/help':
            sendMsg(CHAT_ID,
                "⚓ <b>Бот Аргонавтики</b>\n\n" .
                "Текущая цена: <b>" . htmlspecialchars(getPrice($db), ENT_QUOTES) . "</b>\n\n" .
                "Изменить цену Экспедиции: <code>/price 12000</code>"
            );
            break;
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDB(): PDO {
    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)");
    return $pdo;
}

function getPrice(PDO $db): string {
    try {
        $row = $db->query("SELECT value FROM settings WHERE key = 'price'")->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['value'] !== '') return $row['value'];
    } catch (Exception $e) {}
    return DEFAULT_PRICE;
}

function setPrice(PDO $db, string $value): void {
    $db->prepare("INSERT INTO settings (key, value) VALUES ('price', ?)
                  ON CONFLICT(key) DO UPDATE SET value = excluded.value")
       ->execute([$value]);
}

function sendMsg($chatId, string $text): void {
    // remove_keyboard заодно убирает старую CRM-клавиатуру, если она ещё висит
    tgRequest('sendMessage', [
        'chat_id'      => $chatId,
        'text'         => $text,
        'parse_mode'   => 'HTML',
        'reply_markup' => ['remove_keyboard' => true],
    ]);
}

function tgRequest(string $method, array $payload): ?array {
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
