"use client";
import { useAction, useI18n, useSession } from "@/components/providers";
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
import { api, date, label, money } from "@/lib/api";
import { translateStatus } from "@/lib/i18n";
import type { Paged, Parcel, User } from "@/lib/types";
import { memberRoles } from "@/lib/types";
import {
  ArrowRight,
  Eye,
  MessageCircle,
  Package,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const statuses = [
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "return_pending",
  "returned",
];
export function ParcelListScreen({
  mode = "customer",
  view,
}: {
  mode?: "customer" | "operations" | "admin";
  view?: string;
}) {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [status, setStatus] = useState("");
  const [bucket, setBucket] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [assign, setAssign] = useState(false);
  const router = useRouter();
  const query = new URLSearchParams({
    search,
    status,
    bucket,
    page: String(page),
  });
  if (mode === "customer") query.set("mine", "1");
  if (view) query.set("view", view);
  const { data, error, loading, reload } = useResource<Paged<Parcel>>(
    `/parcels?${query}`,
  );
  const { data: members } = useResource<{
    data: Pick<User, "id" | "name" | "role">[];
  }>(assign ? "/members" : null);
  const title =
    view === "custody"
      ? t("nav.operations.custody")
      : view === "assigned"
        ? t("nav.operations.requests")
        : mode === "admin"
          ? t("nav.admin.parcels")
          : mode === "operations"
            ? t("nav.operations.overview")
            : t("parcels.listTitle");
  return (
    <>
      <PageHeading
        eyebrow={
          mode === "operations"
            ? t("parcels.listEyebrowOps")
            : t("parcels.listEyebrowCustomer")
        }
        title={title}
        description={t("parcels.listDescription")}
        action={
          <Link href="/dashboard/parcels/new" className="button primary">
            <Plus size={15} />
            {t("parcels.bookParcel")}
          </Link>
        }
      />
      <Tabs
        active={status}
        onChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        items={[
          { id: "", label: t("parcels.tabs.all") },
          { id: "pending", label: t("parcels.tabs.pending") },
          { id: "in_transit", label: t("parcels.tabs.inTransit") },
          { id: "delivered", label: t("parcels.tabs.delivered") },
          { id: "returned", label: t("parcels.tabs.returned") },
        ]}
      />
      <div className="filter-row">
        {mode === "operations" && (
          <select
            aria-label="Filter custody list"
            value={bucket}
            onChange={(e) => {
              setBucket(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All lists</option>
            {["pickup", "custody", "delivery", "return_pending"].map((v) => (
              <option key={v} value={v}>
                {label(v)}
              </option>
            ))}
          </select>
        )}
        <SearchInput
          value={search}
          onChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          placeholder={t("parcels.searchPlaceholder")}
        />
        <select
          value={status}
          aria-label={t("parcels.filterStatusAria")}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("parcels.allStatuses")}</option>
          {statuses.map((s) => (
            <option value={s} key={s}>
              {translateStatus(s, locale)}
            </option>
          ))}
        </select>
        {selected.length > 0 && (
          <>
            <Button tone="secondary" onClick={() => setAssign(true)}>
              {t("parcels.selectedAssign", { count: selected.length })}
            </Button>
            {mode !== "operations" && (
              <ConfirmAction
                title={t("parcels.cancelConfirmTitle")}
                description={t("parcels.cancelConfirmDesc")}
                onConfirm={async () => {
                  await api.post("/parcels/cancel-assignments", {
                    codes: selected,
                  });
                  setSelected([]);
                }}
              >
                {t("parcels.cancelSelected")}
              </ConfirmAction>
            )}
            {mode === "operations" && (
              <Button
                onClick={async () => {
                  router.push(
                    `/operations/transfers/new?codes=${selected.join(",")}`,
                  );
                }}
              >
                {t("parcels.createHandover")}
              </Button>
            )}
          </>
        )}
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
                  <th>
                    <input
                      type="checkbox"
                      aria-label="Select all parcels on this page"
                      checked={data.data.every((p) =>
                        selected.includes(p.code),
                      )}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? data.data.map((p) => p.code) : [],
                        )
                      }
                    />
                  </th>
                  <th>{t("parcels.colParcelDate")}</th>
                  <th>{t("parcels.colRecipient")}</th>
                  <th>{t("parcels.colDestination")}</th>
                  <th>{t("parcels.colStatus")}</th>
                  <th>{t("parcels.colChargeCod")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select RFD${p.code}`}
                        checked={selected.includes(p.code)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, p.code]
                              : selected.filter((c) => c !== p.code),
                          )
                        }
                      />
                    </td>
                    <td>
                      <Link href={`/dashboard/parcels/${p.code}`}>
                        <strong>RFD{p.code}</strong>
                        <small>{date(p.created_at)}</small>
                      </Link>
                    </td>
                    <td>
                      {p.delivery_name}
                      <small>{p.delivery_phone}</small>
                    </td>
                    <td>
                      {p.delivery_district || "Bangladesh"}
                      <small>{p.delivery_upazila}</small>
                    </td>
                    <td>
                      <Badge value={p.status} />
                    </td>
                    <td>
                      <strong>{money(p.delivery_charge)}</strong>
                      <small>
                        {p.cod_enabled
                          ? `COD ${money(p.cod_amount)}`
                          : "No COD"}
                      </small>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/parcels/${p.code}`}
                        className="icon-button"
                        aria-label={`View RFD${p.code}`}
                      >
                        <ArrowRight size={16} />
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
            title={t("parcels.noParcelsTitle")}
            description={t("parcels.noParcelsDesc")}
            action={
              <Link href="/dashboard/parcels/new" className="button primary">
                {t("parcels.bookFirstParcel")}{" "}
                <Plus size={15} />
              </Link>
            }
          />
        </Panel>
      )}
      {assign && (
        <Modal title="Assign a pickup batch" onClose={() => setAssign(false)}>
          <Form
            fields={[
              {
                name: "member_id",
                label: "Rider or agent",
                required: true,
                options: (members?.data || []).map((u) => ({
                  value: String(u.id),
                  label: `${u.name} · ${label(u.role)}`,
                })),
              },
            ]}
            submit="Assign selected parcels"
            onSubmit={async (d) => {
              await api.post("/parcels/assign", {
                codes: selected,
                member_id: Number(d.member_id),
              });
              setSelected([]);
              setAssign(false);
            }}
          />
        </Modal>
      )}
    </>
  );
}
export function BookParcelScreen() {
  const { session } = useSession();
  const router = useRouter();
  const { t, locale } = useI18n();
  const { data } = useResource<{
    rates: { base_charge: string; extra_per_100g: string };
  }>("/config");
  return (
    <>
      <BackLink
        href="/dashboard/parcels"
        label={t("parcels.backToList")}
      />
      <PageHeading
        eyebrow={t("parcels.newEyebrow")}
        title={t("parcels.newTitle")}
        description={t("parcels.newDescription")}
      />
      <div className="detail-grid">
        <Panel title={t("parcels.formTitle")}>
          <Form
            initial={{
              pickup_address: session?.user?.address || "",
              weight_grams: 1000,
              cod_enabled: false,
            }}
            submit={t("parcels.submitBook")}
            fields={[
              {
                name: "delivery_name",
                label: t("parcels.recipientName"),
                required: true,
                placeholder: t("parcels.recipientNamePlaceholder"),
              },
              {
                name: "delivery_phone",
                label: t("parcels.recipientPhone"),
                required: true,
                type: "tel",
                placeholder: "01XXXXXXXXX",
              },
              {
                name: "delivery_address",
                label: t("parcels.recipientAddress"),
                required: true,
                type: "textarea",
                placeholder: t("parcels.recipientAddressPlaceholder"),
              },
              {
                name: "delivery_district",
                label: t("parcels.district"),
                placeholder: t("parcels.districtPlaceholder"),
              },
              {
                name: "delivery_upazila",
                label: t("parcels.upazila"),
                placeholder: t("parcels.upazilaPlaceholder"),
              },
              {
                name: "pickup_address",
                label: t("parcels.pickupAddress"),
                required: true,
                type: "textarea",
              },
              {
                name: "weight_grams",
                label: t("parcels.weightGrams"),
                type: "number",
                required: true,
                min: 1,
                max: 1000000,
                help: t("parcels.weightHelp"),
              },
              {
                name: "cod_enabled",
                label: t("parcels.codEnabled"),
                type: "checkbox",
              },
              {
                name: "cod_amount",
                label: t("parcels.codAmount"),
                type: "number",
                min: 0.01,
                step: "0.01",
                help: t("parcels.codHelp"),
              },
              {
                name: "note",
                label: t("parcels.note"),
                type: "textarea",
              },
              {
                name: "terms_accepted",
                label: t("parcels.termsAccepted"),
                type: "checkbox",
                required: true,
              },
            ]}
            onSubmit={async (d) => {
              const out = await api.post<{ parcel: Parcel }>("/parcels", {
                ...d,
                weight_grams: Number(d.weight_grams),
                cod_amount: d.cod_enabled ? d.cod_amount : null,
              });
              router.push(`/dashboard/parcels/${out.parcel.code}`);
            }}
          />
          <div className="panel-body">
            <Link href="/terms" target="_blank" className="text-link">
              {t("parcels.readTerms")}
            </Link>
          </div>
        </Panel>
        <div>
          <Panel title={t("parcels.ratePanelTitle")}>
            <div className="panel-body">
              <div className="key-value">
                <span>{t("parcels.rateBase")}</span>
                <strong>{money(data?.rates.base_charge || 60)}</strong>
              </div>
              <div className="key-value">
                <span>{t("parcels.rateExtra")}</span>
                <strong>{money(data?.rates.extra_per_100g || 3)}</strong>
              </div>
              <p style={{ fontSize: 11, marginTop: 18 }}>
                {t("parcels.rateExplanation")}
              </p>
              <div className="info-notice">
                <ShieldCheck size={18} />
                <p>{t("parcels.otpNotice")}</p>
              </div>
              <div className="info-notice">
                <Package size={18} />
                <p>{t("parcels.packingNotice")}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
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
