"use client";
import { useAction, useSession } from "@/components/providers";
import {
  BackLink,
  Badge,
  Button,
  ConfirmAction,
  Empty,
  ErrorState,
  Form,
  KeyValue,
  Loading,
  Modal,
  PageHeading,
  Pagination,
  Panel,
  SearchInput,
  Tabs,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, money } from "@/lib/api";
import type { Paged } from "@/lib/types";
import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  MessageCircle,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
type Order = {
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
export function OrdersScreen() {
  const [side, setSide] = useState("purchases");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, error, loading, reload } = useResource<Paged<Order>>(
    `/orders?side=${side}&page=${page}&search=${encodeURIComponent(search)}`,
  );
  return (
    <>
      <PageHeading
        eyebrow="YOUR BUSINESS, TOGETHER"
        title="Every order has a story."
        description="Keep track of purchases, sales, and the next steps."
      />
      <Tabs
        active={side}
        onChange={(s) => {
          setSide(s);
          setPage(1);
        }}
        items={[
          { id: "purchases", label: "My purchases" },
          { id: "sales", label: "My sales" },
        ]}
      />
      <div className="filter-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search an order number…"
        />
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : data?.data.length ? (
        <Panel>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>{side === "purchases" ? "Seller" : "Buyer"}</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>#{o.id}</strong>
                      <small>{date(o.created_at)}</small>
                    </td>
                    <td>
                      {side === "purchases" ? o.seller_name : o.buyer_name}
                    </td>
                    <td>
                      <Badge value={o.status} />
                    </td>
                    <td>{money(o.total)}</td>
                    <td>{o.cod_enabled ? "Cash on delivery" : "Prepaid"}</td>
                    <td>
                      <Link
                        className="text-link"
                        href={`/dashboard/orders/${o.id}`}
                      >
                        Details <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.current_page}
            last={data.last_page}
            onChange={setPage}
          />
        </Panel>
      ) : (
        <Panel>
          <Empty
            title={
              side === "sales"
                ? "Your next customer is out there."
                : "A little discovery is waiting."
            }
            description={
              side === "sales"
                ? "Publish products and share your shop to start receiving orders."
                : "Explore the marketplace to place your first order."
            }
            action={
              <Link
                className="button primary"
                href={
                  side === "sales" ? "/dashboard/products/new" : "/products"
                }
              >
                {side === "sales" ? "List a product" : "Explore marketplace"}
                <ArrowRight size={15} />
              </Link>
            }
          />
        </Panel>
      )}
    </>
  );
}
type OrderDetail = {
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
export function OrderDetailScreen({ id }: { id: string }) {
  const { data, error, loading, reload } = useResource<OrderDetail>(
    `/orders/${id}`,
  );
  const { session } = useSession();
  const { run, busy } = useAction();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  const o = data.order;
  const seller = session?.user?.id === Number(o.seller_id);
  return (
    <>
      <BackLink href="/dashboard/orders" label="Back to orders" />
      <PageHeading
        eyebrow="ORDER DETAILS"
        title={`Order #${o.id}`}
        description={`Placed ${date(o.created_at)}`}
        action={<Badge value={o.status} />}
      />
      <div className="detail-grid">
        <Panel title="The good things in this order">
          {data.items.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <strong>{i.name}</strong>
                      </td>
                      <td>{money(i.unit_price)}</td>
                      <td>{i.quantity}</td>
                      <td>{money(i.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="panel-body">
              <p>
                This order’s product list is recorded in its cash memo images.
              </p>
              {o.cash_memo_id && (
                <Link
                  className="text-link"
                  href={`/dashboard/cash-memos/${o.cash_memo_id}`}
                >
                  Open cash memo <ArrowRight size={13} />
                </Link>
              )}
            </div>
          )}
          <div className="panel-body">
            <KeyValue label="Subtotal" value={money(o.subtotal)} />
            <KeyValue
              label="Delivery charge"
              value={money(o.delivery_charge)}
            />
            <KeyValue label="Order total" value={money(o.total)} />
            <KeyValue
              label="Payment"
              value={
                o.cod_enabled
                  ? "Cash on delivery"
                  : "Prepaid — arrange with seller"
              }
            />
            <div className="button-row" style={{ marginTop: 20 }}>
              {seller && o.status === "pending" && (
                <Button
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () => api.post(`/orders/${id}/confirm`),
                      "Order confirmed and parcel created.",
                    )
                  }
                >
                  <CheckCircle2 size={15} />
                  Confirm order
                </Button>
              )}
              <Link
                className="button secondary"
                href={`/dashboard/messages/${seller ? data.buyer.id : data.seller.id}?order_id=${o.id}`}
              >
                <MessageCircle size={15} />
                Message {seller ? "buyer" : "seller"}
              </Link>
              <Button tone="secondary" onClick={() => window.print()}>
                <Printer size={15} />
                Print
              </Button>
            </div>
          </div>
        </Panel>
        <div>
          <Panel title="Delivery information">
            <div className="panel-body">
              <h3>{data.buyer.name}</h3>
              <p style={{ fontSize: 12 }}>
                {data.buyer.address}
                <br />
                {data.buyer.upazila}, {data.buyer.district}
                <br />
                {data.buyer.phone}
              </p>
              <KeyValue label="Seller" value={data.seller.name} />
              {data.parcel && (
                <>
                  <KeyValue
                    label="Parcel"
                    value={
                      <Link
                        className="text-link"
                        href={`/dashboard/parcels/${data.parcel.code}`}
                      >
                        RFD{data.parcel.code} <ArrowRight size={12} />
                      </Link>
                    }
                  />
                  <KeyValue
                    label="Delivery status"
                    value={<Badge value={data.parcel.status} />}
                  />
                </>
              )}
            </div>
          </Panel>
          <div className="button-row" style={{ marginTop: 20 }}>
            <ConfirmAction
              title="Hide this order?"
              description="The order remains in business records but is removed from your order list."
              onConfirm={() => api.delete(`/orders/${id}`)}
            >
              Hide from my list
            </ConfirmAction>
          </div>
        </div>
      </div>
    </>
  );
}

type Memo = {
  id: number;
  buyer_id: number;
  seller_id: number;
  buyer_name: string;
  seller_name: string;
  status: string;
  created_at: string;
};
export function MemosScreen() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data, error, loading, reload } = useResource<Paged<Memo>>(
    `/cash-memos?page=${page}`,
  );
  const { data: people } = useResource<{
    data: { id: number; name: string; public_id: string }[];
  }>(
    search.length >= 2 ? `/people?search=${encodeURIComponent(search)}` : null,
  );
  const router = useRouter();
  return (
    <>
      <PageHeading
        eyebrow="THE DETAILS THAT KEEP BUSINESS MOVING"
        title="Cash memos"
        description="Order lists, seller memos, and payment proofs, together."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            New cash memo
          </Button>
        }
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : data?.data.length ? (
        <Panel>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Memo</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>#{m.id}</strong>
                    </td>
                    <td>{m.buyer_name}</td>
                    <td>{m.seller_name}</td>
                    <td>
                      <Badge value={m.status} />
                    </td>
                    <td>{date(m.created_at)}</td>
                    <td>
                      <Link
                        className="text-link"
                        href={`/dashboard/cash-memos/${m.id}`}
                      >
                        Open memo <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.current_page}
            last={data.last_page}
            onChange={setPage}
          />
        </Panel>
      ) : (
        <Panel>
          <Empty
            title="Keep every detail in good order."
            description="Start a cash memo with your seller, then upload the order list and completed memo."
          />
        </Panel>
      )}
      {open && (
        <Modal title="Start a cash memo" onClose={() => setOpen(false)}>
          <div className="panel-body">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Find a seller by name or public ID…"
            />
          </div>
          <Form
            fields={[
              {
                name: "seller_id",
                label: "Choose a seller",
                required: true,
                options: (people?.data || []).map((p) => ({
                  value: String(p.id),
                  label: `${p.name} · ${p.public_id}`,
                })),
              },
            ]}
            submit="Create cash memo"
            onSubmit={async (d) => {
              const m = await api.post<{ id: number }>("/cash-memos", {
                seller_id: Number(d.seller_id),
              });
              router.push(`/dashboard/cash-memos/${m.id}`);
            }}
          />
        </Modal>
      )}
    </>
  );
}
type MemoDetail = {
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
export function MemoDetailScreen({ id }: { id: string }) {
  const { data, error, loading, reload } = useResource<MemoDetail>(
    `/cash-memos/${id}`,
  );
  const { session } = useSession();
  const { run, busy } = useAction();
  const [files, setFiles] = useState<Record<string, File>>({});
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  const seller = Number(data.memo.seller_id) === session?.user?.id;
  return (
    <>
      <BackLink href="/dashboard/cash-memos" label="Back to cash memos" />
      <PageHeading
        eyebrow="A CLEAR RECORD OF YOUR ORDER"
        title={`Cash memo #${id}`}
        description={`${data.buyer.name} → ${data.seller.name}`}
        action={
          <Button tone="secondary" onClick={() => window.print()}>
            <Printer size={15} />
            Print memo
          </Button>
        }
      />
      <Panel title="Your documents">
        <div className="document-grid">
          {["buyer", "seller", "payment"].map((role) => {
            const doc = data.documents.find((d) => d.role === role);
            const allowed = seller ? role === "seller" : role !== "seller";
            return (
              <section className="document-card" key={role}>
                {doc ? (
                  <a
                    href={`/api/v1/documents/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image
                      src={`/api/v1/documents/${doc.id}`}
                      alt={`${role} document`}
                      width={400}
                      height={300}
                      unoptimized
                    />
                  </a>
                ) : (
                  <div className="empty-state" style={{ padding: 25 }}>
                    <ImagePlus size={30} color="var(--muted)" />
                  </div>
                )}
                <h3>
                  {role === "buyer"
                    ? "Buyer’s order list"
                    : role === "seller"
                      ? "Completed seller memo"
                      : "Payment proof"}
                </h3>
                {allowed && data.memo.status === "draft" && (
                  <>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label={`Upload ${role} document`}
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          setFiles((s) => ({
                            ...s,
                            [role]: e.target.files![0],
                          }));
                      }}
                    />
                    <div className="button-row">
                      <Button
                        tone="secondary"
                        disabled={!files[role] || busy}
                        onClick={() =>
                          void run(async () => {
                            const fd = new FormData();
                            fd.set("role", role);
                            fd.set("image", files[role]);
                            await api.post(`/cash-memos/${id}/documents`, fd);
                          }, "Document uploaded.")
                        }
                      >
                        Upload image
                      </Button>
                      {doc && (
                        <ConfirmAction
                          title="Remove document?"
                          description="This removes your image from the draft memo."
                          onConfirm={() => api.delete(`/documents/${doc.id}`)}
                        >
                          <Trash2 size={13} />
                          Remove
                        </ConfirmAction>
                      )}
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
        <div className="panel-body">
          <div className="button-row">
            {seller && data.memo.status === "draft" && (
              <Button
                disabled={busy}
                onClick={() =>
                  void run(
                    () => api.post(`/cash-memos/${id}/send`),
                    "Cash memo sent for delivery.",
                  )
                }
              >
                Send to PickParcelBD <ArrowRight size={14} />
              </Button>
            )}
            {data.order && (
              <Link
                href={`/dashboard/orders/${data.order.id}`}
                className="button secondary"
              >
                View delivery order #{data.order.id}
              </Link>
            )}
            <Badge value={data.memo.status} />
          </div>
          <p style={{ fontSize: 11, marginTop: 18 }}>
            Buyer and seller images are required before requesting delivery.
            Your payment proof is visible only to the order participants.
          </p>
        </div>
      </Panel>
    </>
  );
}
