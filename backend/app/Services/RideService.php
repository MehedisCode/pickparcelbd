<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class RideService
{
    public function __construct(private Activity $activity) {}

    public function distance(float $a, float $b, float $c, float $d): float
    {
        $x = sin(deg2rad($c - $a) / 2) ** 2 + cos(deg2rad($a)) * cos(deg2rad($c)) * sin(deg2rad($d - $b) / 2) ** 2;

        return 6371.0088 * 2 * atan2(sqrt($x), sqrt(max(0, 1 - $x)));
    }

    public function fresh(object $state): bool
    {
        return $state->location_updated_at && strtotime($state->location_updated_at) >= now()->subMinutes(config('pickparcel.driver_fresh_minutes'))->timestamp;
    }

    public function available(User $u, bool $available): void
    {
        abort_if($available && (! $u->location_updated_at || strtotime($u->location_updated_at) < now()->subMinutes(15)->timestamp), 422, 'Update GPS location before going online.');
        DB::table('driver_states')->updateOrInsert(['user_id' => $u->id], ['available' => $available, 'latitude' => $u->latitude, 'longitude' => $u->longitude, 'location_updated_at' => $u->location_updated_at, 'created_at' => now(), 'updated_at' => now()]);
    }

    public function book(User $u, array $d): int
    {
        return DB::transaction(function () use ($u, $d) {
            DB::table('users')->where('id', $u->id)->lockForUpdate()->first();
            $active = DB::table('rides')->where('passenger_id', $u->id)->whereIn('status', ['searching', 'accepted'])->orderByDesc('id')->lockForUpdate()->first();
            $values = ['pickup' => $d['pickup'], 'destination' => $d['destination'], 'pickup_lat' => $d['latitude'], 'pickup_lng' => $d['longitude'], 'updated_at' => now()];
            if ($active) {
                DB::table('rides')->where('id', $active->id)->update($values);
                if ($active->driver_id && ($active->pickup !== $d['pickup'] || $active->destination !== $d['destination'] || abs((float) $active->pickup_lat - (float) $d['latitude']) > 0.0001 || abs((float) $active->pickup_lng - (float) $d['longitude']) > 0.0001)) {
                    $this->activity->notify($active->driver_id, 'ride_location_changed', 'Ride updated', 'Your passenger updated the pickup or destination.', '/ride-share/driver', $u->id);
                }

return $active->id;
            }
            $id = DB::table('rides')->insertGetId($values + ['passenger_id' => $u->id, 'status' => 'searching', 'created_at' => now()]);
            $drivers = DB::table('driver_states')->where('available', true)->where('user_id', '<>', $u->id)->where('location_updated_at', '>=', now()->subMinutes(15))->get();
            foreach ($drivers as $driver) {
                if ($this->distance($d['latitude'], $d['longitude'], $driver->latitude, $driver->longitude) <= config('pickparcel.ride_radius_km')) {
                    $this->activity->notify($driver->user_id, 'ride_request', 'কাছাকাছি নতুন রাইড', $d['pickup'].' → '.$d['destination'], '/ride-share/driver', $u->id);
                }
            }

            return $id;
        }, 3);
    }

    public function accept(User $u, int $id): void
    {
        DB::transaction(function () use ($u, $id) {
            $driver = DB::table('driver_states')->where('user_id', $u->id)->lockForUpdate()->first();
            abort_unless($driver && $driver->available && $this->fresh($driver), 422, 'Go online and update your GPS first.');
            abort_if(DB::table('rides')->where('driver_id', $u->id)->where('status', 'accepted')->exists(), 409, 'Finish or cancel your current ride first.');
            $ride = DB::table('rides')->where('id', $id)->lockForUpdate()->first() ?? abort(404);
            abort_unless($ride->status === 'searching' && strtotime($ride->created_at) > now()->subMinutes(30)->timestamp, 409, 'Ride is no longer available.');
            abort_if((int) $ride->passenger_id === $u->id, 422);
            abort_unless($this->distance($driver->latitude, $driver->longitude, $ride->pickup_lat, $ride->pickup_lng) <= config('pickparcel.ride_radius_km'), 403, 'Pickup is outside the matching radius.');
            DB::table('rides')->where('id', $id)->update(['status' => 'accepted', 'driver_id' => $u->id, 'accepted_at' => now(), 'updated_at' => now()]);
            $this->activity->notify($ride->passenger_id, 'ride_accepted', 'রাইড গ্রহণ করা হয়েছে', $u->name.' accepted your ride.', '/ride-share', $u->id);
        }, 3);
    }

    public function complete(User $u, int $id): void
    {
        DB::transaction(function () use ($u, $id) {
            $ride = DB::table('rides')->where('id', $id)->lockForUpdate()->first() ?? abort(404);
            abort_unless((int) $ride->driver_id === $u->id, 403);
            abort_unless($ride->status === 'accepted', 409, 'Only an accepted ride can be completed.');
            DB::table('rides')->where('id', $id)->update(['status' => 'completed', 'completed_at' => now(), 'updated_at' => now()]);
            $this->activity->notify($ride->passenger_id, 'ride_completed', 'রাইড সম্পন্ন হয়েছে', 'Your driver marked this ride as completed.', '/ride-share', $u->id);
        }, 3);
    }

    public function cancel(User $u, int $id): void
    {
        DB::transaction(function () use ($u, $id) {
            $ride = DB::table('rides')->where('id', $id)->lockForUpdate()->first() ?? abort(404);
            abort_unless(in_array($u->id, [(int) $ride->passenger_id, (int) $ride->driver_id], true), 403);
            abort_unless(in_array($ride->status, ['searching', 'accepted'], true), 409);
            DB::table('rides')->where('id', $id)->update(['status' => 'cancelled', 'updated_at' => now()]);
            $other = $u->id === (int) $ride->passenger_id ? $ride->driver_id : $ride->passenger_id;
            if ($other) {
                $this->activity->notify($other,'ride_cancelled','রাইড বাতিল হয়েছে',$u->name.' cancelled ride #'.$id,'/ride-share',$u->id);
            }
        }, 3);
    }
}
