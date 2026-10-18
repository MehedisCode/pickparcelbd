<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'auth/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://127.0.0.1:3000')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Content-Type', 'X-XSRF-TOKEN', 'X-Requested-With', 'Idempotency-Key', 'Authorization'],
    'exposed_headers' => ['Content-Disposition'], 'max_age' => 0, 'supports_credentials' => true,
];
