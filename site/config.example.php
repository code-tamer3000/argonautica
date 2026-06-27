<?php
// Скопируй в config.php на сервере и заполни. Никогда не коммитится в git.

define('BOT_TOKEN', 'ВАШ_BOT_TOKEN');
define('CHAT_ID',   'ВАШ_CHAT_ID');
define('DB_PATH',   __DIR__ . '/.argo.db');

// Ключ для приёма заявок из бота (lead_ingest.php). Совпадает с INGEST_KEY в боте.
define('INGEST_KEY', 'придумай-длинную-строку');

// Необязательно: ключ для веб-крона. Если задать — дёргать cron.php?key=ЭТО_ЗНАЧЕНИЕ.
// Если не задавать — cron.php по URL открыт (эндпоинт ничего не отдаёт).
// define('CRON_KEY', 'придумай-длинную-строку');
