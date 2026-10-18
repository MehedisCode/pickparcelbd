<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SocialController extends Controller
{
    public function follow(Request $r, int $id, Activity $activity)
    {
        User::findOrFail($id);
        abort_if($id === $r->user()->id, 422, 'You cannot follow yourself.');

        return DB::transaction(function () use ($r, $id, $activity) {
            DB::table('users')->where('id', $r->user()->id)->lockForUpdate()->first();
            $q = DB::table('follows')->where('follower_id', $r->user()->id)->where('following_id', $id);
            $exists = $q->exists();
            if ($exists) {
                $q->delete();
            } else {
                DB::table('follows')->insert(['follower_id' => $r->user()->id, 'following_id' => $id, 'created_at' => now(), 'updated_at' => now()]);
                $activity->notify($id, 'follow', 'নতুন ফলোয়ার', $r->user()->name.' followed you.', '/sellers/'.$r->user()->public_id, $r->user()->id);
            }

return response()->json(['following' => ! $exists]);
        });
    }

    public function follows(Request $r)
    {
        return response()->json(['data' => DB::table('follows')->join('users', 'users.id', '=', 'follows.following_id')->where('follower_id', $r->user()->id)->select('users.id', 'users.public_id', 'users.name', 'users.avatar_url', 'users.district', 'users.verified')->orderByDesc('follows.id')->get()]);
    }

    public function comment(Request $r, int $id)
    {
        User::findOrFail($id);
        $d = $r->validate(['body' => 'required|string|max:1000']);
        $cid = DB::table('profile_comments')->insertGetId(['user_id' => $r->user()->id, 'target_user_id' => $id, 'body' => $d['body'], 'created_at' => now(), 'updated_at' => now()]);

        return response()->json(['id' => $cid, 'message' => 'Comment added.'], 201);
    }

    public function share(Request $r, int $id)
    {
        User::findOrFail($id);
        DB::table('users')->where('id', $id)->increment('share_count');

        return response()->json(['message' => 'Share recorded.']);
    }

    public function blocks(Request $r)
    {
        return response()->json(['data' => DB::table('buyer_blocks')->join('users', 'users.id', '=', 'buyer_blocks.buyer_id')->where('seller_id', $r->user()->id)->select('users.id', 'users.public_id', 'users.name', 'buyer_blocks.created_at')->get()]);
    }

    public function block(Request $r, int $id)
    {
        User::findOrFail($id);
        abort_if($id === $r->user()->id, 422);
        DB::table('buyer_blocks')->updateOrInsert(['seller_id' => $r->user()->id, 'buyer_id' => $id], ['created_at' => now(), 'updated_at' => now()]);

        return response()->json(['message' => 'Buyer blocked.']);
    }

    public function unblock(Request $r, int $id)
    {
        DB::table('buyer_blocks')->where('seller_id', $r->user()->id)->where('buyer_id', $id)->delete();

        return response()->json(['message' => 'Buyer unblocked.']);
    }

    public function fraud(Request $r)
    {
        $d = $r->validate(['phone' => 'required|string|min:7|max:30']);
        // Only reveal outcomes involving the requesting seller, not another seller's customers.
        $q = DB::table('parcels')->where('sender_id', $r->user()->id)->where('delivery_phone', $d['phone']);

        return response()->json(['total' => (clone $q)->count(), 'delivered' => (clone $q)->where('status', 'delivered')->count(), 'returned' => (clone $q)->where('status', 'returned')->count(), 'pending' => (clone $q)->whereNotIn('status', ['delivered', 'returned'])->count()]);
    }

    public function people(Request $r)
    {
        $d = $r->validate(['search' => 'required|string|min:2|max:100']);

        return response()->json(['data' => User::where(fn ($q) => $q->where('name', 'like', '%'.$d['search'].'%')->orWhere('public_id',$d['search']))->limit(20)->get(['id', 'public_id', 'name', 'avatar_url', 'district', 'verified'])]);
    }
}
