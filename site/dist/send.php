<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://argonautica-systems.ru');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); echo json_encode(['ok' => false]); exit; }

// ─── Rate limiting ────────────────────────────────────────────────────────────
$ip       = preg_replace('/[^a-f0-9:.]/', '', $_SERVER['REMOTE_ADDR'] ?? '');
$rateFile = sys_get_temp_dir() . '/argo_rate_' . md5($ip) . '.json';
$now      = time();
$hits     = file_exists($rateFile) ? (json_decode(file_get_contents($rateFile), true) ?? []) : [];
$hits     = array_values(array_filter($hits, fn($t) => $now - $t < 60));
if (count($hits) >= 3) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'error' => 'Слишком много запросов. Подожди минуту.']);
    exit;
}
$hits[] = $now;
file_put_contents($rateFile, json_encode($hits));

// ─── Парсим тело ─────────────────────────────────────────────────────────────
$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) { http_response_code(400); echo json_encode(['ok' => false]); exit; }

// ─── Honeypot ─────────────────────────────────────────────────────────────────
if (!empty($data['website'])) { echo json_encode(['ok' => true]); exit; }

// ─── Валидация ────────────────────────────────────────────────────────────────
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
$about = trim($data['about'] ?? '');
if (mb_strlen($about) > 1000) $about = mb_substr($about, 0, 1000) . '…';

// ─── Сохраняем в БД ───────────────────────────────────────────────────────────
$db   = getDB();
$stmt = $db->prepare("INSERT INTO applications (contact, about, ip) VALUES (?, ?, ?)");
$stmt->execute([$contact, $about, $ip]);
$appId = (int)$db->lastInsertId();

// ─── Отправляем в Telegram ────────────────────────────────────────────────────
$text = buildAppText(['id' => $appId, 'contact' => $contact, 'about' => $about, 'created_at' => date('Y-m-d H:i:s')]);
$res  = tgRequest('sendMessage', [
    'chat_id'      => CHAT_ID,
    'text'         => $text,
    'parse_mode'   => 'HTML',
    'reply_markup' => makeKeyboard($appId),
]);

if (!empty($res['ok'])) {
    $msgId = $res['result']['message_id'] ?? 0;
    $db->prepare("UPDATE applications SET message_id = ? WHERE id = ?")
       ->execute([$msgId, $appId]);
    echo json_encode(['ok' => true]);
} else {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => $res['description'] ?? 'Ошибка Telegram']);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDB(): PDO {
    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE TABLE IF NOT EXISTS applications (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        contact    TEXT    NOT NULL,
        about      TEXT    DEFAULT '',
        status     TEXT    DEFAULT 'pending',
        ip         TEXT    DEFAULT '',
        message_id INTEGER DEFAULT 0,
        created_at TEXT    DEFAULT (datetime('now')),
        updated_at TEXT
    )");
    return $pdo;
}

function buildAppText(array $app): string {
    $date    = date('d.m.Y H:i', strtotime($app['created_at']));
    $contact = htmlspecialchars($app['contact'], ENT_QUOTES);
    $about   = htmlspecialchars($app['about'],   ENT_QUOTES);
    $lines   = ["📥 <b>Заявка #{$app['id']}</b>", "👤 <b>Контакт:</b> <code>{$contact}</code>"];
    if ($about !== '') $lines[] = "\n📝 <b>О себе:</b>\n{$about}";
    $lines[] = "\n🕐 {$date}";
    return implode("\n", $lines);
}

function makeKeyboard(int $appId): array {
    return ['inline_keyboard' => [[
        ['text' => '✅ Принять',    'callback_data' => "accept:{$appId}"],
        ['text' => '❌ Отклонить', 'callback_data' => "reject:{$appId}"],
    ]]];
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
