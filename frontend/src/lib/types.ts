export type User = {
  id: number;
  public_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  public_phone: string | null;
  phone_public: boolean;
  address: string | null;
  district: string | null;
  upazila: string | null;
  role: string;
  verified: boolean;
  wallet_balance: string;
  news: string | null;
  latitude: number | null;
  longitude: number | null;
};
export type Session = {
  user: User | null;
  profile_complete: boolean;
  preview_available: boolean;
};
export type Paged<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};
export type Product = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  price: string;
  discount_price: string | null;
  discount_percent: string | null;
  effective_price: string;
  image_url: string | null;
  category: string;
  seller_name?: string;
  seller_public_id?: string;
  seller_verified?: boolean;
  seller_district?: string;
};
export type Parcel = {
  id: number;
  code: string;
  display_code: string;
  custody_bucket: string;
  pickup_ready_at: string | null;
  sender_id: number;
  recipient_id: number | null;
  assigned_member_id: number | null;
  holder_id: number | null;
  status: string;
  source: string;
  pickup_name: string;
  pickup_phone: string;
  pickup_address: string;
  pickup_district: string;
  pickup_upazila: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_district: string;
  delivery_upazila: string;
  weight_grams: number;
  delivery_charge: string;
  cod_enabled: boolean;
  cod_amount: string;
  total_collection: string;
  collection_status: string;
  collected_amount: string;
  created_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
};
export type Row = Record<string, unknown>;
export const memberRoles = [
  "rider",
  "union_agent",
  "upazila_agent",
  "district_agent",
];
