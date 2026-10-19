<?php

return [
    'geocoding_enabled' => env('GEOCODING_ENABLED', false),
    'geocoding_url' => env('GEOCODING_URL', 'https://nominatim.openstreetmap.org'),
    'geocoding_user_agent' => env('GEOCODING_USER_AGENT', 'PickParcelBD/1.0 (+https://pickparcelbd.com)'),
    'frontend_url' => env('FRONTEND_URL', 'http://127.0.0.1:3000'),
    'preview_login' => env('PREVIEW_LOGIN', in_array(env('APP_ENV'), ['staging', 'local'], true)),
    'base_charge' => '60.00',
    'extra_per_100g' => '3.00',
    'included_weight_grams' => 1000,
    'transfer_minutes' => 30,
    'ride_radius_km' => 3,
    'driver_fresh_minutes' => 15,
    'roles' => ['customer', 'rider', 'union_agent', 'upazila_agent', 'district_agent', 'super_admin'],
    'member_roles' => ['rider', 'union_agent', 'upazila_agent', 'district_agent'],
    'support_email' => env('SUPPORT_EMAIL', 'support@example.com'),
    'support_phone' => env('SUPPORT_PHONE', '01XXXXXXXXX'),
    'firebase_credentials' => env('FIREBASE_CREDENTIALS'),
];
