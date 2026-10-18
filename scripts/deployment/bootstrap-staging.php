<?php
// Run once through cPanel Terminal after installing the private receiver scripts.
// Keeps cPanel's physical document roots and Passenger registration unchanged.
if (PHP_SAPI !== 'cli') {
    exit(1);
}
$root = '/home/kinboame/pickparcel-staging';
$anchor = $root.'/releases/20261018-b14733f';
if (!is_link($root.'/current') || !is_file($anchor.'/frontend/app.js') || !is_file($anchor.'/backend/public/index.php')) {
    fwrite(STDERR, "Initial staging layout was not found\n");
    exit(1);
}
$backup = $root.'/shared/deployment/bootstrap-backup-'.date('YmdHis');
mkdir($backup, 0700, true);
copy($anchor.'/frontend/app.js', $backup.'/app.js');
copy($anchor.'/backend/public/index.php', $backup.'/index.php');
$launcher = <<<'JS'
const fs = require('node:fs');
process.env.NODE_ENV = 'production';
process.env.HOSTNAME = '127.0.0.1';
process.env.BACKEND_URL = 'https://staging-api.pickparcelbd.com';
process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.pickparcelbd.com';
require(fs.realpathSync('/home/kinboame/pickparcel-staging/current/frontend/runtime/server.js'));
JS;
$entry = <<<'PHP'
<?php
clearstatcache(true);
require realpath('/home/kinboame/pickparcel-staging/current/backend/public/index.php');
PHP;
// The initial current release cannot point back into the stable wrapper itself.
// Preserve it as a sibling baseline before replacing the stable public entry.
$baseline = $root.'/releases/baseline-before-cicd';
if (!is_dir($baseline)) {
    $command = 'cp -a '.escapeshellarg($anchor).' '.escapeshellarg($baseline);
    passthru($command, $status);
    if ($status !== 0) {
        exit($status);
    }
}
if (realpath($root.'/current') === realpath($anchor)) {
    if (!symlink($baseline, $root.'/current.bootstrap')) {
        exit(1);
    }
    if (!rename($root.'/current.bootstrap', $root.'/current')) {
        exit(1);
    }
}
file_put_contents($anchor.'/frontend/app.js', $launcher.PHP_EOL);
file_put_contents($anchor.'/backend/public/index.php', $entry.PHP_EOL);
chmod($anchor.'/frontend/app.js', 0644);
chmod($anchor.'/backend/public/index.php', 0644);
if (!is_dir($anchor.'/frontend/tmp')) {
    mkdir($anchor.'/frontend/tmp', 0755);
}
touch($anchor.'/frontend/tmp/restart.txt');
echo "Stable staging entry points installed; original files backed up privately\n";
