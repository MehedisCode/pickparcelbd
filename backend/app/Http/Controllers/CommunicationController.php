<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunicationController extends Controller
{
    private function visible($q, int $id)
    {
        return $q->where(fn ($q) => $q->where(fn ($q) => $q->where('sender_id', $id)->where('sender_deleted', false))->orWhere(fn ($q) => $q->where('receiver_id', $id)->where('receiver_deleted', false)));
    }

    public function conversations(Request $r)
    {
        $u = $r->user();
        $latest = $this->visible(DB::table('messages'), $u->id)->selectRaw('CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id, MAX(id) AS last_id', [$u->id])->groupBy('other_id');
        $unread = DB::table('messages as unread')->whereColumn('unread.sender_id', 'users.id')->where('unread.receiver_id', $u->id)->where('unread.receiver_deleted', false)->whereNull('unread.read_at')->selectRaw('COUNT(*)');
        $rows = DB::query()->fromSub($latest, 'latest')->join('users', 'users.id', '=', 'latest.other_id')->join('messages', 'messages.id', '=', 'latest.last_id')->select('users.id as user_id', 'users.name', 'users.public_id', 'users.avatar_url', 'users.online', 'users.last_seen_at', 'messages.body', 'messages.created_at')->selectSub($unread, 'unread')->orderByDesc('messages.id')->paginate(30);
        $rows->through(function ($person) {
            $person->online = (bool) $person->online && $person->last_seen_at && strtotime($person->last_seen_at) > time() - 35;
            unset($person->last_seen_at);

            return $person;
        });

        return response()->json($rows);
    }

    public function messages(Request $r, int $userId)
    {
        $peer = User::findOrFail($userId);
        $id = $r->user()->id;
        $q = $this->visible(DB::table('messages'), $id)->where(fn ($q) => $q->where('sender_id', $userId)->orWhere('receiver_id', $userId));
        if ($r->filled('order_id')) {
            $order = DB::table('orders')->where('id', $r->query('order_id'))->where(fn ($q) => $q->where('buyer_id', $id)->orWhere('seller_id', $id))->first() ?? abort(404);
            abort_unless(in_array($userId, [(int) $order->buyer_id, (int) $order->seller_id], true), 403);
            $q->where('order_id', $order->id);
        }
        if ($r->filled('before')) {
            $q->where('id', '<', (int) $r->query('before'));
        }
        $rows = $q->orderByDesc('id')->limit(100)->get()->reverse()->values();
        DB::table('messages')->whereIn('id', $rows->pluck('id'))->where('receiver_id', $id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['data' => $rows, 'peer' => ['user_id' => $peer->id, 'name' => $peer->name, 'public_id' => $peer->public_id, 'online' => $peer->online && $peer->last_seen_at && $peer->last_seen_at->timestamp > time() - 35]]);
    }

    public function send(Request $r, int $userId, Activity $activity)
    {
        $d = $r->validate(['body' => 'required|string|max:2000', 'order_id' => 'nullable|integer|exists:orders,id']);
        $u = $r->user();
        User::findOrFail($userId);
        abort_if($userId === $u->id, 422, 'Choose another person.');
        abort_if(DB::table('buyer_blocks')->where(fn ($q) => $q->where('seller_id', $u->id)->where('buyer_id', $userId))->orWhere(fn ($q) => $q->where('seller_id', $userId)->where('buyer_id', $u->id))->exists(), 403, 'Messaging is unavailable between these accounts.');
        if (! empty($d['order_id'])) {
            $o = DB::table('orders')->find($d['order_id']);
            abort_unless(in_array($u->id, [(int) $o->buyer_id, (int) $o->seller_id], true) && in_array($userId, [(int) $o->buyer_id, (int) $o->seller_id], true), 403);
        }
        $id = DB::transaction(function () use ($u, $userId, $d, $activity) {
            $id = DB::table('messages')->insertGetId(['sender_id' => $u->id, 'receiver_id' => $userId, 'order_id' => $d['order_id'] ?? null, 'body' => $d['body'], 'created_at' => now(), 'updated_at' => now()]);
            $activity->notify($userId, 'message', 'নতুন মেসেজ', $u->name.' sent you a message.', '/dashboard/messages/'.$u->id, $u->id);

            return $id;
        });

        return response()->json(['id' => $id, 'message' => 'Message sent.'], 201);
    }

    public function deleteMessage(Request $r, int $id)
    {
        $d = $r->validate(['mode' => 'required|in:me,everyone']);
        $m = DB::table('messages')->find($id) ?? abort(404);
        $uid = $r->user()->id;
        abort_unless(in_array($uid, [(int) $m->sender_id, (int) $m->receiver_id], true), 403);
        if ($d['mode'] === 'everyone') {
            abort_unless((int) $m->sender_id === $uid, 403);
            $change = ['sender_deleted' => true, 'receiver_deleted' => true];
        } else {
            $change = [(int) $m->sender_id === $uid ? 'sender_deleted' : 'receiver_deleted' => true];
        }
        DB::table('messages')->where('id', $id)->update($change);

        return response()->json(['message' => 'Message removed.']);
    }

    public function deleteConversation(Request $r, int $userId)
    {
        $d = $r->validate(['mode' => 'required|in:me,everyone']);
        $uid = $r->user()->id;
        DB::transaction(function () use ($uid, $userId, $d) {
            DB::table('messages')->where('sender_id', $uid)->where('receiver_id', $userId)->update($d['mode'] === 'everyone' ? ['sender_deleted' => true, 'receiver_deleted' => true] : ['sender_deleted' => true]);
            if ($d['mode'] === 'me') {
                DB::table('messages')->where('receiver_id', $uid)->where('sender_id', $userId)->update(['receiver_deleted' => true]);
            }
        });

        return response()->json(['message' => 'Conversation removed.']);
    }

    public function notifications(Request $r)
    {
        return response()->json(DB::table('notifications')->where('user_id', $r->user()->id)->orderByDesc('id')->paginate(30));
    }

    public function readNotifications(Request $r)
    {
        $d = $r->validate(['ids' => 'sometimes|array|max:100', 'ids.*' => 'integer']);
        $q = DB::table('notifications')->where('user_id', $r->user()->id)->whereNull('read_at');
        if (isset($d['ids'])) {
            $q->whereIn('id', $d['ids']);
        }$q->update(['read_at' => now(), 'updated_at' => now()]);

        return response()->json(['message' => 'Notifications marked as read.']);
    }

    public function token(Request $r)
    {
        $d = $r->validate(['token' => 'required|string|min:20|max:512']);
        abort_if(preg_match('/[\x00-\x20\x7F]/', $d['token']), 422, 'Invalid device token.');
        DB::table('device_tokens')->updateOrInsert(['token_hash' => hash('sha256', $d['token'])], ['user_id' => $r->user()->id, 'token' => $d['token'], 'active' => true, 'created_at' => now(), 'updated_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Token registered.']);
    }
}
