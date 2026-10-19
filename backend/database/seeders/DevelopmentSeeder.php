<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\OrderService;
use App\Services\ParcelService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DevelopmentSeeder extends Seeder
{
    public function run(): void
    {
        abort_unless(app()->environment('local', 'staging'), 403, 'Synthetic preview records are for local and staging only.');
        DB::transaction(function () {
            $users = [];
            foreach ([['seller', 'Nokshi Studio', 'customer'], ['buyer', 'Farhana Rahman', 'customer'], ['rider', 'Rafiul Islam', 'rider'], ['agent', 'Sadia Akter', 'district_agent'], ['admin', 'District Administrator', 'super_admin']] as $i => [$key,$name,$role]) {
                $u = User::firstOrNew(['email' => $key.'@preview.example']);
                $u->forceFill(['public_id' => 'PP100000000'.($i + 1), 'name' => $name, 'role' => $role, 'phone' => '0170000000'.($i + 1), 'phone_public' => false, 'address' => ['seller' => 'Dhanmondi Road 7', 'buyer' => 'House 18, Mirpur 10'][$key] ?? 'Mohammadpur, Dhaka', 'district' => 'Dhaka', 'upazila' => 'Dhaka', 'verified' => $key !== 'buyer', 'news' => $key === 'seller' ? 'হাতে তৈরি, ভালোবাসায় বোনা। Discover our new collection of everyday favorites.' : null])->save();
                $users[$key] = $u;
            }
            if (DB::table('products')->where('user_id', $users['seller']->id)->exists()) {
                return;
            }
            $products = [['Everyday canvas tote', 'fashion', '650', '540', 'tote'], ['Handcrafted ceramic mug', 'home', '480', null, 'mug'], ['Soft cotton panjabi', 'fashion', '1450', '1290', 'panjabi'], ['Warm glow desk lamp', 'home', '1250', null, 'lamp'], ['Botanical care essentials', 'beauty', '890', '790', 'care'], ['Wireless everyday headphones', 'electronics', '2150', null, 'headphones'], ['Artisan date & nut box', 'food', '780', null, 'food'], ['Minimal linen cushion', 'home', '690', '590', 'cushion']];
            $ids = [];
            foreach ($products as [$name,$category,$price,$discount,$image]) {
                $ids[] = DB::table('products')->insertGetId(['user_id' => $users['seller']->id, 'name' => $name, 'description' => 'Thoughtfully selected for everyday life. স্থানীয় উদ্যোগের একটি সুন্দর আয়োজন।', 'category' => $category, 'price' => $price, 'discount_price' => $discount, 'image_url' => '/demo/'.$image.'.svg', 'active' => true, 'created_at' => now(), 'updated_at' => now()]);
            }
            $orderIds = app(OrderService::class)->checkout($users['buyer'], [['product_id' => $ids[0], 'quantity' => 1], ['product_id' => $ids[1], 'quantity' => 2]], 'cod');
            app(OrderService::class)->confirm($users['seller'], $orderIds[0]);
            for ($i = 0; $i < 5; $i++) {
                app(ParcelService::class)->create($users['seller'], ['delivery_name' => 'Preview recipient '.($i + 1), 'delivery_phone' => '0180000000'.($i + 1), 'delivery_address' => 'House '.($i + 10).', Dhaka', 'delivery_district' => 'Dhaka', 'delivery_upazila' => 'Dhaka', 'weight_grams' => 1000 + $i * 100, 'cod_enabled' => $i % 2 === 0, 'cod_amount' => $i % 2 === 0 ? '1250.00' : '0.00', 'note' => 'Synthetic local preview record.']);
            }
            DB::table('commission_rules')->insert(['district' => 'Dhaka', 'rider_percent' => 40, 'agent_percent' => 30, 'company_percent' => 30, 'created_at' => now(), 'updated_at' => now()]);
        });
    }
}
