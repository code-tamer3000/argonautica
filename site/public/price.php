<?php
require_once __DIR__ . '/config.php';

const DEFAULT_PRICE = '9000 ₽';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$price = DEFAULT_PRICE;
try {
    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)");
    $row = $pdo->query("SELECT value FROM settings WHERE key = 'price'")->fetch(PDO::FETCH_ASSOC);
    if ($row && $row['value'] !== '') $price = $row['value'];
} catch (Exception $e) {
    // тихо отдаём дефолт
}

echo json_encode(['price' => $price], JSON_UNESCAPED_UNICODE);
