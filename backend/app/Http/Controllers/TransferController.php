<?php

namespace App\Http\Controllers;

use App\Services\TransferService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class TransferController extends Controller
{
    public function __construct(private TransferService $transfers) {}

    private function find(Request $r, int $id): object
    {
        $q = DB::table('transfers')->where('id', $id);
        $u = $r->user();
        $q->where(fn ($q) => $q->where('sender_id', $u->id)->orWhere('receiver_id', $u->id));

        return $q->first() ?? abort(404);
    }

    public function index(Request $r)
    {
        $u = $r->user();

        return response()->json(DB::table('transfers')->join('users as sender', 'sender.id', '=', 'transfers.sender_id')->leftJoin('users as receiver', 'receiver.id', '=', 'transfers.receiver_id')->where(fn ($q) => $q->where('sender_id', $u->id)->orWhere('receiver_id', $u->id))->select('transfers.id', 'transfers.code', 'transfers.status', 'transfers.created_at', 'transfers.expires_at', 'sender.name as sender_name', 'receiver.name as receiver_name')->orderByDesc('transfers.id')->paginate(20));
    }

    public function show(Request $r, int $id)
    {
        $t = $this->find($r, $id);
        $token = (int) $t->sender_id === $r->user()->id && $t->status === 'pending' ? Crypt::decryptString($t->token_encrypted) : null;
        unset($t->token_hash,$t->token_encrypted);
        $items = DB::table('transfer_items')->join('parcels', 'parcels.id', '=', 'transfer_items.parcel_id')->where('transfer_id', $id)->select('parcels.code', 'parcels.delivery_name', 'parcels.delivery_district', 'transfer_items.received_at', 'transfer_items.collection_amount', 'transfer_items.collection_handed_over_at')->get();

        return response()->json(['transfer' => $t, 'token' => $token, 'items' => $items]);
    }

    public function store(Request $r)
    {
        $d = $r->validate(['codes' => 'required|array|min:1|max:100', 'codes.*' => 'string|max:9', 'note' => 'nullable|string|max:2000']);

        return response()->json($this->transfers->create($r->user(), $d['codes'], $d['note'] ?? null), 201);
    }

    public function preview(Request $r)
    {
        $d = $r->validate(['token' => 'required|string|size:64']);

        return response()->json($this->transfers->preview($r->user(), $d['token']));
    }

    public function accept(Request $r)
    {
        $d = $r->validate(['token' => 'required|string|size:64', 'codes' => 'required|array|min:1|max:100', 'codes.*' => 'string|size:6']);

        return response()->json(['id' => $this->transfers->accept($r->user(), $d['token'], $d['codes']), 'message' => 'Parcels received.']);
    }

    public function handover(Request $r, int $id)
    {
        DB::transaction(function () use ($r, $id) {
            $t = $this->find($r, $id);
            abort_unless($t->status === 'accepted' && (int) $t->receiver_id === $r->user()->id, 403, 'Only the receiving member can acknowledge the collection handover.');
            DB::table('transfers')->where('id', $id)->lockForUpdate()->first();
            DB::table('transfer_items')->where('transfer_id', $id)->whereNotNull('received_at')->whereNull('collection_handed_over_at')->update(['collection_handed_over_at' => now()]);
        });

        return response()->json(['message' => 'Collection handover acknowledged.']);
    }

    public function export(Request $r, int $id)
    {
        $this->find($r, $id);
        $rows = DB::table('transfer_items')->join('parcels', 'parcels.id', '=', 'transfer_items.parcel_id')->where('transfer_id', $id)->get(['parcels.code', 'parcels.delivery_name', 'parcels.delivery_district', 'parcels.status', 'transfer_items.received_at']);

        return response()->streamDownload(function () use ($rows) {
            $f = fopen('php://output', 'w');
            fwrite($f, "\xEF\xBB\xBF");
            fputcsv($f, ['Parcel', 'Recipient', 'District', 'Status', 'Received at'], ',', '"', '');
            foreach ($rows as $row) {
                fputcsv($f, array_map(fn ($v) => is_string($v) && preg_match('/^[=+@\-]/',$v) ? "'".$v : $v, (array) $row), ',', '"', '');
            }fclose($f);
        }, 'transfer-'.$id.'.csv', ['Content-Type' => 'text/csv; charset=utf-8']);
    }
}
