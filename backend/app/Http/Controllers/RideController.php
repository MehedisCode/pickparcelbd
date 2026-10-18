<?php

namespace App\Http\Controllers;

use App\Services\RideService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RideController extends Controller
{
    public function __construct(private RideService $rides) {}

    public function index(Request $r)
    {
        $u = $r->user();
        $rides = DB::table('rides')->leftJoin('users as driver', 'driver.id', '=', 'rides.driver_id')->where(fn ($q) => $q->where('passenger_id', $u->id)->orWhere('driver_id', $u->id))->select('rides.*', 'driver.name as driver_name', 'driver.phone as driver_phone')->orderByDesc('rides.id')->limit(30)->get();

        return response()->json(['data' => $rides, 'driver_state' => DB::table('driver_states')->where('user_id', $u->id)->first(), 'online_count' => DB::table('driver_states')->where('available', true)->where('location_updated_at', '>=', now()->subMinutes(15))->count()]);
    }

    public function requests(Request $r)
    {
        $driver = DB::table('driver_states')->where('user_id', $r->user()->id)->first();
        $rows = [];
        if ($driver && $driver->available && $this->rides->fresh($driver)) {
            $q = DB::table('rides')->join('users', 'users.id', '=', 'rides.passenger_id')->where('status', 'searching')->where('passenger_id', '<>', $r->user()->id)->where('rides.created_at', '>=', now()->subMinutes(30))->select('rides.*', 'users.name as passenger_name')->orderByDesc('rides.id')->limit(100)->get();
            foreach ($q as $row) {
                $distance = $this->rides->distance($driver->latitude, $driver->longitude, $row->pickup_lat, $row->pickup_lng);
                if ($distance <= config('pickparcel.ride_radius_km')) {
                    $rows[] = ['id' => $row->id, 'pickup' => $row->pickup, 'destination' => $row->destination, 'passenger_name' => $row->passenger_name, 'distance_km' => round($distance, 1), 'created_at' => $row->created_at];
                }
            }
        }

        return response()->json(['data' => $rows]);
    }

    public function availability(Request $r)
    {
        $d = $r->validate(['available' => 'required|boolean']);
        $this->rides->available($r->user(), $d['available']);

        return response()->json(['message' => 'Availability updated.']);
    }

    public function store(Request $r)
    {
        $d = $r->validate(['pickup' => 'required|string|max:500', 'destination' => 'required|string|max:500', 'latitude' => 'required|numeric|between:-90,90', 'longitude' => 'required|numeric|between:-180,180']);

        return response()->json(['id' => $this->rides->book($r->user(), $d), 'message' => 'Ride request saved.'], 201);
    }

    public function command(Request $r, int $id, string $action)
    {
        if ($action === 'accept') {
            $this->rides->accept($r->user(), $id);
        } elseif ($action === 'cancel') {
            $this->rides->cancel($r->user(), $id);
        } elseif ($action === 'complete') {
            $this->rides->complete($r->user(), $id);
        } else {
            abort(404);
        }

        return response()->json(['message' => 'Ride updated.']);
    }
}
