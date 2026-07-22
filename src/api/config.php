<?php
// Hostinger MySQL credentials

$env = [];
$envPaths = [];
$envPaths[] = __DIR__ . '/../.env';
$envPaths[] = dirname(__DIR__) . '/.env';
$envPaths[] = ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/.env';
$envPaths[] = (dirname($_SERVER['SCRIPT_FILENAME'] ?? '') ?: getcwd()) . '/.env';
$envPaths[] = getcwd() . '/.env';

foreach (array_unique(array_filter($envPaths)) as $path) {
    if (!file_exists($path)) {
        continue;
    }

    $envLines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }

        if (preg_match('/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/', $line, $matches)) {
            $value = trim($matches[2]);
            if ((strlen($value) >= 2) && (($value[0] === '"' && substr($value, -1) === '"') || ($value[0] === "'" && substr($value, -1) === "'"))) {
                $value = substr($value, 1, -1);
            }
            $value = rtrim($value, ',');
            $env[$matches[1]] = $value;
        }
    }
}

$env = array_merge($_ENV, $_SERVER, $env);

function get_env_value($key, $default = null) {
    global $env;
    return isset($env[$key]) ? $env[$key] : ($default ?? getenv($key));
}

define('DB_HOST', get_env_value('DB_HOST', 'localhost'));
define('DB_NAME', get_env_value('DB_NAME', 'u866750606_lifehope_db'));
define('DB_USER', get_env_value('DB_USER', 'u866750606_lifehope_user'));
define('DB_PASS', get_env_value('DB_PASS', 'Lifehope2026'));

define('CASHFREE_APP_ID', get_env_value('CASHFREE_APP_ID', ''));
define('CASHFREE_SECRET_KEY', get_env_value('CASHFREE_SECRET_KEY', ''));
define('CASHFREE_WEBHOOK_SECRET', get_env_value('CASHFREE_WEBHOOK_SECRET', ''));
define('CASHFREE_API_BASE', get_env_value('CASHFREE_API_BASE', 'https://api.cashfree.com'));