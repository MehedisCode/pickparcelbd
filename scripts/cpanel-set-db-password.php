<?php

// CLI-only helper: run with terminal echo disabled; never pass a password in argv.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$base = '/home/kinboame/pickparcel-staging';
require $base.'/current/backend/vendor/autoload.php';
$file = $base.'/shared/backend.env';

try {
    $text = file_get_contents($file);
    $before = Dotenv\Dotenv::parse($text);
    if (($before['DB_DATABASE'] ?? '') !== 'kinboame_pp_staging'
        || ($before['DB_USERNAME'] ?? '') !== 'kinboame_pp_stg_app') {
        throw new RuntimeException('Unexpected database target.');
    }
    fwrite(STDOUT, "Paste the existing password for kinboame_pp_stg_app, then press Enter (input hidden): ");
    $line = fgets(STDIN, 4098);
    if ($line === false) {
        throw new RuntimeException('No input.');
    }
    $password = rtrim($line, "\r\n");
    if ($password === '' || strlen($password) > 4096 || preg_match('/[\x00-\x1f\x7f]/', $password)) {
        throw new RuntimeException('Invalid input.');
    }
    $encoded = '"'.str_replace(['\\', '"', '$'], ['\\\\', '\\"', '\\$'], $password).'"';
    $updated = preg_replace_callback('/^DB_PASSWORD=.*$/m', fn () => 'DB_PASSWORD='.$encoded, $text, 1, $count);
    if ($count !== 1) {
        throw new RuntimeException('Missing password setting.');
    }
    $after = Dotenv\Dotenv::parse($updated);
    if (($after['DB_PASSWORD'] ?? null) !== $password) {
        throw new RuntimeException('Password encoding failed.');
    }
    unset($before['DB_PASSWORD'], $after['DB_PASSWORD']);
    if ($before !== $after) {
        throw new RuntimeException('Unexpected configuration changes.');
    }
    $temporary = tempnam(dirname($file), '.env-write-');
    chmod($temporary, 0600);
    if (file_put_contents($temporary, $updated, LOCK_EX) === false || ! rename($temporary, $file)) {
        throw new RuntimeException('Cannot save configuration.');
    }
    fwrite(STDOUT, "\nDatabase password saved privately. Other settings preserved.\n");
} catch (Throwable) {
    // Parser messages could include the password; deliberately omit exception details.
    fwrite(STDERR, "\nConfiguration was not saved. Retry with the existing database password.\n");
    exit(1);
}
