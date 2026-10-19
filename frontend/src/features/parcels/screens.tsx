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
      ? locale === "bn"
        ? "আমার হেফাজতে থাকা পার্সেল"
        : "In your care"
      : view === "assigned"
        ? locale === "bn"
          ? "পিকআপের অনুরোধসমূহ"
          : "Your pickup requests"
        : mode === "admin"
          ? locale === "bn"
            ? "জেলা পার্সেল নিয়ন্ত্রণ"
            : "District parcel control"
          : mode === "operations"
            ? locale === "bn"
              ? "চলমান পার্সেলসমূহ"
              : "Parcels on the move"
            : locale === "bn"
              ? "আমার পার্সেলসমূহ"
              : "Your parcels";
  return (
    <>
      <PageHeading
        eyebrow={
          mode === "operations"
            ? locale === "bn"
              ? "ডেলিভারি অপারেশনস"
              : "DELIVERY OPERATIONS"
            : locale === "bn"
              ? "প্রতিটি পদক্ষেপের নিখুঁত হিসাব"
              : "EVERY JOURNEY, ACCOUNTED FOR"
        }
        title={title}
        description={
          locale === "bn"
            ? "সকল পার্সেল ও তার পরবর্তী পদক্ষেপের স্বচ্ছ তথ্য।"
            : "A clear view of every parcel and its next step."
        }
        action={
          <Link href="/dashboard/parcels/new" className="button primary">
            <Plus size={15} />
            {locale === "bn" ? "পার্সেল বুক করুন" : "Book a parcel"}
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
          { id: "", label: locale === "bn" ? "সকল পার্সেল" : "All parcels" },
          {
            id: "pending",
            label: locale === "bn" ? "পিকআপ অপেক্ষমান" : "Pending pickup",
          },
          {
            id: "in_transit",
            label: locale === "bn" ? "স্থানান্তরিত হচ্ছে" : "In transit",
          },
          {
            id: "delivered",
            label: locale === "bn" ? "ডেলিভারি সম্পন্ন" : "Delivered",
          },
          {
            id: "returned",
            label: locale === "bn" ? "রিটার্ন সম্পন্ন" : "Returned",
          },
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
          placeholder={
            locale === "bn"
              ? "পার্সেল আইডি, প্রাপক বা ফোন নম্বর দিয়ে খুঁজুন…"
              : "Search by parcel ID, recipient, or phone…"
          }
        />
        <select
          value={status}
          aria-label={
            locale === "bn" ? "পার্সেল অবস্থা অনুযায়ী ফিল্টার" : "Filter parcel status"
          }
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">
            {locale === "bn" ? "সকল স্ট্যাটাস" : "All statuses"}
          </option>
          {statuses.map((s) => (
            <option value={s} key={s}>
              {t[`status${s.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join("")}` as keyof typeof t] || label(s)}
            </option>
          ))}
        </select>
        {selected.length > 0 && (
          <>
            <Button tone="secondary" onClick={() => setAssign(true)}>
              {selected.length} {locale === "bn" ? "টি নির্বাচিত · রাইডার অ্যাসাইন" : "selected · Assign"}
            </Button>
            {mode !== "operations" && (
              <ConfirmAction
                title={
                  locale === "bn"
                    ? "নির্বাচিত পিকআপ অ্যাসাইনমেন্ট বাতিল করবেন?"
                    : "Cancel selected pickup assignments?"
                }
                description={
                  locale === "bn"
                    ? "নির্বাচিত পার্সেলগুলো অবশ্যই এখনও অ্যাসাইন অবস্থায় এবং পিকআপের পূর্বে থাকতে হবে।"
                    : "All selected parcels must still be assigned and awaiting physical pickup."
                }
                onConfirm={async () => {
                  await api.post("/parcels/cancel-assignments", {
                    codes: selected,
                  });
                  setSelected([]);
                }}
              >
                {locale === "bn"
                  ? "নির্বাচিত অ্যাসাইনমেন্ট বাতিল করুন"
                  : "Cancel selected assignments"}
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
                {locale === "bn" ? "হস্তান্তর তৈরি করুন" : "Create handover"}
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
                  <th>{locale === "bn" ? "পার্সেল ও তারিখ" : "Parcel & date"}</th>
                  <th>{locale === "bn" ? "প্রাপক" : "Recipient"}</th>
                  <th>{locale === "bn" ? "গন্তব্য" : "Destination"}</th>
                  <th>{t.status}</th>
                  <th>{locale === "bn" ? "চার্জ / সিওডি (COD)" : "Charge / COD"}</th>
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
            title={
              locale === "bn"
                ? "এই তালিকায় কোনো পার্সেল পাওয়া যায়নি"
                : "No parcels on this route yet."
            }
            description={
              locale === "bn"
                ? "ফিল্টার পরিবর্তন করুন, অথবা নতুন পার্সেল পাঠাতে বুক করুন।"
                : "Try another filter, or book a parcel to start a new journey."
            }
            action={
              <Link href="/dashboard/parcels/new" className="button primary">
                {locale === "bn" ? "নতুন পার্সেল বুক করুন" : "Book your first parcel"}{" "}
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
        label={locale === "bn" ? "পার্সেল তালিকায় ফিরুন" : "Back to your parcels"}
      />
      <PageHeading
        eyebrow={
          locale === "bn"
            ? "নতুন যাত্রা শুরু হোক এখান থেকেই"
            : "A NEW JOURNEY STARTS HERE"
        }
        title={locale === "bn" ? "নতুন পার্সেল বুক করুন" : "Let’s send something good."}
        description={
          locale === "bn"
            ? "কোথায় পাঠাতে চান জানান, বাকি দায়িত্ব আমাদের।"
            : "Tell us where it’s going. We’ll take it from here."
        }
      />
      <div className="detail-grid">
        <Panel
          title={
            locale === "bn"
              ? "পার্সেল ও ডেলিভারি বিবরণ"
              : "Parcel & delivery details"
          }
        >
          <Form
            initial={{
              pickup_address: session?.user?.address || "",
              weight_grams: 1000,
              cod_enabled: false,
            }}
            submit={locale === "bn" ? "পার্সেল বুক করুন" : "Book parcel"}
            fields={[
              {
                name: "delivery_name",
                label: locale === "bn" ? "প্রাপকের নাম" : "Recipient’s name",
                required: true,
                placeholder:
                  locale === "bn"
                    ? "কার কাছে পাঠানো হচ্ছে?"
                    : "Who’s it going to?",
              },
              {
                name: "delivery_phone",
                label: locale === "bn" ? "প্রাপকের ফোন নম্বর" : "Recipient’s phone",
                required: true,
                type: "tel",
                placeholder: "01XXXXXXXXX",
              },
              {
                name: "delivery_address",
                label:
                  locale === "bn"
                    ? "সম্পূর্ণ ডেলিভারি ঠিকানা"
                    : "Full delivery address",
                required: true,
                type: "textarea",
                placeholder:
                  locale === "bn"
                    ? "বাসা, সড়ক, এলাকা এবং ডেলিভারি নির্দেশিকা"
                    : "House, road, area, and delivery instructions",
              },
              {
                name: "delivery_district",
                label: locale === "bn" ? "জেলা" : "Delivery district",
                placeholder: locale === "bn" ? "জেলা (ঐচ্ছিক)" : "District (optional)",
              },
              {
                name: "delivery_upazila",
                label:
                  locale === "bn" ? "উপজেলা / থানা" : "Delivery upazila",
                placeholder:
                  locale === "bn" ? "উপজেলা (ঐচ্ছিক)" : "Upazila (optional)",
              },
              {
                name: "pickup_address",
                label: locale === "bn" ? "পিকআপের ঠিকানা" : "Pickup address",
                required: true,
                type: "textarea",
              },
              {
                name: "weight_grams",
                label: locale === "bn" ? "ওজন (গ্রামে)" : "Weight in grams",
                type: "number",
                required: true,
                min: 1,
                max: 1000000,
                help:
                  locale === "bn"
                    ? "১ কেজি = ১,০০০ গ্রাম"
                    : "1 kilogram = 1,000 grams",
              },
              {
                name: "cod_enabled",
                label:
                  locale === "bn"
                    ? "ক্যাশ অন ডেলিভারি (COD) সংগ্রহ করুন"
                    : "Collect cash on delivery",
                type: "checkbox",
              },
              {
                name: "cod_amount",
                label:
                  locale === "bn"
                    ? "সিওডি (COD) পরিমাণ (৳)"
                    : "COD amount (৳)",
                type: "number",
                min: 0.01,
                step: "0.01",
                help:
                  locale === "bn"
                    ? "পণ্যের মোট মূল্য (ডেলিভারি চার্জ ব্যতীত)"
                    : "Product amount to collect, excluding delivery charge",
              },
              {
                name: "note",
                label:
                  locale === "bn"
                    ? "ডেলিভারি টিমের জন্য বিশেষ নির্দেশিকা"
                    : "A note for the delivery team",
                type: "textarea",
              },
              {
                name: "terms_accepted",
                label:
                  locale === "bn"
                    ? "আমি উল্লেখিত শর্তাবলী ও নীতিমালা পড়েছি এবং সম্মত আছি।"
                    : "I have read and agree to the Terms & conditions linked below.",
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
              {locale === "bn"
                ? "শর্তাবলী ও নীতিমালা পড়ুন →"
                : "Read Terms & conditions →"}
            </Link>
          </div>
        </Panel>
        <div>
          <Panel
            title={
              locale === "bn"
                ? "সহজ ও স্বচ্ছ ডেলিভারি চার্জ"
                : "Simple, transparent delivery"
            }
          >
            <div className="panel-body">
              <div className="key-value">
                <span>{locale === "bn" ? "প্রথম ১ কেজি পর্যন্ত" : "Up to 1 kg"}</span>
                <strong>{money(data?.rates.base_charge || 60)}</strong>
              </div>
              <div className="key-value">
                <span>
                  {locale === "bn"
                    ? "প্রতি অতিরিক্ত ১০০ গ্রাম"
                    : "Each additional started 100 g"}
                </span>
                <strong>{money(data?.rates.extra_per_100g || 3)}</strong>
              </div>
              <p style={{ fontSize: 11, marginTop: 18 }}>
                {locale === "bn"
                  ? "পার্সেলের ওজনের ওপর ভিত্তি করে চূড়ান্ত চার্জ নির্ধারিত হয়। পিকআপের সময় রাইডার ওজন যাচাই ও হালনাগাদ করতে পারেন।"
                  : "The final charge is calculated from your parcel’s weight. Your pickup member may verify and update its weight."}
              </p>
              <div className="info-notice">
                <ShieldCheck size={18} />
                <p>
                  {locale === "bn"
                    ? "পিকআপ এবং ডেলিভারিতে ওটিপি/ভেরিফিকেশন কোড ব্যবহৃত হয়। পার্সেল হস্তান্তরের পরই কেবল সঠিক কোডটি শেয়ার করুন।"
                    : "Pickup and delivery use verification codes. Only share the right code when the handover takes place."}
                </p>
              </div>
              <div className="info-notice">
                <Package size={18} />
                <p>
                  {locale === "bn"
                    ? "যত্নসহকারে পার্সেলটি প্যাকিং ও সিল করুন এবং প্রাপকের বিস্তারিত যোগাযোগ প্রস্তুত রাখুন।"
                    : "Pack it with care. Seal your parcel and keep the recipient’s contact details handy."}
                </p>
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
