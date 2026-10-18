<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    private function values(Request $r, bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';
        $d = $r->validate(['name' => $required.'|string|max:255', 'description' => 'nullable|string|max:10000', 'price' => $required.'|decimal:0,2|min:0.01|max:999999999', 'discount_price' => 'nullable|decimal:0,2|min:0', 'discount_percent' => 'nullable|decimal:0,2|between:0,99.99', 'image_url' => ['nullable', 'string', 'max:2048', function ($attribute, $value, $fail) {
            $local = preg_match('~^/media/public/products/[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp)$~i', $value) || (app()->environment('local') && preg_match('~^/demo/[a-z-]+\.svg$~', $value));
            if (! $local && ! (filter_var($value, FILTER_VALIDATE_URL) && in_array(parse_url($value, PHP_URL_SCHEME), ['http', 'https'], true))) {
                $fail('Choose a valid image or media URL.');
            }
        }], 'category' => 'sometimes|string|in:fashion,electronics,home,beauty,food,other', 'active' => 'sometimes|boolean']);

        return $d;
    }

    public function store(Request $r)
    {
        abort_unless($r->user()->profileComplete(), 422, 'Complete your delivery profile before publishing a product.');
        $d = $this->values($r);
        $id = DB::table('products')->insertGetId($d + ['user_id' => $r->user()->id, 'created_at' => now(), 'updated_at' => now()]);

        return response()->json(['id' => $id, 'message' => 'Product published.'], 201);
    }

    public function update(Request $r, int $id)
    {
        $p = DB::table('products')->whereNull('deleted_at')->find($id) ?? abort(404);
        abort_unless((int) $p->user_id === $r->user()->id, 403);
        DB::table('products')->where('id', $id)->update($this->values($r, true) + ['updated_at' => now()]);

        return response()->json(['message' => 'Product updated.']);
    }

    public function destroy(Request $r, int $id)
    {
        $p = DB::table('products')->find($id) ?? abort(404);
        abort_unless((int) $p->user_id === $r->user()->id, 403);
        DB::table('products')->where('id', $id)->update(['deleted_at' => now(), 'active' => false, 'updated_at' => now()]);

        return response()->json(['message' => 'Product removed.']);
    }

    public function upload(Request $r)
    {
        $r->validate(['image' => 'required|image|mimes:jpeg,png,webp|max:8192']);
        $path = $r->file('image')->store('products', 'public');

        return response()->json(['url' => '/media/public/'.$path], 201);
    }
}
