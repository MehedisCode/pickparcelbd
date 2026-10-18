<?php

namespace App\Http\Controllers;

use App\Services\Activity;
use App\Services\ParcelService;
use App\Support\Access;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ParcelController extends Controller
{
    public function __construct(private ParcelService $parcels) {}

    public function index(Request $r)
    {
        $q = Access::parcels(DB::table('parcels'), $r->user());
        if ($r->filled('bucket')) {
            $q->where('custody_bucket', $r->query('bucket'));
        }
        if ($r->filled('status')) {
            $q->where('status', $r->query('status'));
        }
        if ($r->filled('search')) {
            $s = trim((string) $r->query('search'));
            $q->where(fn ($q) => $q->where('code', 'like', '%'.preg_replace('/^RFD/i', '', $s).'%')->orWhere('delivery_name', 'like', '%'.$s.'%')->orWhere('delivery_phone', 'like', '%'.$s.'%'));
        }
        if ($r->boolean('mine')) {
            $q->where('sender_id', $r->user()->id);
        }
        if ($r->query('view') === 'custody') {
            $q->where('holder_id', $r->user()->id)->whereNotIn('status', ['delivered', 'returned']);
        }
        if ($r->query('view') === 'available') {
            $q->where('status', 'pending')->whereNull('assigned_member_id');
        }
        if ($r->query('view') === 'assigned') {
            $q->where('assigned_member_id', $r->user()->id)->whereNull('picked_up_at');
        }

        return response()->json($q->orderByDesc('id')->paginate(20)->through(fn ($p) => $this->parcels->serialize($p, $r->user())));
    }

    public function show(Request $r, string $code)
    {
        $p = $this->parcels->find($r->user(), $code);

        return response()->json(['parcel' => $this->parcels->serialize($p, $r->user()), 'events' => DB::table('parcel_events')->leftJoin('users', 'users.id', '=', 'parcel_events.actor_id')->where('parcel_id', $p->id)->select('parcel_events.*', 'users.name as actor_name')->orderBy('parcel_events.id')->get(), 'messages' => DB::table('parcel_messages')->join('users', 'users.id', '=', 'parcel_messages.user_id')->where('parcel_id', $p->id)->select('parcel_messages.*', 'users.name')->orderBy('parcel_messages.id')->get(), 'assigned_member' => $p->assigned_member_id ? DB::table('users')->where('id', $p->assigned_member_id)->first(['id', 'name', 'phone', 'public_id']) : null, 'holder' => $p->holder_id ? DB::table('users')->where('id', $p->holder_id)->first(['id', 'name', 'phone', 'public_id']) : null]);
    }

    public function store(Request $r)
    {
        $d = $r->validate(['terms_accepted' => 'required|accepted', 'delivery_name' => 'required|string|max:255', 'delivery_phone' => 'required|string|min:7|max:30', 'delivery_address' => 'required|string|max:2000', 'delivery_district' => 'nullable|string|max:100', 'delivery_upazila' => 'nullable|string|max:100', 'pickup_address' => 'required|string|max:2000', 'weight_grams' => 'required|integer|between:1,1000000', 'cod_enabled' => 'required|boolean', 'cod_amount' => 'required_if:cod_enabled,true|nullable|decimal:0,2|min:0.01|max:999999999', 'note' => 'nullable|string|max:2000']);
        $r->user()->forceFill(['terms_viewed_at' => now()])->save();
        unset($d['terms_accepted']);
        $d = array_filter($d, fn ($v) => $v !== null);
        $p = $this->parcels->create($r->user(), $d);

        return response()->json(['parcel' => $this->parcels->serialize($p, $r->user()), 'message' => 'Parcel booked successfully.'], 201);
    }

    public function assign(Request $r)
    {
        $d = $r->validate(['codes' => 'required|array|min:1|max:100', 'codes.*' => 'required|string|max:9', 'member_id' => 'required|integer|exists:users,id']);
        $this->parcels->assign($r->user(), $d['codes'], $d['member_id']);

        return response()->json(['message' => 'Pickup assignment saved.']);
    }

    public function codes(Request $r, string $code)
    {
        $p = $this->parcels->find($r->user(), $code);
        $u = $r->user();
        $out = [];
        if ((int) $p->sender_id === $u->id && $p->pickup_code_encrypted && ! $p->picked_up_at) {
            $out['pickup'] = Crypt::decryptString($p->pickup_code_encrypted);
        }
        if (((int) $p->recipient_id === $u->id || (! $p->recipient_id && (int) $p->sender_id === $u->id)) && $p->delivery_code_encrypted && ! $p->delivered_at) {
            $out['delivery'] = Crypt::decryptString($p->delivery_code_encrypted);
        }
        abort_unless($out, 403, 'No verification code is available to this account.');

        return response()->json($out);
    }

    public function cancelBatch(Request $r)
    {
        $d = $r->validate(['codes' => 'required|array|min:1|max:100', 'codes.*' => 'required|string|max:9']);
        $codes = array_unique($d['codes']);
        sort($codes);
        DB::transaction(function () use ($r, $codes) {
            foreach ($codes as $code) {
                $this->parcels->command($r->user(), $code, 'cancel-assignment', []);
            }
        }, 3);

        return response()->json(['message' => 'Selected pickup assignments cancelled.']);
    }

    public function pickupBatch(Request $r)
    {
        Access::member($r->user());
        $d = $r->validate(['otp' => 'required|digits:6', 'parcel_code' => 'required|string|size:6', 'codes' => 'sometimes|array|min:1|max:100', 'codes.*' => 'string|size:6']);

        return DB::transaction(function () use ($r, $d) {
            $anchor = DB::table('parcels')->where('code', $d['parcel_code'])->where('assigned_member_id', $r->user()->id)->where('status', 'assigned')->first() ?? abort(422, 'Select one of your assigned parcels.');
            abort_unless(Hash::check($d['otp'], (string) $anchor->pickup_code_hash), 422, 'Incorrect pickup code.');
            $matched = DB::table('parcels')->where('assigned_member_id', $r->user()->id)->where('status', 'assigned')->where('pickup_code_hash', $anchor->pickup_code_hash)->orderBy('id')->limit(100)->lockForUpdate()->get();
            abort_if($matched->isEmpty(), 422, 'No assigned pickup batch matches this code.');
            if (isset($d['codes'])) {
                abort_unless(count(array_unique($d['codes'])) === count($d['codes']) && count(array_diff($d['codes'], $matched->pluck('code')->all())) === 0, 422, 'Choose parcels from the previewed batch.');
                $selected = $matched->whereIn('code', $d['codes']);
                DB::table('parcels')->whereIn('id', $selected->pluck('id'))->update(['status' => 'picked_up', 'custody_bucket' => 'pickup', 'holder_id' => $r->user()->id, 'picked_up_at' => now(), 'updated_at' => now()]);
                $activity = app(Activity::class);
                foreach ($selected as $p) {
                    $activity->event($p->id, $r->user()->id, 'verify-pickup', 'Pickup verified as part of a physical receipt batch.');
                }
                foreach ($selected->groupBy('sender_id') as $senderId => $items) {
                    $activity->notify((int) $senderId, 'pickup_verified', 'পিকআপ সম্পন্ন হয়েছে', count($items).' parcels picked up by '.$r->user()->name, '/dashboard/parcels', $r->user()->id);
                }

                return response()->json(['message' => count($d['codes']).' parcels picked up.']);
            }

            return response()->json(['data' => $matched->map(fn ($p) => $this->parcels->serialize($p))->values()]);
        }, 3);
    }

    public function command(Request $r, string $code, string $action)
    {
        $rules = match ($action) {
            'list' => ['bucket' => 'required|in:pickup,custody'],
            'verify-pickup','verify-delivery' => ['code' => 'required|digits:6'],'weight' => ['weight_grams' => 'required|integer|between:1,1000000'],'return-request' => ['reason' => 'required|string|max:2000'],'message' => ['body' => 'required|string|max:1000'],default => []
        };
        $d = $r->validate($rules);
        $p = $this->parcels->command($r->user(), $code, $action, $d);

        return response()->json(['parcel' => $this->parcels->serialize($p, $r->user()), 'message' => 'Parcel updated.']);
    }
}
