export type Transfer = {
  id: number;
  code: string;
  status: string;
  created_at: string;
  expires_at: string;
  sender_name: string;
  receiver_name: string | null;
};
export type TransferDetail = {
  transfer: Transfer & { note: string | null };
  token: string | null;
  items: {
    code: string;
    delivery_name: string;
    delivery_district: string;
    received_at: string | null;
    collection_amount: string;
    collection_handed_over_at: string | null;
  }[];
};
