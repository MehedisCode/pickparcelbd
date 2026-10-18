<?php
try {
    $base = $argv[1];
    require $base.'/vendor/autoload.php';
    $app = require $base.'/bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $ran = Illuminate\Support\Facades\DB::table('migrations')->pluck('migration')->all();
    $files = array_map(fn ($file) => basename($file, '.php'), glob($base.'/database/migrations/*.php'));
    echo count(array_diff($files, $ran));
} catch (Throwable $e) {
    fwrite(STDERR, "Could not inspect staging migration history\n");
    exit(1);
}
