<?php
// Used only by the restricted staging receiver. No credentials are read here.
try {
    [$script, $archive, $commit] = $argv;
    $names = [];
    exec('tar --quoting-style=escape -tzf '.escapeshellarg($archive), $names, $status);
    if ($status !== 0 || count($names) > 100000) {
        throw new RuntimeException('Invalid archive');
    }
    foreach ($names as $name) {
        if (!preg_match('~^(backend(?:/|$)|frontend(?:/runtime(?:/|$)|/$|$)|release\.json$)~', $name)
            || str_contains($name, '\\') || preg_match('~(^|/)\.\.(/|$)|[\x00-\x1f\x7f]~', $name)
            || preg_match('~(^|/)(\.env[^/]*|auth\.json)(/|$)~', $name)) {
            throw new RuntimeException('Invalid archive entry');
        }
    }
    $details = [];
    exec('tar --quoting-style=escape -tvzf '.escapeshellarg($archive), $details, $status);
    $bytes = 0;
    foreach ($details as $line) {
        // Reject both symbolic and hard links, special files and oversized releases.
        if (!preg_match('~^[-d][rwxstST-]{9}\s+\S+\s+(\d+)\s~', $line, $match)) {
            throw new RuntimeException('Only regular files and directories are accepted');
        }
        $bytes += (int) $match[1];
        if ($bytes > 1073741824) {
            throw new RuntimeException('Expanded release exceeds 1 GiB');
        }
    }
    if ($status !== 0 || count($details) !== count($names)) {
        throw new RuntimeException('Invalid archive listing');
    }
    $metadata = [];
    exec('tar -xOzf '.escapeshellarg($archive).' release.json', $metadata, $status);
    $metadata = json_decode(implode("\n", $metadata), true, 512, JSON_THROW_ON_ERROR);
    if ($status !== 0 || ($metadata['commit'] ?? '') !== $commit
        || !in_array('backend/artisan', $names, true)
        || !in_array('backend/vendor/autoload.php', $names, true)
        || !in_array('frontend/runtime/server.js', $names, true)) {
        throw new RuntimeException('Incomplete release');
    }
    echo "Release archive validated\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Release validation failed\n");
    exit(1);
}
