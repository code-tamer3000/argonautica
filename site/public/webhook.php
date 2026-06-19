<?php
require_once __DIR__ . '/config.php';

// Проверяем секрет от Telegram
$secret = $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '';
if ($secret !== WEBHOOK_SECRET) { http_response_code(403); exit; }

$update = json_decode(file_get_contents('php://input'), true);
if (!$update) exit;

$db = getDB();

if (isset($update['callback_query'])) {
    handleCallback($update['callback_query'], $db);
} elseif (isset($update['message'])) {
    handleCommand($update['message'], $db);
}

// ─── Обработка кнопок ─────────────────────────────────────────────────────────
function handleCallback(array $cq, PDO $db): void {
    $cqId   = $cq['id'];
    $data   = $cq['data'] ?? '';
    $msgId  = $cq['message']['message_id'] ?? 0;
    $chatId = $cq['message']['chat']['id'] ?? CHAT_ID;

    $parts  = explode(':', $data);
    $action = $parts[0] ?? '';
    $appId  = (int)($parts[1] ?? 0);

    if (!in_array($action, ['accept', 'reject']) || !$appId) {
        answerCallback($cqId, 'Неизвестное действие');
        return;
    }

    $status = $action === 'accept' ? 'accepted' : 'rejected';
    $db->prepare("UPDATE applications SET status = ?, updated_at = datetime('now') WHERE id = ?")
       ->execute([$status, $appId]);

    $app = $db->prepare("SELECT * FROM applications WHERE id = ?");
    $app->execute([$appId]);
    $app = $app->fetch(PDO::FETCH_ASSOC);

    if ($app) {
        $badge   = $status === 'accepted' ? '✅ <b>Принята</b>' : '❌ <b>Отклонена</b>';
        $newText = buildAppText($app) . "\n\n" . $badge;
        editMessage($chatId, $msgId, $newText);
    }

    answerCallback($cqId, $status === 'accepted' ? '✅ Принято' : '❌ Отклонено');
}

// ─── Обработка команд ─────────────────────────────────────────────────────────
function handleCommand(array $msg, PDO $db): void {
    // Отвечаем только из своего чата
    if ((string)$msg['chat']['id'] !== (string)CHAT_ID) return;

    $text = trim($msg['text'] ?? '');
    if (substr($text, 0, 1) !== '/') return;

    $cmd = strtolower(strtok($text, ' @'));

    switch ($cmd) {
        case '/start':
        case '/help':
            sendMsg(CHAT_ID, implode("\n", [
                '⚓ <b>Аргонавтика — заявки</b>',
                '',
                '/stats — статистика',
                '/pending — новые заявки',
                '/accepted — принятые',
                '/rejected — отклонённые',
            ]));
            break;
        case '/stats':
            sendStats($db);
            break;
        case '/pending':
            sendList($db, 'pending',  '⏳ Новые заявки');
            break;
        case '/accepted':
            sendList($db, 'accepted', '✅ Принятые');
            break;
        case '/rejected':
            sendList($db, 'rejected', '❌ Отклонённые');
            break;
    }
}

function sendStats(PDO $db): void {
    $row = $db->query("SELECT
        COUNT(*) as total,
        SUM(status='pending')  as pending,
        SUM(status='accepted') as accepted,
        SUM(status='rejected') as rejected
        FROM applications")->fetch(PDO::FETCH_ASSOC);

    sendMsg(CHAT_ID, implode("\n", [
        '📊 <b>Статистика заявок</b>',
        '',
        "⏳ Новых:      <b>{$row['pending']}</b>",
        "✅ Принятых:   <b>{$row['accepted']}</b>",
        "❌ Отклонённых: <b>{$row['rejected']}</b>",
        '─────────────────',
        "Всего: <b>{$row['total']}</b>",
    ]));
}

function sendList(PDO $db, string $status, string $label): void {
    $stmt = $db->prepare("SELECT * FROM applications WHERE status = ? ORDER BY id DESC LIMIT 10");
    $stmt->execute([$status]);
    $apps = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$apps) { sendMsg(CHAT_ID, "{$label}: пусто"); return; }

    sendMsg(CHAT_ID, "{$label}: <b>" . count($apps) . "</b>");
    foreach ($apps as $app) {
        $keyboard = $status === 'pending' ? makeKeyboard($app['id']) : null;
        sendMsg(CHAT_ID, buildAppText($app), $keyboard);
    }
}

// ─── Общие helpers ────────────────────────────────────────────────────────────
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

function sendMsg($chatId, string $text, ?array $keyboard = null): void {
    $payload = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
    if ($keyboard) $payload['reply_markup'] = $keyboard;
    tgRequest('sendMessage', $payload);
}

function editMessage($chatId, int $messageId, string $text): void {
    tgRequest('editMessageText', [
        'chat_id'    => $chatId,
        'message_id' => $messageId,
        'text'       => $text,
        'parse_mode' => 'HTML',
    ]);
}

function answerCallback(string $cqId, string $text = ''): void {
    tgRequest('answerCallbackQuery', ['callback_query_id' => $cqId, 'text' => $text]);
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
