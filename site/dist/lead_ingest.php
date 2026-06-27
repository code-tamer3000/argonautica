<?php
// ─── Приём заявок из бота в основную базу сайта ──────────────────────────────
// Бот (poll.php) шлёт сюда заявку при каждом изменении статуса. Пишем в leads.
// Защита — общий ключ INGEST_KEY (в config.php прода).

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) { http_response_code(400); echo json_encode(['ok' => false]); exit; }

$key = defined('INGEST_KEY') ? INGEST_KEY : '';
if ($key === '' || !hash_equals($key, (string)($data['key'] ?? ''))) {
    http_response_code(403); echo json_encode(['ok' => false]); exit;
}

$chatId   = (string)($data['chat_id'] ?? '');
$name     = trim((string)($data['name'] ?? ''));
$username = trim((string)($data['username'] ?? ''));
$about    = trim((string)($data['about'] ?? ''));
$status   = trim((string)($data['status'] ?? ''));
if ($chatId === '') { http_response_code(400); echo json_encode(['ok' => false]); exit; }

try {
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
        status     TEXT    DEFAULT '',
        created_at TEXT    DEFAULT (datetime('now')),
        updated_at TEXT
    )");
    $pdo->prepare("INSERT INTO leads (chat_id, name, username, about, status)
                   VALUES (?, ?, ?, ?, ?)
                   ON CONFLICT(chat_id) DO UPDATE SET
                     name=excluded.name, username=excluded.username,
                     about=excluded.about, status=excluded.status,
                     updated_at=datetime('now')")
        ->execute([$chatId, $name, $username, $about, $status]);
    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false]);
}
