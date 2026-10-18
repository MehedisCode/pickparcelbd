<?php

use App\Services\TransferService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('pickparcel:expire-transfers', function () {
    $this->info(app(TransferService::class)->expire().' expired handovers closed.');
})->purpose('Close expired pending handovers without changing custody.');
Schedule::command('pickparcel:expire-transfers')->everyMinute()->withoutOverlapping(5);
Schedule::call(function () {
    DB::table('users')->where('online', true)->where('last_seen_at', '<', now()->subSeconds(35))->update(['online' => false]);
})->name('presence-expiry')->everyMinute()->withoutOverlapping(5);
Schedule::command('queue:work --stop-when-empty --max-time=45 --tries=4 --timeout=120')->everyMinute()->withoutOverlapping(5);
Schedule::command('queue:prune-failed --hours=168')->daily();
