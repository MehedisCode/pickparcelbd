<?php
try {
    $base = $argv[1];
    require $base.'/vendor/autoload.php';
    $app = require $base.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    foreach (['/up' => 200, '/api/v1/config' => 200, '/api/v1/session' => 200, '/api/v1/dashboard' => 401] as $path => $expected) {
        $request = Illuminate\Http\Request::create('https://staging-api.pickparcelbd.com'.$path, 'GET', [], [], [], ['HTTP_ACCEPT' => 'application/json']);
        $response = $kernel->handle($request);
        if ($response->getStatusCode() !== $expected) {
            throw new RuntimeException('Unexpected health status');
        }
        $kernel->terminate($request, $response);
    }
    if (config('database.connections.'.config('database.default').'.database') !== 'kinboame_pp_staging'
        || config('app.debug') || config('app.env') !== 'staging') {
        throw new RuntimeException('Incorrect staging configuration');
    }
    echo "Private staging release checks passed\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Private staging release checks failed; inspect private server logs\n");
    exit(1);
}
