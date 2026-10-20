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
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, label, money } from "@/lib/api";
import type { Parcel } from "@/lib/types";
import { memberRoles } from "@/lib/types";
import { ArrowRight, Eye, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ParcelDetail = {
  parcel: Parcel;
  events: {
    id: number;
    type: string;
    note: string;
    created_at: string;
    actor_name: string;
  }[];
  messages: { id: number; name: string; body: string; created_at: string }[];
  assigned_member: {
    id: number;
    name: string;
    phone: string;
    public_id: string;
  } | null;
  holder: { id: number; name: string; phone: string; public_id: string } | null;
};
export function ParcelDetailScreen({ code }: { code: string }) {
  const { data, error, loading, reload } = useResource<ParcelDetail>(
    `/parcels/${code}`,
  );
  const { session } = useSession();
  const [action, setAction] = useState<string>();
  const [codes, setCodes] = useState<{ pickup?: string; delivery?: string }>();
  const { run, busy } = useAction();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  const p = data.parcel,
    u = session?.user;
  const sender = u?.id === Number(p.sender_id),
    member = !!u && memberRoles.includes(u.role),
    holder = u?.id === Number(p.holder_id),
    assigned = u?.id === Number(p.assigned_member_id);
  const command = async (name: string, d: unknown = {}) => {
    await api.post(`/parcels/${code}/${name}`, d);
    setAction(undefined);
  };
  const fields =
    action === "verify-pickup" || action === "verify-delivery"
      ? [
          {
            name: "code",
            label: "6-digit verification code",
            required: true,
            placeholder: "000000",
          },
        ]
      : action === "return-request"
        ? [
            {
              name: "reason",
              label: "Reason for return",
              required: true,
              type: "textarea",
            },
          ]
        : action === "weight"
          ? [
              {
                name: "weight_grams",
                label: "Verified weight in grams",
                required: true,
                type: "number",
                min: 1,
                max: 1000000,
              },
            ]
          : [
              {
                name: "body",
                label: "Your parcel message",
                required: true,
                type: "textarea",
              },
            ];
  return (
    <>
      <BackLink href="/dashboard/parcels" label="Back to parcels" />
      <PageHeading
        eyebrow="EVERY STEP OF THE JOURNEY"
        title={`RFD${p.code}`}
        description={`Booked ${date(p.created_at)} · ${label(p.source)} parcel`}
        action={<Badge value={p.status} />}
      />
      <div className="detail-grid">
        <div>
          <Panel title="From your door to theirs">
            <div className="panel-body">
              <div className="eyebrow">PICKUP</div>
              <h3>{p.pickup_name}</h3>
              <p style={{ fontSize: 12 }}>
                {p.pickup_address}
                <br />
                {p.pickup_upazila}, {p.pickup_district}
                <br />
                {p.pickup_phone}
              </p>
              <hr
                style={{
                  border: 0,
                  borderTop: "1px dashed var(--line)",
                  margin: "23px 0",
                }}
              />
              <div className="eyebrow">DELIVERY</div>
              <h3>{p.delivery_name}</h3>
              <p style={{ fontSize: 12 }}>
                {p.delivery_address}
                <br />
                {p.delivery_upazila} {p.delivery_district}
                <br />
                {p.delivery_phone}
              </p>
            </div>
          </Panel>
          <div style={{ height: 20 }} />
          <Panel title="The journey so far">
            <div className="timeline">
              {data.events.map((e) => (
                <div className="timeline-item" key={e.id}>
                  <strong className="capitalize">{label(e.type)}</strong>
                  <p>{e.note}</p>
                  <small>
                    {date(e.created_at)}
                    {e.actor_name ? ` · ${e.actor_name}` : ""}
                  </small>
                </div>
              ))}
            </div>
          </Panel>
          <div style={{ height: 20 }} />
          <Panel
            title="Parcel messages"
            action={
              <Button tone="secondary" onClick={() => setAction("message")}>
                <MessageCircle size={13} />
                Send a message
              </Button>
            }
          >
            <div className="activity-list">
              {data.messages.length ? (
                data.messages.map((m) => (
                  <div className="activity-item" key={m.id}>
                    <div>
                      <strong>{m.name}</strong>
                      <p>{m.body}</p>
                      <time>{date(m.created_at)}</time>
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  title="A clear line of communication"
                  description="Messages about this parcel will appear here."
                />
              )}
            </div>
          </Panel>
        </div>
        <div>
          <Panel title="Parcel at a glance">
            <div className="panel-body">
              <KeyValue
                label="Weight"
                value={`${Number(p.weight_grams) / 1000} kg`}
              />
              <KeyValue
                label="Delivery charge"
                value={money(p.delivery_charge)}
              />
              <KeyValue
                label="Cash on delivery"
                value={p.cod_enabled ? money(p.cod_amount) : "Not requested"}
              />
              <KeyValue
                label="Total collection"
                value={money(p.total_collection)}
              />
              <KeyValue
                label="Collection state"
                value={label(p.collection_status)}
              />
              <KeyValue
                label="Pickup member"
                value={data.assigned_member?.name}
              />
              <KeyValue label="Current holder" value={data.holder?.name} />
              <div style={{ height: 15 }} />
              <Link href={`/tracking?code=${p.code}`} className="text-link">
                Open public tracking <ArrowRight size={13} />
              </Link>
            </div>
          </Panel>
          <div style={{ height: 20 }} />
          <Panel title="Your next step">
            <div className="panel-body">
              <Link
                href={`/dashboard/parcels/${p.code}/label`}
                className="button secondary"
              >
                Print shipping label
              </Link>
            </div>
            <div className="panel-body">
              <div className="button-row">
                {(sender || assigned) &&
                  !p.picked_up_at &&
                  !p.pickup_ready_at && (
                    <Button
                      tone="secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () => command("pickup-ready"),
                          "Ready for pickup.",
                        )
                      }
                    >
                      Ready for pickup
                    </Button>
                  )}
                {member &&
                  holder &&
                  ["picked_up", "in_transit"].includes(p.status) && (
                    <Button
                      tone="secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () =>
                            command("list", {
                              bucket:
                                p.custody_bucket === "custody"
                                  ? "pickup"
                                  : "custody",
                            }),
                          "Parcel list updated.",
                        )
                      }
                    >
                      {p.custody_bucket === "custody"
                        ? "Move to pickup list"
                        : "Move to custody list"}
                    </Button>
                  )}
                {sender && p.status === "pending" && (
                  <Link href="/dashboard/parcels" className="button secondary">
                    Select a pickup rider
                  </Link>
                )}
                {sender && p.status === "assigned" && (
                  <ConfirmAction
                    title="Cancel pickup assignment?"
                    description="This releases the current pickup assignment. The parcel will return to pending pickup."
                    onConfirm={() =>
                      api.post(`/parcels/${code}/cancel-assignment`)
                    }
                  >
                    Cancel assignment
                  </ConfirmAction>
                )}
                {member && p.status === "pending" && !p.assigned_member_id && (
                  <Button
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () =>
                          api.post("/parcels/assign", {
                            codes: [p.code],
                            member_id: u?.id,
                          }),
                        "Pickup accepted.",
                      )
                    }
                  >
                    Accept pickup
                  </Button>
                )}
                {member && assigned && p.status === "assigned" && (
                  <Button onClick={() => setAction("verify-pickup")}>
                    <ShieldCheck size={15} />
                    Verify pickup
                  </Button>
                )}
                {member &&
                  holder &&
                  ["picked_up", "in_transit"].includes(p.status) && (
                    <Button
                      tone="secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () => command("out-for-delivery"),
                          "Out for delivery.",
                        )
                      }
                    >
                      Out for delivery
                    </Button>
                  )}
                {member &&
                  holder &&
                  ["picked_up", "in_transit", "out_for_delivery"].includes(
                    p.status,
                  ) && (
                    <>
                      <Button onClick={() => setAction("verify-delivery")}>
                        Verify delivery
                      </Button>
                      <Link
                        href={`/operations/transfers/new?codes=${p.code}`}
                        className="button secondary"
                      >
                        Create handover
                      </Link>
                    </>
                  )}
                {member &&
                  (holder || assigned) &&
                  !["delivered", "returned"].includes(p.status) && (
                    <Button
                      tone="secondary"
                      onClick={() => setAction("weight")}
                    >
                      Update weight
                    </Button>
                  )}
                {(sender || holder) &&
                  p.picked_up_at &&
                  !["delivered", "returned", "return_pending"].includes(
                    p.status,
                  ) && (
                    <Button
                      tone="secondary"
                      onClick={() => setAction("return-request")}
                    >
                      Request return
                    </Button>
                  )}
                {sender && p.status === "return_pending" && (
                  <ConfirmAction
                    title="Accept returned parcel?"
                    description="Confirm only after you have received the parcel back. This records the return handover."
                    onConfirm={() => api.post(`/parcels/${code}/return-accept`)}
                  >
                    Accept return
                  </ConfirmAction>
                )}
              </div>
              {(sender || u?.id === Number(p.recipient_id)) &&
                !["delivered", "returned"].includes(p.status) && (
                  <>
                    <div style={{ height: 18 }} />
                    <Button
                      tone="secondary"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          async () =>
                            setCodes(await api.get(`/parcels/${code}/codes`)),
                          "Verification codes loaded.",
                        )
                      }
                    >
                      <Eye size={15} />
                      View your verification codes
                    </Button>
                    {codes?.pickup && (
                      <div>
                        <small className="muted">
                          Pickup code · share at pickup only
                        </small>
                        <div className="code-box">{codes.pickup}</div>
                      </div>
                    )}
                    {codes?.delivery && (
                      <div>
                        <small className="muted">
                          Delivery code · share at delivery only
                        </small>
                        <div className="code-box">{codes.delivery}</div>
                      </div>
                    )}
                  </>
                )}
              {["delivered", "returned"].includes(p.status) && (
                <p style={{ fontSize: 11, margin: 0 }}>
                  This parcel’s journey is complete. Its history stays here for
                  your records.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>
      {action && (
        <Modal title={label(action)} onClose={() => setAction(undefined)}>
          <Form
            fields={fields}
            initial={{ weight_grams: p.weight_grams }}
            submit="Confirm update"
            onSubmit={(d) => command(action, d)}
          />
        </Modal>
      )}
    </>
  );
}
