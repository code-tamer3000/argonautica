<?php
// ─── Long-poll бот воронки Экспедиции (тест) ─────────────────────────────────
// Запускается кроном раз в минуту. Бот САМ забирает апдейты (getUpdates) —
// вебхук и HTTPS не нужны. Работает ~50с, потом следующий крон подхватывает.
// Воронка: анкета → [Принять] → реквизиты → чек → [Подтвердить] → «Вы приняты».
// Секреты в config_test.php.

require __DIR__ . '/config_test.php';
@set_time_limit(0);
@ignore_user_abort(true);

// Вызов по URL (cron-job.org): сразу отдаём 200 и продолжаем опрос в фоне,
// чтобы внешний крон не ждал и не считал таймаут.
if (php_sapi_name() !== 'cli') {
    if (!headers_sent()) header('Content-Type: text/plain; charset=utf-8');
    echo "ok\n";
    if (function_exists('fastcgi_finish_request')) @fastcgi_finish_request();
}

// Не даём двум вызовам опрашивать одновременно (иначе Telegram отдаёт 409)
$lock = fopen(__DIR__ . '/.argo_test_lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) { exit; }

$db = getDB();
tgApi('deleteWebhook', []);   // на случай, если когда-то ставили вебхук

$offsetFile = __DIR__ . '/.argo_test_offset';
$offset = file_exists($offsetFile) ? (int)file_get_contents($offsetFile) : 0;

// Держим процесс ~58с (почти всю минуту до следующего крона), отвечая мгновенно.
// Длину long-poll привязываем к остатку времени, чтобы не вылезти за дедлайн.
$deadline = time() + 58;
while (true) {
    $remaining = $deadline - time();
    if ($remaining <= 1) break;
    $pollTimeout = min(20, $remaining - 1);
    $res = tgApi('getUpdates', ['offset' => $offset, 'timeout' => $pollTimeout, 'limit' => 50], $pollTimeout + 10);
    if (!($res['ok'] ?? false)) { sleep(2); continue; }
    foreach ($res['result'] as $upd) {
        try {
            if (isset($upd['callback_query'])) handleCallback($upd['callback_query'], $db);
            elseif (isset($upd['message']))    handleMessage($upd['message'], $db);
        } catch (Throwable $e) { /* один битый апдейт не роняет цикл */ }
        $offset = $upd['update_id'] + 1;
        file_put_contents($offsetFile, $offset);
    }
}

// ─── Сообщения от человека (воронка) ─────────────────────────────────────────
function handleMessage(array $msg, PDO $db): void {
    $chatId = (string)($msg['chat']['id'] ?? '');
    if ($chatId === '') return;
    $text = trim($msg['text'] ?? '');

    if (strncmp($text, '/start', 6) === 0) {
        $name  = trim(($msg['from']['first_name'] ?? '') . ' ' . ($msg['from']['last_name'] ?? ''));
        $uname = $msg['from']['username'] ?? '';
        upsertLead($db, $chatId, $name, $uname);
        sendMsg($chatId,
            "⚓ <b>Экспедиция «Искусство посылания на Хер»</b>\n\n" .
            "Путь Аргонавта: 28 дней, 5 миров, освобождение внимания и проявление своего Дела.\n\n" .
            "Чтобы выйти на борт — расскажи о себе одним сообщением: <b>кто ты, в какой точке сейчас и что хочешь изменить.</b> 👇");
        return;
    }

    $lead = getLead($db, $chatId);
    if (!$lead) { sendMsg($chatId, "Чтобы начать — напиши /start."); return; }

    switch ($lead['status']) {
        case 'await_about':
            if ($text === '') { sendMsg($chatId, "Расскажи о себе текстом — одним сообщением. 🙏"); return; }
            setLead($db, $lead['id'], ['about' => $text, 'status' => 'pending_accept']);
            mirrorLead($db, $lead['id']);
            sendMsg($chatId,
                "✦ <b>Заявка принята к рассмотрению.</b>\n\n" .
                "Мы читаем каждую анкету лично. Как решим — вернёмся сюда. Жди весточку. ⚓");
            sendMsg(ADMIN_CHAT, leadCard($lead, $text), [[
                ['text' => '✅ Принять', 'callback_data' => "accept:{$lead['id']}"],
            ]]);
            break;

        case 'await_payment':
            if (isset($msg['document']) || isset($msg['photo'])) {
                copyMsg(ADMIN_CHAT, $chatId, $msg['message_id'],
                    "🧾 Чек по заявке #{$lead['id']} — " . leadWho($lead),
                    [[ ['text' => '✅ Подтвердить оплату', 'callback_data' => "confirm:{$lead['id']}"] ]]);
                setLead($db, $lead['id'], ['status' => 'pending_confirm']);
                mirrorLead($db, $lead['id']);
                sendMsg($chatId, "✦ Чек получен. Проверяем оплату — это недолго.");
            } else {
                sendMsg($chatId, "Чтобы подтвердить место — пришли чек об оплате: PDF-файлом или скриншотом. 🧾");
            }
            break;

        case 'pending_accept':  sendMsg($chatId, "Твоя заявка на рассмотрении. Вернёмся с решением — жди здесь. ⚓"); break;
        case 'pending_confirm': sendMsg($chatId, "Проверяем оплату. Скоро подтвердим. ✦");                          break;
        case 'done':            sendMsg($chatId, "Ты уже на борту Экспедиции 🎉 Следи за этим чатом — пришлём детали старта."); break;
    }
}

// ─── Кнопки админа ───────────────────────────────────────────────────────────
function handleCallback(array $cq, PDO $db): void {
    $cqId     = $cq['id'];
    $admChat  = (string)($cq['message']['chat']['id'] ?? ADMIN_CHAT);
    $admMsgId = $cq['message']['message_id'] ?? 0;
    [$action, $leadIdRaw] = array_pad(explode(':', $cq['data'] ?? ''), 2, '');
    $leadId = (int)$leadIdRaw;

    $lead = $leadId ? getLeadById($db, $leadId) : null;
    if (!$lead) { answerCb($cqId, 'Заявка не найдена'); return; }

    if ($action === 'accept') {
        setLead($db, $leadId, ['status' => 'await_payment']);
        mirrorLead($db, $leadId);
        sendMsg($lead['chat_id'],
            "✦ <b>Тебя приняли в Экспедицию.</b>\n\n" . PAYMENT_TEXT .
            "\n\nПосле оплаты пришли сюда чек — PDF-файлом или скриншотом. Как получим — подтвердим место. ⚓");
        editText($admChat, $admMsgId, leadCard($lead, $lead['about']) . "\n\n✔ <b>Принят</b>");
        answerCb($cqId, 'Принято ✓');
    } elseif ($action === 'confirm') {
        setLead($db, $leadId, ['status' => 'done']);
        mirrorLead($db, $leadId);
        sendMsg($lead['chat_id'],
            "🎉 <b>Оплата подтверждена. Ты в команде Экспедиции.</b>\n\n" .
            "Добро пожаловать на борт, Аргонавт. Детали старта и доступы пришлём отдельно — следи за этим чатом. ⚓");
        editCaption($admChat, $admMsgId, "🧾 Чек по заявке #{$lead['id']} — " . leadWho($lead) . "\n\n✔ <b>Подтверждён</b>");
        answerCb($cqId, 'Подтверждено ✓');
    } else {
        answerCb($cqId, 'Неизвестное действие');
    }
}

// ─── Карточка заявки ─────────────────────────────────────────────────────────
function leadCard(array $lead, string $about): string {
    $who   = leadWho($lead);
    $about = htmlspecialchars($about, ENT_QUOTES);
    return "📥 <b>Заявка #{$lead['id']}</b>\n👤 {$who}\n\n📝 <b>О себе:</b>\n{$about}";
}
function leadWho(array $lead): string {
    if (!empty($lead['username'])) return '@' . htmlspecialchars($lead['username'], ENT_QUOTES);
    $name = trim($lead['name'] ?? '');
    return $name !== '' ? htmlspecialchars($name, ENT_QUOTES) : "id {$lead['chat_id']}";
}

// ─── Бэкап заявки в основную базу сайта (если задан INGEST_URL в конфиге) ─────
function mirrorLead(PDO $db, int $id): void {
    if (!defined('INGEST_URL') || INGEST_URL === '') return;
    $lead = getLeadById($db, $id);
    if (!$lead) return;
    $ch = curl_init(INGEST_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'key'      => defined('INGEST_KEY') ? INGEST_KEY : '',
            'chat_id'  => $lead['chat_id'],
            'name'     => $lead['name'],
            'username' => $lead['username'],
            'about'    => $lead['about'],
            'status'   => $lead['status'],
        ]),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_TIMEOUT => 8,
    ]);
    @curl_exec($ch); curl_close($ch);
}

// ─── БД (leads) ──────────────────────────────────────────────────────────────
function getDB(): PDO {
    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA busy_timeout=5000');
    $pdo->exec('PRAGMA journal_mode=WAL');
    $pdo->exec("CREATE TABLE IF NOT EXISTS leads (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id    TEXT    NOT NULL UNIQUE,
        name       TEXT    DEFAULT '',
        username   TEXT    DEFAULT '',
        about      TEXT    DEFAULT '',
        status     TEXT    DEFAULT 'await_about',
        created_at TEXT    DEFAULT (datetime('now')),
        updated_at TEXT
    )");
    return $pdo;
}
function upsertLead(PDO $db, string $chatId, string $name, string $uname): void {
    $db->prepare("INSERT INTO leads (chat_id, name, username, status) VALUES (?, ?, ?, 'await_about')
                  ON CONFLICT(chat_id) DO UPDATE SET name=excluded.name, username=excluded.username,
                  about='', status='await_about', updated_at=datetime('now')")
       ->execute([$chatId, $name, $uname]);
}
function getLead(PDO $db, string $chatId): ?array {
    $s = $db->prepare("SELECT * FROM leads WHERE chat_id = ?"); $s->execute([$chatId]);
    return $s->fetch(PDO::FETCH_ASSOC) ?: null;
}
function getLeadById(PDO $db, int $id): ?array {
    $s = $db->prepare("SELECT * FROM leads WHERE id = ?"); $s->execute([$id]);
    return $s->fetch(PDO::FETCH_ASSOC) ?: null;
}
function setLead(PDO $db, int $id, array $fields): void {
    $sets = []; $vals = [];
    foreach ($fields as $k => $v) { $sets[] = "$k = ?"; $vals[] = $v; }
    $sets[] = "updated_at = datetime('now')";
    $vals[] = $id;
    $db->prepare("UPDATE leads SET " . implode(', ', $sets) . " WHERE id = ?")->execute($vals);
}

// ─── Telegram API ────────────────────────────────────────────────────────────
function sendMsg($chatId, string $text, ?array $inlineKb = null): void {
    $p = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
    if ($inlineKb) $p['reply_markup'] = ['inline_keyboard' => $inlineKb];
    tgApi('sendMessage', $p);
}
function copyMsg($toChat, $fromChat, int $msgId, string $caption, array $inlineKb): void {
    tgApi('copyMessage', [
        'chat_id' => $toChat, 'from_chat_id' => $fromChat, 'message_id' => $msgId,
        'caption' => $caption, 'parse_mode' => 'HTML',
        'reply_markup' => ['inline_keyboard' => $inlineKb],
    ]);
}
function editText($chatId, int $msgId, string $text): void {
    tgApi('editMessageText', ['chat_id' => $chatId, 'message_id' => $msgId, 'text' => $text, 'parse_mode' => 'HTML']);
}
function editCaption($chatId, int $msgId, string $caption): void {
    tgApi('editMessageCaption', ['chat_id' => $chatId, 'message_id' => $msgId, 'caption' => $caption, 'parse_mode' => 'HTML']);
}
function answerCb(string $cqId, string $text): void {
    tgApi('answerCallbackQuery', ['callback_query_id' => $cqId, 'text' => $text]);
}
function tgApi(string $method, array $payload, int $timeout = 10): ?array {
    $ch = curl_init('https://api.telegram.org/bot' . TEST_BOT_TOKEN . '/' . $method);
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => $timeout,
    ]);
    $res = curl_exec($ch); curl_close($ch);
    return json_decode($res, true);
}
