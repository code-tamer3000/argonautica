<?php
// ─── Long-poll бот воронки Экспедиции (тест) ─────────────────────────────────
// Запускается кроном раз в минуту. Бот САМ забирает апдейты (getUpdates) —
// вебхук и HTTPS не нужны. Работает ~50с, потом следующий крон подхватывает.
// Воронка: анкета → [Принять] → реквизиты → чек → [Подтвердить] → «Вы приняты».
// Секреты в config_test.php.

// Авто-конфиг: если рядом есть config_test.php — тест-бот; иначе боевой config.php
if (file_exists(__DIR__ . '/config_test.php')) require __DIR__ . '/config_test.php';
else                                           require __DIR__ . '/config.php';
// Унифицируем имена констант для обеих сред
if (!defined('BOT_TOKEN'))     define('BOT_TOKEN',     defined('TEST_BOT_TOKEN') ? TEST_BOT_TOKEN : '');
if (!defined('ADMIN_CHAT'))    define('ADMIN_CHAT',    defined('CHAT_ID') ? CHAT_ID : '');
if (!defined('DEFAULT_PRICE')) define('DEFAULT_PRICE', '9000 ₽');

$TEXTS = loadTexts();   // тексты бота из bot_texts.md
@set_time_limit(0);
@ignore_user_abort(true);

// Только CLI (крон). HTTP-хиты НЕ запускают опрос — иначе случайные обращения
// (краулеры, проверки, превью ссылок) плодят параллельные getUpdates и
// конфликтуют с кроном (409 Conflict) → апдейты теряются.
if (php_sapi_name() !== 'cli') { http_response_code(200); echo 'ok'; exit; }

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
    if (!($res['ok'] ?? false)) {
        plog('getUpdates FAIL: ' . json_encode($res, JSON_UNESCAPED_UNICODE));
        sleep(2); continue;
    }
    foreach ($res['result'] as $upd) {
        logIncoming($upd);
        try {
            if (isset($upd['callback_query'])) handleCallback($upd['callback_query'], $db);
            elseif (isset($upd['message']))    handleMessage($upd['message'], $db);
        } catch (Throwable $e) {
            plog('HANDLER ERR: ' . $e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine());
        }
        $offset = $upd['update_id'] + 1;
        file_put_contents($offsetFile, $offset);
    }
}

// ─── Сообщения от человека (воронка) ─────────────────────────────────────────
function handleMessage(array $msg, PDO $db): void {
    $chatId = (string)($msg['chat']['id'] ?? '');
    if ($chatId === '') return;

    // Сообщения в админ-чате — это команды админа (/price), не воронка
    if ($chatId === (string)ADMIN_CHAT) { handleAdmin($msg, $db); return; }

    $text = trim($msg['text'] ?? '');

    if (strncmp($text, '/start', 6) === 0) {
        $name  = trim(($msg['from']['first_name'] ?? '') . ' ' . ($msg['from']['last_name'] ?? ''));
        $uname = $msg['from']['username'] ?? '';
        upsertLead($db, $chatId, $name, $uname);
        sendMsg($chatId, t('start'));
        return;
    }

    $lead = getLead($db, $chatId);
    if (!$lead) { sendMsg($chatId, t('need_start')); return; }

    switch ($lead['status']) {
        case 'await_about':
            if ($text === '') { sendMsg($chatId, t('ask_about')); return; }
            setLead($db, $lead['id'], ['about' => $text, 'status' => 'pending_accept']);
            mirrorLead($db, $lead['id']);
            sendMsg($chatId, t('submitted'));
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
                sendMsg($chatId, t('receipt_got'));
            } else {
                sendMsg($chatId, t('need_receipt'));
            }
            break;

        case 'pending_accept':  sendMsg($chatId, t('wait_decision'));      break;
        case 'pending_confirm': sendMsg($chatId, t('wait_payment_check')); break;
        case 'done':            sendMsg($chatId, t('already_done'));       break;
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
        sendMsg($lead['chat_id'], t('accepted', ['price' => bookPrice($db)]));
        editText($admChat, $admMsgId, leadCard($lead, $lead['about']) . "\n\n✔ <b>Принят</b>");
        answerCb($cqId, 'Принято ✓');
    } elseif ($action === 'confirm') {
        setLead($db, $leadId, ['status' => 'done']);
        mirrorLead($db, $leadId);
        sendMsg($lead['chat_id'], t('confirmed'));
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

// Лог ошибок воронки (для диагностики) → .poll_err.log
function plog(string $line): void {
    @file_put_contents(__DIR__ . '/.poll_err.log', date('Y-m-d H:i:s') . ' ' . $line . "\n", FILE_APPEND);
}

// Лог всех сообщений бота (входящие + исходящие с результатом) → .bot.log
function mlog(string $dir, $chatId, string $tag, string $content, $ok = null): void {
    $content = mb_substr(str_replace(["\n", "\r"], ' ', $content), 0, 300);
    $okStr = $ok === null ? '    ' : ($ok ? 'ok  ' : 'FAIL');
    $line = date('Y-m-d H:i:s') . ' ' . strtoupper($dir) . ' ' . $okStr
          . ' chat=' . $chatId . ' ' . $tag . ' | ' . $content;
    @file_put_contents(__DIR__ . '/.bot.log', $line . "\n", FILE_APPEND);
}
function logIncoming(array $upd): void {
    if (isset($upd['callback_query'])) {
        $cq  = $upd['callback_query'];
        $cid = $cq['message']['chat']['id'] ?? '';
        $who = '@' . ($cq['from']['username'] ?? ($cq['from']['first_name'] ?? '?'));
        mlog('in', $cid, $who, 'callback: ' . ($cq['data'] ?? ''));
    } elseif (isset($upd['message'])) {
        $m   = $upd['message'];
        $cid = $m['chat']['id'] ?? '';
        $who = '@' . ($m['from']['username'] ?? ($m['from']['first_name'] ?? '?'));
        if      (isset($m['text']))     $content = 'text: ' . $m['text'];
        elseif  (isset($m['document'])) $content = 'document: ' . ($m['document']['file_name'] ?? 'file');
        elseif  (isset($m['photo']))    $content = 'photo';
        elseif  (isset($m['voice']))    $content = 'voice';
        else                            $content = 'other';
        mlog('in', $cid, $who, $content);
    }
}

// ─── Тексты из bot_texts.md (блоки "## ключ") ────────────────────────────────
function loadTexts(): array {
    $raw = @file_get_contents(__DIR__ . '/bot_texts.md');
    if ($raw === false) return [];
    $out = [];
    foreach (preg_split('/^##\s+/m', $raw) as $block) {
        $block = trim($block);
        if ($block === '') continue;
        $nl   = strpos($block, "\n");
        $key  = trim($nl === false ? $block : substr($block, 0, $nl));
        $body = $nl === false ? '' : trim(substr($block, $nl + 1));
        if ($key !== '') $out[$key] = $body;
    }
    return $out;
}
function t(string $key, array $repl = []): string {
    global $TEXTS;
    $s = $TEXTS[$key] ?? '';
    foreach ($repl as $k => $v) $s = str_replace('{' . $k . '}', $v, $s);
    return $s;
}
// Цена брони = актуальная цена сайта (settings.price); для "{price} руб." — только число
function bookPrice(PDO $db): string {
    $p = defined('DEFAULT_PRICE') ? DEFAULT_PRICE : '';
    try {
        $row = $db->query("SELECT value FROM settings WHERE key='price'")->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['value'] !== '') $p = $row['value'];
    } catch (Throwable $e) {}
    $digits = trim(preg_replace('/[^\d ]/u', '', $p));
    return $digits !== '' ? $digits : $p;
}

// ─── Команды админа в админ-чате (/price) ────────────────────────────────────
function handleAdmin(array $msg, PDO $db): void {
    $text = trim($msg['text'] ?? '');
    if ($text === '' || $text[0] !== '/') return;
    $parts = preg_split('/\s+/', $text, 2);
    $cmd   = strtolower(strtok($parts[0], '@'));
    $arg   = trim($parts[1] ?? '');

    if ($cmd === '/price') {
        if ($arg === '') {
            sendMsg(ADMIN_CHAT, "Текущая цена на сайте: <b>" . htmlspecialchars(getPrice($db), ENT_QUOTES) . "</b>\n\nИзменить: <code>/price 12000</code>");
            return;
        }
        $val = preg_match('/^\d[\d\s]*$/u', $arg) ? preg_replace('/\s+/', ' ', $arg) . ' ₽' : $arg;
        if (mb_strlen($val) > 50) $val = mb_substr($val, 0, 50);
        setPrice($db, $val);
        sendMsg(ADMIN_CHAT, "✅ Новая цена на сайте: <b>" . htmlspecialchars($val, ENT_QUOTES) . "</b>");
    }
}
function getPrice(PDO $db): string {
    try {
        $row = $db->query("SELECT value FROM settings WHERE key='price'")->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['value'] !== '') return $row['value'];
    } catch (Throwable $e) {}
    return DEFAULT_PRICE;
}
function setPrice(PDO $db, string $value): void {
    $db->prepare("INSERT INTO settings (key, value) VALUES ('price', ?)
                  ON CONFLICT(key) DO UPDATE SET value = excluded.value")
       ->execute([$value]);
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
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)");
    return $pdo;
}
function upsertLead(PDO $db, string $chatId, string $name, string $uname): void {
    // SELECT-then-write: повторный /start не «съедает» autoincrement → нет дыр в нумерации
    if (getLead($db, $chatId)) {
        $db->prepare("UPDATE leads SET name=?, username=?, about='', status='await_about', updated_at=datetime('now') WHERE chat_id=?")
           ->execute([$name, $uname, $chatId]);
    } else {
        $db->prepare("INSERT INTO leads (chat_id, name, username, status) VALUES (?, ?, ?, 'await_about')")
           ->execute([$chatId, $name, $uname]);
    }
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
    $ch = curl_init('https://api.telegram.org/bot' . BOT_TOKEN . '/' . $method);
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => $timeout,
    ]);
    $res = curl_exec($ch); curl_close($ch);
    $d = json_decode($res, true);

    // Лог исходящих сообщений (только методы отправки/правки), с результатом доставки
    if (in_array($method, ['sendMessage', 'copyMessage', 'editMessageText', 'editMessageCaption'], true)) {
        $ok  = (isset($d['ok']) && $d['ok']) ? 1 : 0;
        $txt = $payload['text'] ?? ($payload['caption'] ?? '');
        if (!$ok) $txt .= ' :: ' . (isset($d['description']) ? $d['description'] : 'нет ответа');
        mlog('out', $payload['chat_id'] ?? '', $method, $txt, $ok);
    }
    return $d;
}
