export type Order = {
  id: number;
  buyer_id: number;
  seller_id: number;
  buyer_name: string;
  seller_name: string;
  status: string;
  subtotal: string;
  delivery_charge: string;
  total: string;
  cod_enabled: boolean;
  cod_amount: string;
  created_at: string;
  cash_memo_id: number | null;
};
export type OrderDetail = {
  order: Order;
  items: {
    id: number;
    name: string;
    quantity: number;
    unit_price: string;
    total: string;
  }[];
  parcel: { code: string; status: string } | null;
  buyer: {
    id: number;
    name: string;
    phone: string;
    address: string;
    district: string;
    upazila: string;
  };
  seller: {
    id: number;
    name: string;
    phone: string;
    address: string;
    district: string;
    upazila: string;
  };
};
export type Memo = {
  id: number;
  buyer_id: number;
  seller_id: number;
  buyer_name: string;
  seller_name: string;
  status: string;
  created_at: string;
};
export type MemoDetail = {
  memo: Memo;
  buyer: { id: number; name: string; phone: string; address: string };
  seller: { id: number; name: string; phone: string; address: string };
  documents: {
    id: number;
    role: string;
    mime: string;
    size: number;
    created_at: string;
  }[];
  order: { id: number; status: string } | null;
};
