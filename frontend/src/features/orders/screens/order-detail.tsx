"use client";

import { useAction, useSession } from "@/components/providers";
import {
  BackLink,
  Badge,
  Button,
  ConfirmAction,
  ErrorState,
  KeyValue,
  Loading,
  PageHeading,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, money } from "@/lib/api";
import type { OrderDetail } from "./types";
import { ArrowRight, CheckCircle2, MessageCircle, Printer } from "lucide-react";
import Link from "next/link";

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
